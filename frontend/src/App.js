import React, { useState, useEffect } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import img from "./teamwork.png";
import LoginPage from "./components/LoginPage";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Dashboard from "./components/Dashboard";
import TeamView from "./components/TeamView";
import IndividualView from "./components/IndividualView";
import MemberDetailView from "./components/MemberDetailView";

const App = () => {
  // Google OAuth client ID
  const GOOGLE_CLIENT_ID =
    "895319338939-smhngob7lur18bn9hieh3crsrv2id4ij.apps.googleusercontent.com";

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // View state
  const [selectedView, setSelectedView] = useState("team");
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedHabit, setSelectedHabit] = useState("Morning Exercise");

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

  // Check for existing auth on component mount
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
      fetchTeamData(userData.token);
      
    } catch (error) {
      console.error("Login Failed:", error);
      alert("Login failed. Please try again.");
    }
  };

  // Fetch team data
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

  // Get all unique habit names
  const getAllHabitNames = () => {
    const habitSet = new Set();
    teamMembers.forEach((member) => {
      member.habits.forEach((habit) => {
        habitSet.add(habit.name);
      });
    });
    return Array.from(habitSet);
  };

  // Toggle habit completion
  const toggleHabitCompletion = (memberId, habitId) => {
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
  const addHabit = (memberId, habitName) => {
    if (!habitName.trim()) return;
  
    // Generate a new ID for the habit
    const newHabitId = Math.max(...teamMembers.flatMap(m => m.habits.map(h => h.id))) + 1;
    
    const newHabit = {
      id: newHabitId,
      name: habitName,
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
  };
  
  // Update a habit
  const updateHabit = (memberId, habitId, newName) => {
    if (!newName.trim()) return;
  
    // Update local state with the updated habit name
    setTeamMembers(
      teamMembers.map((member) => {
        if (member.id === memberId) {
          const updatedHabits = member.habits.map((habit) => {
            if (habit.id === habitId) {
              return { ...habit, name: newName };
            }
            return habit;
          });
          return { ...member, habits: updatedHabits };
        }
        return member;
      })
    );
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

  // Get the days of the week
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const habitNames = getAllHabitNames();
  const stats = calculateStats();

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {!isAuthenticated ? (
        <LoginPage 
          onLoginSuccess={handleLoginSuccess}
          onLoginFailure={handleLoginFailure}
        />
      ) : (
        <div className="min-h-screen bg-gray-50">
          <Header
            user={user}
            onLogout={handleLogout}
            logo={img}
          />
          
          <main className="max-w-6xl mx-auto p-4">
            <Dashboard 
              stats={stats}
              teamMembersCount={teamMembers.length} 
            />

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

            {selectedView === "team" && (
              <TeamView
                teamMembers={teamMembers}
                selectedHabit={selectedHabit}
                setSelectedHabit={setSelectedHabit}
                habitNames={habitNames}
                days={days}
                user={user}
                toggleHabitCompletion={toggleHabitCompletion}
              />
            )}

            {selectedView === "individual" && (
              <IndividualView
                teamMembers={teamMembers}
                user={user}
                viewMemberDetails={viewMemberDetails}
                toggleHabitCompletion={toggleHabitCompletion}
                addHabit={addHabit}
                updateHabit={updateHabit}
                deleteHabit={deleteHabit}
              />
            )}

            {selectedView === "memberDetail" && selectedMember && (
              <MemberDetailView
                teamMembers={teamMembers}
                selectedMember={selectedMember}
                user={user}
                days={days}
                backToIndividualView={backToIndividualView}
                toggleHabitCompletion={toggleHabitCompletion}
                addHabit={addHabit}
                updateHabit={updateHabit}
                deleteHabit={deleteHabit}
              />
            )}
          </main>

          <Footer />
        </div>
      )}
    </GoogleOAuthProvider>
  );
};

export default App;