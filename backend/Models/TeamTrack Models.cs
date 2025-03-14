using System.Text.Json.Serialization;

namespace TeamTrack.Models
{
    public class AppSettings
    {
        public string JwtSecret { get; set; } = string.Empty;
        public string GoogleClientId { get; set; } = string.Empty;
    }

    public class User
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Picture { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime LastLoginAt { get; set; } = DateTime.UtcNow;
    }

    public class TeamMember
    {
        public string Id { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Avatar { get; set; } = string.Empty;
        public List<Habit> Habits { get; set; } = new List<Habit>();
    }

    public class Habit
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Streak { get; set; }
        public bool CompletedToday { get; set; }
        public bool[] LastWeek { get; set; } = new bool[7];
    }

    public class TeamStats
    {
        public int CompletedHabits { get; set; }
        public int TotalHabits { get; set; }
        public int CompletionRate { get; set; }
        public TeamMember? TopStreaker { get; set; }
        public int TeamMemberCount { get; set; }
    }

    public class MemberStats
    {
        public int CompletedHabits { get; set; }
        public int TotalHabits { get; set; }
        public int CompletionRate { get; set; }
        public int LongestStreak { get; set; }
    }

    // Request/Response DTOs
    public class GoogleAuthRequest
    {
        public string Credential { get; set; } = string.Empty;
    }

    public class GoogleTokenValidationResult
    {
        public bool IsValid { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Picture { get; set; }
    }

    public class AddHabitRequest
    {
        public string MemberId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
    }

    public class UpdateHabitRequest
    {
        public string MemberId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
    }
}