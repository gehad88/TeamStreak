import React, { useState } from "react";

const MemberCard = ({
  member,
  isCurrentUser,
  viewMemberDetails,
  toggleHabitCompletion,
  addHabit,
  updateHabit,
  deleteHabit
}) => {
  const [newHabitName, setNewHabitName] = useState("");
  const [editingHabitId, setEditingHabitId] = useState(null);
  const [editHabitName, setEditHabitName] = useState("");
  const [isAddingHabit, setIsAddingHabit] = useState(false);

  // Handle submitting a new habit
  const handleAddHabit = (e) => {
    e.preventDefault();
    if (newHabitName.trim()) {
      addHabit(member.id, newHabitName);
      setNewHabitName("");
      setIsAddingHabit(false);
    }
  };

  // Handle updating a habit name
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

  // Calculate completion percentage
  const completionPercentage = 
    member.habits.length > 0 
      ? Math.round((member.habits.filter(h => h.completedToday).length / member.habits.length) * 100) 
      : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Member header */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
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
            <p className="text-sm text-gray-500">
              {member.habits.length} habit{member.habits.length !== 1 && "s"}
            </p>
          </div>
        </div>
        <button
          onClick={() => viewMemberDetails(member.id)}
          className="text-indigo-600 text-sm hover:underline"
        >
          View Details
        </button>
      </div>

      {/* Completion progress */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-500">Today's completion</span>
          <span className="text-sm font-medium">{completionPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Habits list */}
      <div className="p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Habits</h4>
        <ul className="space-y-3">
          {member.habits.map((habit) => (
            <li
              key={habit.id}
              className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50"
            >
              {editingHabitId === habit.id ? (
                <form onSubmit={handleUpdateHabit} className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={editHabitName}
                    onChange={(e) => setEditHabitName(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm flex-1"
                    autoFocus
                  />
                  <button 
                    type="submit"
                    className="px-2 py-1 bg-indigo-600 text-white text-xs rounded"
                  >
                    Save
                  </button>
                  <button 
                    type="button"
                    onClick={() => setEditingHabitId(null)}
                    className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded"
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
                      title={
                        !isCurrentUser
                          ? "You can only update your own habits"
                          : habit.completedToday
                          ? "Mark as incomplete"
                          : "Mark as complete"
                      }
                    >
                      {habit.completedToday ? "✓" : ""}
                    </button>
                    <span className="text-sm">{habit.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                      {habit.streak} day{habit.streak !== 1 && "s"}
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
            </li>
          ))}
        </ul>

        {/* Add habit form */}
        {isCurrentUser && (
          <div className="mt-4">
            {isAddingHabit ? (
              <form onSubmit={handleAddHabit} className="mt-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    placeholder="New habit name"
                    className="border border-gray-300 rounded px-3 py-1 text-sm flex-1"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-3 py-1 bg-indigo-600 text-white text-sm rounded"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingHabit(false)}
                    className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsAddingHabit(true)}
                className="text-sm text-indigo-600 mt-2 flex items-center"
              >
                + Add new habit
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberCard;