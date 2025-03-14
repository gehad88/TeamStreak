import React, { createContext, useState, useContext, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { teamApi } from "../services/api";

const TeamContext = createContext();

export const useTeam = () => {
  const context = useContext(TeamContext);
  
  if (!context) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  
  return context;
};

export const TeamProvider = ({ children }) => {
  const { user } = useAuth();
  // Sample data - in a real app, this would come from a database
  const [teamMembers, setTeamMembers] = useState([
    {
      id: 1,
      userId: 1,
      name: "Alex Chen",
      avatar: "/api/placeholder/40/40",
      habits: [
        {
          id: 1,
          name: "Morning Exercise",
          streak: 7,
          completedToday: true,
          lastWeek: [true, true, false, true, true, true, true],
        },
        {
          id: 2,
          name: "Read 30 minutes",
          streak: 12,
          completedToday: true,
          lastWeek: [true, true, true, true, true, true, true],
        },
        {
          id: 3,
          name: "Team Check-in",
          streak: 3,
          completedToday: false,
          lastWeek: [true, false, true, false, false, true, false],
        },
      ],
    },
    {
      id: 2,
      userId: 2,
      name: "Taylor Adams",
      avatar: "/api/placeholder/40/40",
      habits: [
        {
          id: 1,
          name: "Morning Exercise",
          streak: 3,
          completedToday: false,
          lastWeek: [false, true, false, true, false, true, false],
        },
        {
          id: 2,
          name: "Read 30 minutes",
          streak: 0,
          completedToday: false,
          lastWeek: [false, false, false, true, false, false, false],
        },
        {
          id: 3,
          name: "Team Check-in",
          streak: 5,
          completedToday: true,
          lastWeek: [true, true, false, true, true, false, true],
        },
      ],
    },
    {
      id: 3,
      userId: 3,
      name: "Jordan Smith",
      avatar: "/api/placeholder/40/40",
      habits: [
        {
          id: 1,
          name: "Morning Exercise",
          streak: 15,
          completedToday: true,
          lastWeek: [true, true, true, true, true, true, true],
        },
        {
          id: 2,
          name: "Read 30 minutes",
          streak: 4,
          completedToday: true,
          lastWeek: [false, true, true, false, true, false, true],
        },
        {
          id: 3,
          name: "Team Check-in",
          streak: 7,
          completedToday: true,
          lastWeek: [true, true, true, true, true, true, true],
        },
      ],
    },
  ]);

  // Get all unique habit names across all team members
  const getAllHabitNames = useCallback(() => {
    const habitSet = new Set();
    teamMembers.forEach((member) => {
      member.habits.forEach((habit) => {
        habitSet.add(habit.name);
      });
    });
    return Array.from(habitSet);
  }, [teamMembers]);

  // Calculate team stats
  const calculateStats = useCallback(() => {
    const totalHabits = teamMembers.reduce(
      (sum, member) => sum + member.habits.length,
      0
    );
    const completedHabits = teamMembers.reduce(
      (sum, member) =>
        sum + member.habits.filter((h) => h.completedToday).length,
      0
    );
    const completionRate =
      totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;

    const topStreaker = [...teamMembers].sort((a, b) => {
      const maxStreakA = Math.max(...a.habits.map((h) => h.streak));
      const maxStreakB = Math.max(...b.habits.map((h) => h.streak));
      return maxStreakB - maxStreakA;
    })[0];

    return { completedHabits, totalHabits, completionRate, topStreaker };
  }, [teamMembers]);

  // Calculate member stats
  const calculateMemberStats = useCallback((memberId) => {
    const member = teamMembers.find(m => m.id === memberId);
    if (!member) return { completedHabits: 0, totalHabits: 0, completionRate: 0, longestStreak: 0 };
    
    const totalHabits = member.habits.length;
    const completedHabits = member.habits.filter(
      (h) => h.completedToday
    ).length;
    const completionRate =
      totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;
    const longestStreak = Math.max(0, ...member.habits.map((h) => h.streak));

    return { completedHabits, totalHabits, completionRate, longestStreak };
  }, [teamMembers]);

  // Toggle habit completion
  const toggleHabitCompletion = useCallback(async (memberId, habitId) => {
    try {
      const member = teamMembers.find(m => m.id === memberId);
      const habit = member?.habits.find(h => h.id === habitId);
      
      if (!member || !habit) return;
      
      const newCompletionState = !habit.completedToday;
      
      // Optimistic update
      setTeamMembers(prevMembers => 
        prevMembers.map(m => {
          if (m.id === memberId) {
            return {
              ...m,
              habits: m.habits.map(h => {
                if (h.id === habitId) {
                  const newStreak = newCompletionState ? h.streak + 1 : 0;
                  return {
                    ...h,
                    completedToday: newCompletionState,
                    streak: newStreak
                  };
                }
                return h;
              })
            };
          }
          return m;
        })
      );
      
      // Call API
      await teamApi.updateHabitCompletion(memberId, habitId, newCompletionState);
    } catch (error) {
      console.error('Error toggling habit completion:', error);
      // Revert the optimistic update if API call fails
    }
  }, [teamMembers]);

  // Add a new habit
  const addHabit = useCallback(async (memberId, habitName) => {
    if (!habitName.trim()) return;
    
    try {
      // Call API
      const newHabit = await teamApi.addHabit(memberId, habitName);
      
      // Update local state
      setTeamMembers(prevMembers =>
        prevMembers.map(member => {
          if (member.id === memberId) {
            return {
              ...member,
              habits: [...member.habits, newHabit]
            };
          }
          return member;
        })
      );
    } catch (error) {
      console.error('Error adding habit:', error);
    }
  }, []);

  // Update habit
  const updateHabit = useCallback(async (memberId, habitId, habitName) => {
    if (!habitName.trim()) return;
    
    try {
      // Call API
      await teamApi.updateHabit(memberId, habitId, habitName);
      
      // Update local state
      setTeamMembers(prevMembers =>
        prevMembers.map(member => {
          if (member.id === memberId) {
            return {
              ...member,
              habits: member.habits.map(habit => {
                if (habit.id === habitId) {
                  return { ...habit, name: habitName };
                }
                return habit;
              })
            };
          }
          return member;
        })
      );
    } catch (error) {
      console.error('Error updating habit:', error);
    }
  }, []);

  // Delete habit
  const deleteHabit = useCallback(async (memberId, habitId) => {
    if (!window.confirm('Are you sure you want to delete this habit? This action cannot be undone.')) 
      return;
    
    try {
      // Call API
      await teamApi.deleteHabit(memberId, habitId);
      
      // Update local state
      setTeamMembers(prevMembers =>
        prevMembers.map(member => {
          if (member.id === memberId) {
            return {
              ...member,
              habits: member.habits.filter(habit => habit.id !== habitId)
            };
          }
          return member;
        })
      );
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  }, []);

  // Get member by ID
  const getMemberById = useCallback((memberId) => {
    return teamMembers.find(member => member.id === memberId);
  }, [teamMembers]);

  // Check if a user is the current logged-in user
  const isCurrentUser = useCallback((memberUserId) => {
    return user && user.id === memberUserId;
  }, [user]);

  const value = {
    teamMembers,
    getAllHabitNames,
    calculateStats,
    calculateMemberStats,
    toggleHabitCompletion,
    addHabit,
    updateHabit,
    deleteHabit,
    getMemberById,
    isCurrentUser,
  };

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
};