using TeamTrack.Models;

namespace TeamTrack.Services
{
    public interface IUserService
    {
        Task<GoogleTokenValidationResult> ValidateGoogleTokenAsync(string token);
        Task<User> GetOrCreateUserFromGoogleAsync(string userId, string name, string email, string? picture);
        Task<User?> GetUserByIdAsync(string userId);
    }

    public interface ITeamService
    {
        Task<bool> CheckUserExistsInTeamAsync(string userId);
        Task<IEnumerable<User>> GetAllUsersAsync();

        Task<TeamMember> AddTeamMemberAsync(TeamMember member);
        Task<IEnumerable<TeamMember>> GetAllTeamMembersAsync();
        Task<TeamMember?> GetTeamMemberByIdAsync(string id);
        Task<TeamMember?> GetTeamMemberByUserIdAsync(string userId);
        Task<bool> CanUserEditMemberAsync(string userId, string memberId);
        Task<TeamStats> GetTeamStatsAsync();
        Task<IEnumerable<string>> GetAllHabitNamesAsync();
    }

    public interface IHabitService
    {
        Task<Habit> AddHabitAsync(string memberId, Habit habit);
        Task<bool> UpdateHabitAsync(string memberId, int habitId, string name);
        Task<bool> DeleteHabitAsync(string memberId, int habitId);
        Task<Habit?> ToggleHabitCompletionAsync(string memberId, int habitId);
    }
}