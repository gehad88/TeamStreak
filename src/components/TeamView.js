import React from "react";

const TeamView = ({ 
  teamMembers, 
  selectedHabit, 
  setSelectedHabit, 
  habitNames, 
  days,
  user,
  toggleHabitCompletion 
}) => {
  // Handle no habits scenario
  if (habitNames.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <h2 className="text-lg font-medium mb-2">No Habits Created Yet</h2>
        <p className="text-gray-600 mb-4">
          Your team doesn't have any habits to track yet. Switch to Individual View to add your first habit.
        </p>
        <button
          //onClick={() => setSelectedView("individual")}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md"
        >
          Go to Individual View
        </button>
      </div>
    );
  }

  return (
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
  );
};

export default TeamView;