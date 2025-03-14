using Microsoft.Extensions.Options;
using Microsoft.EntityFrameworkCore;
using Google.Apis.Auth;
using TeamTrack.Models;
using TeamTrack.Data;

namespace TeamTrack.Services
{
    public class UserService : IUserService
    {
        private readonly AppDbContext _context;
        private readonly AppSettings _appSettings;

        public UserService(AppDbContext context, IOptions<AppSettings> appSettings)
        {
            _context = context;
            _appSettings = appSettings.Value;
        }

        public async Task<GoogleTokenValidationResult> ValidateGoogleTokenAsync(string token)
        {
            try
            {
                var settings = new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new[] { _appSettings.GoogleClientId }
                };

                var payload = await GoogleJsonWebSignature.ValidateAsync(token, settings);

                return new GoogleTokenValidationResult
                {
                    IsValid = true,
                    UserId = payload.Subject, // Google User ID
                    Name = payload.Name,
                    Email = payload.Email,
                    Picture = payload.Picture
                };
            }
            catch (Exception)
            {
                return new GoogleTokenValidationResult { IsValid = false };
            }
        }

        public async Task<User> GetOrCreateUserFromGoogleAsync(string userId, string name, string email, string? picture)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                user = new User
                {
                    Id = userId,
                    Name = name,
                    Email = email,
                    Picture = picture,
                    CreatedAt = DateTime.UtcNow,
                    LastLoginAt = DateTime.UtcNow
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();
            }
            else
            {
                // Update user information and last login
                user.Name = name;
                user.Email = email;
                user.Picture = picture;
                user.LastLoginAt = DateTime.UtcNow;

                _context.Users.Update(user);
                await _context.SaveChangesAsync();
            }

            return user;
        }

        public async Task<User?> GetUserByIdAsync(string userId)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        }
    }



    public class TeamService : ITeamService
    {
        private readonly AppDbContext _context;

        public TeamService(AppDbContext context)
        {
            _context = context;
        }
        public async Task<bool> CheckUserExistsInTeamAsync(string userId)
        {
            return await _context.TeamMembers.AnyAsync(m => m.UserId == userId);
        }

        public async Task<IEnumerable<User>> GetAllUsersAsync()
        {
            return await _context.Users.ToListAsync();
        }

        public async Task<TeamMember> AddTeamMemberAsync(TeamMember member)
        {
            _context.TeamMembers.Add(member);
            await _context.SaveChangesAsync();
            return member;
        }

        public async Task<IEnumerable<TeamMember>> GetAllTeamMembersAsync()
        {
            return await _context.TeamMembers.ToListAsync();
        }

        public async Task<TeamMember?> GetTeamMemberByIdAsync(string id)
        {
            return await _context.TeamMembers.FirstOrDefaultAsync(m => m.Id == id);
        }

        public async Task<TeamMember?> GetTeamMemberByUserIdAsync(string userId)
        {
            return await _context.TeamMembers.FirstOrDefaultAsync(m => m.UserId == userId);
        }

        public async Task<bool> CanUserEditMemberAsync(string userId, string memberId)
        {
            var member = await GetTeamMemberByIdAsync(memberId);
            return member != null && member.UserId == userId;
        }

        public async Task<TeamStats> GetTeamStatsAsync()
        {
            var members = await _context.TeamMembers.ToListAsync();

            int completedHabits = 0;
            int totalHabits = 0;
            TeamMember? topStreaker = null;
            int highestStreak = 0;

            foreach (var member in members)
            {
                totalHabits += member.Habits.Count;
                completedHabits += member.Habits.Count(h => h.CompletedToday);

                int memberHighestStreak = member.Habits.Any() ? member.Habits.Max(h => h.Streak) : 0;
                if (memberHighestStreak > highestStreak)
                {
                    highestStreak = memberHighestStreak;
                    topStreaker = member;
                }
            }

            return new TeamStats
            {
                CompletedHabits = completedHabits,
                TotalHabits = totalHabits,
                CompletionRate = totalHabits > 0 ? (int)((double)completedHabits / totalHabits * 100) : 0,
                TopStreaker = topStreaker,
                TeamMemberCount = members.Count
            };
        }

        public async Task<IEnumerable<string>> GetAllHabitNamesAsync()
        {
            var members = await _context.TeamMembers.ToListAsync();
            var habitNames = new HashSet<string>();

            foreach (var member in members)
            {
                foreach (var habit in member.Habits)
                {
                    habitNames.Add(habit.Name);
                }
            }

            return habitNames;
        }
    
    }

    public class HabitService : IHabitService
    {
        private readonly AppDbContext _context;

        public HabitService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Habit> AddHabitAsync(string memberId, Habit habit)
        {
            var member = await _context.TeamMembers.FirstOrDefaultAsync(m => m.Id == memberId);
            if (member == null)
            {
                throw new ArgumentException("Team member not found");
            }

            // Generate a new ID for the habit
            if (member.Habits.Any())
            {
                habit.Id = member.Habits.Max(h => h.Id) + 1;
            }
            else
            {
                habit.Id = 1;
            }

            member.Habits.Add(habit);
            await _context.SaveChangesAsync();

            return habit;
        }

        public async Task<bool> UpdateHabitAsync(string memberId, int habitId, string name)
        {
            var member = await _context.TeamMembers.FirstOrDefaultAsync(m => m.Id == memberId);
            if (member == null)
            {
                return false;
            }

            var habit = member.Habits.FirstOrDefault(h => h.Id == habitId);
            if (habit == null)
            {
                return false;
            }

            habit.Name = name;
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteHabitAsync(string memberId, int habitId)
        {
            var member = await _context.TeamMembers.FirstOrDefaultAsync(m => m.Id == memberId);
            if (member == null)
            {
                return false;
            }

            var habit = member.Habits.FirstOrDefault(h => h.Id == habitId);
            if (habit == null)
            {
                return false;
            }

            member.Habits.Remove(habit);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<Habit?> ToggleHabitCompletionAsync(string memberId, int habitId)
        {
            var member = await _context.TeamMembers.FirstOrDefaultAsync(m => m.Id == memberId);
            if (member == null)
            {
                return null;
            }

            var habit = member.Habits.FirstOrDefault(h => h.Id == habitId);
            if (habit == null)
            {
                return null;
            }

            // Toggle completion status
            habit.CompletedToday = !habit.CompletedToday;

            // Update streak
            if (habit.CompletedToday)
            {
                habit.Streak++;

                // Shift the LastWeek array and update today's status
                for (int i = habit.LastWeek.Length - 1; i > 0; i--)
                {
                    habit.LastWeek[i] = habit.LastWeek[i - 1];
                }
                habit.LastWeek[0] = true;
            }
            else
            {
                habit.Streak = Math.Max(0, habit.Streak - 1);

                // Update today's status in LastWeek array
                habit.LastWeek[0] = false;
            }

            await _context.SaveChangesAsync();

            return habit;
        }
    }
}