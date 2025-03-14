import React, { useState } from "react";

const MemberDetailView = ({
  teamMembers,
  selectedMember,
  user,
  days,
  backToIndividualView,
  toggleHabitCompletion,
  addHabit,
  updateHabit,
  deleteHabit
}) => {
  const [newHabitName, setNewHabitName] = useState("");
  const [editingHabitId, setEditingHabitId] = useState(null);
  const [editHabitName, setEditHabitName] = useState("");
  
  // Find the member from the teamMembers array
  const member = teamMembers.find(m => m.id === selectedMember);
  
  // Check if current user is viewing their own details
  const isCurrentUser = user && member?.userId === user.id;
  
  // Handle adding a new habit
  const handleAddHabit = (e) => {
    e.preventDefault();
    if (newHabitName.trim()) {
      addHabit(member.id, newHabitName);
      setNewHabitName("");
    }
  };
  
  // Handle updating a habit
  const handleUpdateHabit = (e) => {
    e.preventDefault();
    if (editHabitName.trim()) {
      updateHabit(member.id, editingHabitId, editHabitName);
      setEditingHabitId(null);
      setEditHabitName("");
    }
  };

  // Start editing a habit
  const startEditingHabit = (habit) => {
    setEditingHabitId(habit.id);
    setEditHabitName(habit.name);
  };
  
  if (!member) return null;
  
  // Calculate completion percentage
  const completionPercentage = 
    member.habits.length > 0 
      ? Math.round((member.habits.filter(h => h.completedToday).length / member.habits.length) * 100) 
      : 0;
  
  // Get the longest streak
  const longestStreak = member.habits.length > 0 
    ? Math.max(...member.habits.map(h => h.streak))
    : 0;
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={backToIndividualView}
              className="mr-3 text-gray-500 hover:text-indigo-600"
            >
              ← Back
            </button>
            <h2 className="text-lg font-medium">{member.name}'s Habits</h2>
            {isCurrentUser && <span className="ml-2 text-sm text-gray-500">(You)</span>}
          </div>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 border-b border-gray-200">
        <div>
          <div className="text-sm text-gray-500">Total Habits</div>
          <div className="text-xl font-bold">{member.habits.length}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Today's Completion</div>
          <div className="text-xl font-bold">{completionPercentage}%</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Longest Streak</div>
          <div className="text-xl font-bold">{longestStreak} days</div>
        </div>
      </div>
      
      {/* Add New Habit */}
      {isCurrentUser && (
        <div className="p-4 border-b border-gray-200">
          <form onSubmit={handleAddHabit} className="flex gap-2">
            <input
              type="text"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              placeholder="Add a new habit..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md"
            >
              Add Habit
            </button>
          </form>
        </div>
      )}
      
      {/* Habits List */}
      <div className="p-4">
        <h3 className="text-md font-medium mb-4">Habit Tracking</h3>
        
        {member.habits.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No habits yet. {isCurrentUser ? "Add your first habit above!" : ""}
          </div>
        ) : (
          <div className="space-y-4">
            {member.habits.map(habit => (
              <div key={habit.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Habit header */}
                <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
                  {editingHabitId === habit.id ? (
                    <form onSubmit={handleUpdateHabit} className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={editHabitName}
                        onChange={(e) => setEditHabitName(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 flex-1"
                        autoFocus
                      />
                      <button 
                        type="submit"
                        className="px-3 py-1 bg-indigo-600 text-white text-sm rounded"
                      >
                        Save
                      </button>
                      <button 
                        type="button"
                        onClick={() => setEditingHabitId(null)}
                        className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded"
                      >
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-center">
                        <button
                          className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center ${
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
                        >
                          {habit.completedToday ? "✓" : ""}
                        </button>
                        <span className="font-medium">{habit.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
                          {habit.streak} day streak
                        </span>
                        {isCurrentUser && (
                          <>
                            <button
                              onClick={() => startEditingHabit(habit)}
                              className="text-gray-500 hover:text-indigo-600 p-1"
                              title="Edit habit"
                            >
                              ✎
                            </button>
                            <button
                              onClick={() => deleteHabit(member.id, habit.id)}
                              className="text-gray-500 hover:text-red-600 p-1"
                              title="Delete habit"
                            >
                              ✕
                            </button>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
                
                {/* Weekly tracking */}
                <div className="p-3">
                  <div className="text-sm text-gray-500 mb-2">Last 7 days</div>
                  <div className="flex justify-between">
                    {days.map((day, index) => (
                      <div key={day} className="flex flex-col items-center">
                        <div className="text-xs text-gray-500 mb-1">{day}</div>
                        <div 
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            habit.lastWeek[index] ? "bg-green-500 text-white" : "bg-gray-200"
                          }`}
                        >
                          {habit.lastWeek[index] ? "✓" : ""}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberDetailView;