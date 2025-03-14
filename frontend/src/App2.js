import React, { useState, useEffect } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import img from "./teamwork.png";

const App = () => {
  // Add authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Sample data - in a real app, this would come from a database
  const [teamMembers, setTeamMembers] = useState([
    {
      id: 1,
      userId: 1, // Add userId field
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
      userId: 2, // Add userId field
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
      userId: 3, // Add userId field
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

  // Google OAuth client ID - You will need to replace this with your actual client ID from Google Developer Console
  const GOOGLE_CLIENT_ID =
    "895319338939-smhngob7lur18bn9hieh3crsrv2id4ij.apps.googleusercontent.com";

  // States for UI controls
  const [selectedHabit, setSelectedHabit] = useState("Morning Exercise");
  const [selectedView, setSelectedView] = useState("team");
  const [selectedMember, setSelectedMember] = useState(null);

  // States for habit management
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [isEditingHabit, setIsEditingHabit] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [editingHabit, setEditingHabit] = useState(null);

  // Check for existing auth on component mount and fetch team data
  useEffect(() => {
    const storedUser = localStorage.getItem("teamtrack_user");
    const token = localStorage.getItem("teamtrack_token");

    if (storedUser && token) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setIsAuthenticated(true);
    }
  }, []);

  // Handle successful login
const handleLoginSuccess = async (credentialResponse) => {
  try {
    // Get the credential token from Google response
    const credential = credentialResponse.credential;
    
    // Call backend API for authentication
    const response = await fetch('https://localhost:7064/api/Users/google-auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ credential }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Authentication failed');
    }
    
    // Get the authenticated user data from the backend
    const userData = await response.json();
    
    // Set authenticated state
    setUser(userData);
    setIsAuthenticated(true);
    
    // Store in localStorage for persistence
    localStorage.setItem("teamtrack_user", JSON.stringify(userData));
    localStorage.setItem("teamtrack_token", userData.token);
    
    // After successful login, fetch the team data
    // This will ensure we have the latest data from the server
    fetchTeamData(userData.token);
    
  } catch (error) {
    console.error("Login Failed:", error);
    alert("Login failed. Please try again.");
  }
};

// Add this function to fetch team data
const fetchTeamData = async (token) => {
  try {
    const response = await fetch('https://localhost:7064/api/Team/members', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const members = await response.json();
      setTeamMembers(members);
    }
  } catch (error) {
    console.error("Error fetching team data:", error);
  }
};

  // Add user if not exist in the teamMembers list
  const addUserIfNotExist = (userData) => {
    if (!teamMembers.some((member) => member.userId === userData.id)) {
      const newMember = {
        id: teamMembers.length + 1,
        userId: userData.id,
        name: userData.name,
        avatar: userData.picture || "/api/placeholder/40/40",
        habits: [
          {
            id: 1,
            name: "Morning Exercise",
            streak: 0,
            completedToday: false,
            lastWeek: Array(7).fill(false),
          },
          {
            id: 2,
            name: "Read 30 minutes",
            streak: 0,
            completedToday: false,
            lastWeek: Array(7).fill(false),
          },
        ],
      };
      setTeamMembers([...teamMembers, newMember]);
    }
  };

  // Helper function to parse JWT token
  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
      console.error("Error parsing JWT token:", e);
      return null;
    }
  };

  // Handle login failure
  const handleLoginFailure = (error) => {
    console.error("Login Failed:", error);
    alert("Login failed. Please try again.");
  };

  // Handle logout
  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("teamtrack_user");
    localStorage.removeItem("teamtrack_token");
  };

  // Get all unique habit names across all team members
  const getAllHabitNames = () => {
    const habitSet = new Set();
    teamMembers.forEach((member) => {
      member.habits.forEach((habit) => {
        habitSet.add(habit.name);
      });
    });
    return Array.from(habitSet);
  };

  const habitNames = getAllHabitNames();

  // Function to start editing a habit
  const startEditingHabit = (memberId, habit) => {
    setIsEditingHabit(true);
    setEditingHabit({ memberId, habit });
    setNewHabitName(habit.name);
  };

  // Toggle habit completion
  const toggleHabitCompletion = (memberId, habitId) => {
    // Since we're using mock data, we'll just update the local state
    setTeamMembers(
      teamMembers.map((member) => {
        if (member.id === memberId) {
          const updatedHabits = member.habits.map((habit) => {
            if (habit.id === habitId) {
              const completed = !habit.completedToday;
              // If completed, increment streak, otherwise reset it
              const newStreak = completed ? habit.streak + 1 : 0;
              return {
                ...habit,
                completedToday: completed,
                streak: newStreak
              };
            }
            return habit;
          });
          return { ...member, habits: updatedHabits };
        }
        return member;
      })
    );
  };

  // Add a new habit
  const addHabit = (memberId) => {
    if (!newHabitName.trim()) return;
  
    // Generate a new ID for the habit
    const newHabitId = Math.max(...teamMembers.flatMap(m => m.habits.map(h => h.id))) + 1;
    
    const newHabit = {
      id: newHabitId,
      name: newHabitName,
      streak: 0,
      completedToday: false,
      lastWeek: Array(7).fill(false)
    };
    
    // Update local state with the newly created habit
    setTeamMembers(
      teamMembers.map((member) => {
        if (member.id === memberId) {
          return {
            ...member,
            habits: [...member.habits, newHabit]
          };
        }
        return member;
      })
    );

    setNewHabitName("");
    setIsAddingHabit(false);
  };
  
  // Edit a habit
  const updateHabit = () => {
    if (!newHabitName.trim() || !editingHabit) return;
  
    // Update local state with the updated habit name
    setTeamMembers(
      teamMembers.map((member) => {
        if (member.id === editingHabit.memberId) {
          const updatedHabits = member.habits.map((habit) => {
            if (habit.id === editingHabit.habit.id) {
              return { ...habit, name: newHabitName };
            }
            return habit;
          });
          return { ...member, habits: updatedHabits };
        }
        return member;
      })
    );

    setNewHabitName("");
    setIsEditingHabit(false);
    setEditingHabit(null);
  };
  
  // Delete a habit
  const deleteHabit = (memberId, habitId) => {
    if (!window.confirm("Are you sure you want to delete this habit? This action cannot be undone.")) 
      return;
  
    // Update local state by removing the deleted habit
    setTeamMembers(
      teamMembers.map((member) => {
        if (member.id === memberId) {
          return {
            ...member,
            habits: member.habits.filter((habit) => habit.id !== habitId)
          };
        }
        return member;
      })
    );
  };

  // Calculate team stats
  const calculateStats = () => {
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
  };

  const stats = calculateStats();

  // Days of the week for the habit grid
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Calculate member stats for Individual View
  const calculateMemberStats = (member) => {
    const totalHabits = member.habits.length;
    const completedHabits = member.habits.filter(
      (h) => h.completedToday
    ).length;
    const completionRate =
      totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;
    const longestStreak = Math.max(0, ...member.habits.map((h) => h.streak));

    return { completedHabits, totalHabits, completionRate, longestStreak };
  };

  // View a specific member's detailed stats
  const viewMemberDetails = (memberId) => {
    setSelectedMember(memberId);
    setSelectedView("memberDetail");
  };

  // Back to individual view
  const backToIndividualView = () => {
    setSelectedMember(null);
    setSelectedView("individual");
  };

  // Cancel adding/editing habit
  const cancelHabitForm = () => {
    setIsAddingHabit(false);
    setIsEditingHabit(false);
    setNewHabitName("");
    setEditingHabit(null);
  };

  // Login Page Component
  const LoginPage = () => (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">TeamTrack</h1>
          <p className="text-gray-600 mt-2">
            Build habits together, achieve more
          </p>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-4 text-center">
            Sign in to track your team's habits and progress together
          </p>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleLoginSuccess}
              onError={handleLoginFailure}
              useOneTap
              theme="filled_blue"
              shape="rectangular"
              text="signin_with"
              size="large"
            />
          </div>
        </div>

        <div className="text-xs text-gray-500 text-center">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </div>
      </div>
    </div>
  );

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {!isAuthenticated ? (
        <LoginPage />
      ) : (
        <div className="min-h-screen bg-gray-50">
          <header className="bg-indigo-600 text-white p-4 shadow-md">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
              <div className="flex items-center">
                {" "}
                {/* Wrap logo and text in a flex container */}
                <img src={img} className="w-15 h-12 rounded-full mr-3" />{" "}
                {/* Fixed margin class to mr-3 */}
                <div>
                  <h1 className="text-2xl font-bold">TeamTrack</h1>
                  <p className="text-indigo-100">
                    Build habits together, achieve more
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                {user && (
                  <div className="flex items-center mr-4">
                    <img
                      src={user.picture || "/api/placeholder/32/32"}
                      alt={user.name}
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <span className="text-sm">{user.name}</span>
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 bg-indigo-700 hover:bg-indigo-800 rounded-md text-sm"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </header>
          <main className="max-w-6xl mx-auto p-4">
            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="text-gray-500 text-sm">Today's Completion</div>
                <div className="text-3xl font-bold mt-1">
                  {stats.completionRate}%
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="text-gray-500 text-sm">Habits Completed</div>
                <div className="text-3xl font-bold mt-1">
                  {stats.completedHabits}/{stats.totalHabits}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="text-gray-500 text-sm">Top Streaker</div>
                <div className="text-3xl font-bold mt-1">
                  {stats.topStreaker?.name || "N/A"}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="text-gray-500 text-sm">Team Members</div>
                <div className="text-3xl font-bold mt-1">
                  {teamMembers.length}
                </div>
              </div>
            </div>

            {/* View Selector */}
            <div className="flex mb-6 bg-white rounded-lg p-1 border border-gray-200 shadow-sm w-fit">
              <button
                className={`px-4 py-2 rounded-md ${
                  selectedView === "team"
                    ? "bg-indigo-100 text-indigo-800"
                    : "text-gray-600"
                }`}
                onClick={() => setSelectedView("team")}
              >
                Team View
              </button>
              <button
                className={`px-4 py-2 rounded-md ${
                  selectedView === "individual" ||
                  selectedView === "memberDetail"
                    ? "bg-indigo-100 text-indigo-800"
                    : "text-gray-600"
                }`}
                onClick={() => {
                  setSelectedMember(null);
                  setSelectedView("individual");
                }}
              >
                Individual View
              </button>
            </div>

            {/* Team View */}
            {selectedView === "team" && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium">Team Progress</h2>
                  <p className="text-gray-600">
                    Track how everyone is doing with their habits
                  </p>
                </div>

                {/* Habit selector */}
                <div className="p-4 border-b border-gray-200 flex flex-wrap gap-2">
                  {habitNames.map((habit) => (
                    <button
                      key={habit}
                      className={`px-3 py-1 rounded-full text-sm ${
                        selectedHabit === habit
                          ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
                          : "border border-gray-200 text-gray-600"
                      }`}
                      onClick={() => setSelectedHabit(habit)}
                    >
                      {habit}
                    </button>
                  ))}
                </div>

                {/* Team habit grid */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left p-4 font-medium text-gray-600">
                          Team Member
                        </th>
                        <th className="p-4 font-medium text-gray-600">
                          Current Streak
                        </th>
                        {days.map((day) => (
                          <th
                            key={day}
                            className="p-4 font-medium text-gray-600"
                          >
                            {day}
                          </th>
                        ))}
                        <th className="p-4 font-medium text-gray-600">Today</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamMembers.map((member) => {
                        const habit = member.habits.find(
                          (h) => h.name === selectedHabit
                        );
                        const isCurrentUser = user && member.userId === user.id;
                        return habit ? (
                          <tr
                            key={member.id}
                            className="border-t border-gray-100"
                          >
                            <td className="p-4">
                              <div className="flex items-center">
                                <img
                                  src={member.avatar}
                                  alt={member.name}
                                  className="w-8 h-8 rounded-full mr-3"
                                />
                                <span>
                                  {member.name} {isCurrentUser && "(You)"}
                                </span>
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              <span className="font-medium">
                                {habit.streak} days
                              </span>
                            </td>
                            {habit.lastWeek.map((completed, idx) => (
                              <td key={idx} className="p-4 text-center">
                                <div
                                  className={`w-6 h-6 rounded-full mx-auto ${
                                    completed ? "bg-green-500" : "bg-gray-200"
                                  }`}
                                ></div>
                              </td>
                            ))}
                            <td className="p-4 text-center">
                              <button
                                className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center ${
                                  habit.completedToday
                                    ? "bg-green-500 text-white"
                                    : "bg-gray-200 text-gray-600"
                                } ${
                                  !isCurrentUser
                                    ? "opacity-60 cursor-not-allowed"
                                    : "cursor-pointer"
                                }`}
                                onClick={() => isCurrentUser && toggleHabitCompletion(member.id, habit.id)}
                                disabled={!isCurrentUser}
                                title={
                                  !isCurrentUser
                                    ? "You can only update your own habits"
                                    : ""
                                }
                              >
                                {habit.completedToday ? "✓" : ""}
                              </button>
                            </td>
                          </tr>
                        ) : null;
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Individual View */}
            {selectedView === "individual" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {teamMembers.map((member) => {
                  const memberStats = calculateMemberStats(member);
                  const isCurrentUser = user && member.userId === user.id;
                  return (
                    <div
                      key={member.id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                    >
                      <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <img
                              src={member.avatar}
                              alt={member.name}
                              className="w-10 h-10 rounded-full mr-3"
                            />
                            <div>
                              <h3 className="font-medium">
                                {member.name} {isCurrentUser && "(You)"}
                              </h3>
                              <p className="text-gray-500 text-sm">
                                {memberStats.completedHabits}/
                                {memberStats.totalHabits} habits today
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => viewMemberDetails(member.id)}
                            className="text-sm text-indigo-600 hover:text-indigo-800"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium">Habits</h4>
                          <div className="flex items-center">
                            <div className="text-sm text-gray-600 mr-2">
                              Completion: {memberStats.completionRate}%
                            </div>
                            {isCurrentUser && (
                              <button
                                onClick={() => {
                                  setSelectedMember(member.id);
                                  setIsAddingHabit(true);
                                }}
                                className="text-sm text-indigo-600 hover:text-indigo-800"
                              >
                                + Add Habit
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Add Habit Form */}
                        {isAddingHabit &&
                          selectedMember === member.id &&
                          isCurrentUser && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                              <h5 className="font-medium mb-2">
                                Add New Habit
                              </h5>
                              <input
                                type="text"
                                value={newHabitName}
                                onChange={(e) =>
                                  setNewHabitName(e.target.value)
                                }
                                placeholder="Enter habit name"
                                className="w-full p-2 border border-gray-300 rounded mb-2"
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={cancelHabitForm}
                                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => addHabit(member.id)}
                                  className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
                                >
                                  Add Habit
                                </button>
                              </div>
                            </div>
                          )}

                        {/* Edit Habit Form */}
                        {isEditingHabit &&
                          editingHabit &&
                          editingHabit.memberId === member.id &&
                          isCurrentUser && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                              <h5 className="font-medium mb-2">Edit Habit</h5>
                              <input
                                type="text"
                                value={newHabitName}
                                onChange={(e) =>
                                  setNewHabitName(e.target.value)
                                }
                                placeholder="Enter habit name"
                                className="w-full p-2 border border-gray-300 rounded mb-2"
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={cancelHabitForm}
                                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={updateHabit}
                                  className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
                                >
                                  Update Habit
                                </button>
                              </div>
                            </div>
                          )}

                        <div className="space-y-4">
                          {member.habits.map((habit) => (
                            <div
                              key={habit.id}
                              className="flex items-center justify-between"
                            >
                              <div>
                                <div className="font-medium">{habit.name}</div>
                                <div className="text-sm text-gray-500">
                                  {habit.streak} day streak
                                </div>
                              </div>
                              <div className="flex items-center">
                                {isCurrentUser && (
                                  <div className="flex space-x-1 mr-2">
                                    <button
                                      onClick={() =>
                                        startEditingHabit(member.id, habit)
                                      }
                                      className="text-gray-500 hover:text-indigo-600 text-sm"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() =>
                                        deleteHabit(member.id, habit.id)
                                      }
                                      className="text-gray-500 hover:text-red-600 text-sm"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                )}
                                <button
                                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    habit.completedToday
                                      ? "bg-green-500 text-white"
                                      : "bg-gray-200 text-gray-600"
                                  } ${
                                    !isCurrentUser
                                      ? "opacity-60 cursor-not-allowed"
                                      : "cursor-pointer"
                                  }`}
                                  onClick={() => isCurrentUser && toggleHabitCompletion(member.id, habit.id)}
                                  disabled={!isCurrentUser}
                                  title={
                                    !isCurrentUser
                                      ? "You can only update your own habits"
                                      : ""
                                  }
                                >
                                  {habit.completedToday ? "✓" : ""}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Member Detail View */}
            {selectedView === "memberDetail" &&
              selectedMember &&
              (() => {
                const member = teamMembers.find((m) => m.id === selectedMember);
                if (!member) return null;

                const memberStats = calculateMemberStats(member);
                const isCurrentUser = member.userId === user.id;

                return (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                      <div className="flex items-center">
                        <button
                          onClick={backToIndividualView}
                          className="mr-3 text-gray-600 hover:text-gray-900"
                        >
                          ← Back
                        </button>
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-12 h-12 rounded-full mr-3"
                        />
                        <div>
                          <h2 className="text-xl font-medium">
                            {member.name} {isCurrentUser && "(You)"}
                          </h2>
                          <p className="text-gray-500">Member Profile</p>
                        </div>
                      </div>

                      {isCurrentUser && (
                        <button
                          onClick={() => {
                            setIsAddingHabit(true);
                          }}
                          className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                        >
                          + Add Habit
                        </button>
                      )}
                    </div>

                    {/* Stats Section */}
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="font-medium mb-3">Stats Overview</h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-gray-500 text-sm">
                            Today's Completion
                          </div>
                          <div className="text-2xl font-bold mt-1">
                            {memberStats.completionRate}%
                          </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-gray-500 text-sm">
                            Habits Completed
                          </div>
                          <div className="text-2xl font-bold mt-1">
                            {memberStats.completedHabits}/
                            {memberStats.totalHabits}
                          </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-gray-500 text-sm">
                            Longest Streak
                          </div>
                          <div className="text-2xl font-bold mt-1">
                            {memberStats.longestStreak} days
                          </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-gray-500 text-sm">
                            Total Habits
                          </div>
                          <div className="text-2xl font-bold mt-1">
                            {member.habits.length}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Habits Section */}
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium">Habits</h3>
                      </div>

                      {/* Add Habit Form */}
                      {isAddingHabit && isCurrentUser && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <h5 className="font-medium mb-2">Add New Habit</h5>
                          <input
                            type="text"
                            value={newHabitName}
                            onChange={(e) => setNewHabitName(e.target.value)}
                            placeholder="Enter habit name"
                            className="w-full p-2 border border-gray-300 rounded mb-2"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={cancelHabitForm}
                              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => addHabit(member.id)}
                              className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
                            >
                              Add Habit
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Edit Habit Form */}
                      {isEditingHabit &&
                        editingHabit &&
                        editingHabit.memberId === member.id &&
                        isCurrentUser && (
                          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <h5 className="font-medium mb-2">Edit Habit</h5>
                            <input
                              type="text"
                              value={newHabitName}
                              onChange={(e) => setNewHabitName(e.target.value)}
                              placeholder="Enter habit name"
                              className="w-full p-2 border border-gray-300 rounded mb-2"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={cancelHabitForm}
                                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={updateHabit}
                                className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
                              >
                                Update Habit
                              </button>
                            </div>
                          </div>
                        )}

                      {/* Habits Detail */}
                      <div className="space-y-6">
                        {member.habits.map((habit) => (
                          <div
                            key={habit.id}
                            className="border border-gray-200 rounded-lg overflow-hidden"
                          >
                            <div className="p-4 bg-gray-50 flex justify-between items-center">
                              <div>
                                <h4 className="font-medium">{habit.name}</h4>
                                <div className="text-sm text-gray-500">
                                  {habit.streak} day streak
                                </div>
                              </div>
                              <div className="flex items-center">
                                {isCurrentUser && (
                                  <div className="flex space-x-2 mr-3">
                                    <button
                                      onClick={() =>
                                        startEditingHabit(member.id, habit)
                                      }
                                      className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() =>
                                        deleteHabit(member.id, habit.id)
                                      }
                                      className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                )}
                                <button
                                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    habit.completedToday
                                      ? "bg-green-500 text-white"
                                      : "bg-gray-200 text-gray-600"
                                  } ${
                                    !isCurrentUser
                                      ? "opacity-60 cursor-not-allowed"
                                      : "cursor-pointer"
                                  }`}
                                  onClick={() =>
                                    toggleHabitCompletion(member.id, habit.id)
                                  }
                                  disabled={!isCurrentUser}
                                  title={
                                    !isCurrentUser
                                      ? "You can only update your own habits"
                                      : ""
                                  }
                                >
                                  {habit.completedToday ? "✓" : ""}
                                </button>
                              </div>
                            </div>
                            <div className="p-4">
                              <h5 className="text-sm font-medium mb-2">
                                Weekly Progress
                              </h5>
                              <div className="flex space-x-2">
                                {habit.lastWeek.map((completed, idx) => (
                                  <div
                                    key={idx}
                                    className="flex flex-col items-center"
                                  >
                                    <div
                                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                        completed
                                          ? "bg-green-500 text-white"
                                          : "bg-gray-200"
                                      }`}
                                    >
                                      {completed ? "✓" : ""}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {days[idx]}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
          </main>

          <footer className="bg-gray-100 mt-8 py-6 border-t border-gray-200">
            <div className="max-w-6xl mx-auto px-4 text-center text-gray-500 text-sm">
              <p>TeamTrack - Build habits together, achieve more</p>
              <p className="mt-2">
                © {new Date().getFullYear()} TeamTrack. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      )}
    </GoogleOAuthProvider>
  );
};

export default App;
