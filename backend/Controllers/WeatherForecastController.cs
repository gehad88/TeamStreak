using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TeamTrack.Models;
using TeamTrack.Services;

namespace TeamTrack.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly ITeamService _teamService;
        private readonly AppSettings _appSettings;

        public UsersController(
            IUserService userService,
            ITeamService teamService,
            IOptions<AppSettings> appSettings)
        {
            _userService = userService;
            _teamService = teamService;
            _appSettings = appSettings.Value;
        }

        [HttpPost("google-auth")]
        public async Task<IActionResult> GoogleAuth([FromBody] GoogleAuthRequest request)
        {
            try
            {
                // Validate the Google token
                var validationResult = await _userService.ValidateGoogleTokenAsync(request.Credential);
                if (!validationResult.IsValid)
                {
                    return BadRequest(new { message = "Invalid Google token" });
                }

                // Get or create user
                var user = await _userService.GetOrCreateUserFromGoogleAsync(validationResult.UserId,
                    validationResult.Name, validationResult.Email, validationResult.Picture);

                // Generate JWT token
                var token = GenerateJwtToken(user);

                // Check if user is part of a team, if not, create their record
                var existsInTeam = await _teamService.CheckUserExistsInTeamAsync(user.Id);
                if (!existsInTeam)
                {
                    await _teamService.AddTeamMemberAsync(new TeamMember
                    {
                        UserId = user.Id,
                        Name = user.Name,
                        Avatar = user.Picture ?? "/api/placeholder/40/40",
                        Habits = new List<Habit>()
                    });
                }

                return Ok(new
                {
                    id = user.Id,
                    name = user.Name,
                    email = user.Email,
                    picture = user.Picture,
                    token
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred during authentication", error = ex.Message });
            }
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var user = await _userService.GetUserByIdAsync(userId);
            if (user == null)
            {
                return NotFound();
            }

            return Ok(new
            {
                id = user.Id,
                name = user.Name,
                email = user.Email,
                picture = user.Picture
            });
        }

        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_appSettings.JwtSecret);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id),
                    new Claim(ClaimTypes.Name, user.Name),
                    new Claim(ClaimTypes.Email, user.Email)
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TeamController : ControllerBase
    {
        private readonly ITeamService _teamService;

        public TeamController(ITeamService teamService)
        {
            _teamService = teamService;
        }

        [HttpGet("members")]
        public async Task<IActionResult> GetTeamMembers()
        {
            var members = await _teamService.GetAllTeamMembersAsync();
            return Ok(members);
        }

        [HttpGet("members/{id}")]
        public async Task<IActionResult> GetTeamMember(string id)
        {
            var member = await _teamService.GetTeamMemberByIdAsync(id);
            if (member == null)
            {
                return NotFound();
            }

            return Ok(member);
        }

        [HttpGet("AllUSers")]
        public async Task<IActionResult> GetAllUsersAsync()
        {
            return Ok(await _teamService.GetAllUsersAsync());
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetTeamStats()
        {
            var stats = await _teamService.GetTeamStatsAsync();
            return Ok(stats);
        }

        [HttpGet("habit-names")]
        public async Task<IActionResult> GetAllHabitNames()
        {
            var habitNames = await _teamService.GetAllHabitNamesAsync();
            return Ok(habitNames);
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class HabitsController : ControllerBase
    {
        private readonly IHabitService _habitService;
        private readonly ITeamService _teamService;

        public HabitsController(IHabitService habitService, ITeamService teamService)
        {
            _habitService = habitService;
            _teamService = teamService;
        }

        [HttpPost]
        public async Task<IActionResult> AddHabit([FromBody] AddHabitRequest request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // Verify this is the user's own habit
            var canEdit = await _teamService.CanUserEditMemberAsync(userId, request.MemberId);
            if (!canEdit)
            {
                return Forbid();
            }

            var habit = new Habit
            {
                Name = request.Name,
                Streak = 0,
                CompletedToday = false,
                LastWeek = Enumerable.Repeat(false, 7).ToArray()
            };

            var newHabit = await _habitService.AddHabitAsync(request.MemberId, habit);
            return Ok(newHabit);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateHabit(int id, [FromBody] UpdateHabitRequest request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // Verify this is the user's own habit
            var canEdit = await _teamService.CanUserEditMemberAsync(userId, request.MemberId);
            if (!canEdit)
            {
                return Forbid();
            }

            var success = await _habitService.UpdateHabitAsync(request.MemberId, id, request.Name);
            if (!success)
            {
                return NotFound();
            }

            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteHabit(int id, [FromQuery] string memberId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // Verify this is the user's own habit
            var canEdit = await _teamService.CanUserEditMemberAsync(userId, memberId);
            if (!canEdit)
            {
                return Forbid();
            }

            var success = await _habitService.DeleteHabitAsync(memberId, id);
            if (!success)
            {
                return NotFound();
            }

            return Ok();
        }

        [HttpPut("{id}/toggle")]
        public async Task<IActionResult> ToggleHabit(int id, [FromQuery] string memberId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // Verify this is the user's own habit
            var canEdit = await _teamService.CanUserEditMemberAsync(userId, memberId);
            if (!canEdit)
            {
                return Forbid();
            }

            var updatedHabit = await _habitService.ToggleHabitCompletionAsync(memberId, id);
            if (updatedHabit == null)
            {
                return NotFound();
            }

            return Ok(updatedHabit);
        }
    }
}