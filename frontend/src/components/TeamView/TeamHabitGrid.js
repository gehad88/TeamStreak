// components/TeamView/TeamHabitGrid.js
import React from "react";
import { useTeam } from "../../context/TeamContext";

const TeamHabitGrid = ({ selectedHabit }) => {
  const { teamMembers, toggleHabitCompletion, isCurrentUser } = useTeam();
  
  // Days of the week for the habit grid
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border">Team Member</th>
            <th className="py-2 px-4 border">Current Streak</th>
            {days.map((day) => (
              <th key={day} className="py-2 px-4 border">{day}</th>
            ))}
            <th className="py-2 px-4 border">Today</th>
          </tr>
        </thead>
        <tbody>
          {teamMembers.map((member) => {
            const habit = member.habits.find(
              (h) => h.name === selectedHabit
            );
            const memberIsCurrentUser = isCurrentUser(member.userId);
            return habit ? (
              <tr key={member.id}>
                <td className="py-2 px-4 border">
                  <div className="flex items-center">
                    <img 
                      src={member.avatar} 
                      alt={member.name} 
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <span>
                      {member.name} {memberIsCurrentUser && "(You)"}
                    </span>
                  </div>
                </td>
                <td className="py-2 px-4 border text-center">
                  {habit.streak} days
                </td>
                {habit.lastWeek.map((completed, idx) => (
                  <td key={idx} className="py-2 px-4 border text-center">
                    {completed ? "✓" : ""}
                  </td>
                ))}
                <td className="py-2 px-4 border text-center">
                  <button
                    className={`w-8 h-8 rounded-full ${
                      habit.completedToday
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-500"
                    } ${
                      memberIsCurrentUser
                        ? "hover:bg-indigo-600 hover:text-white"
                        : "cursor-not-allowed"
                    }`}
                    onClick={() => memberIsCurrentUser && toggleHabitCompletion(member.id, habit.id)}
                    disabled={!memberIsCurrentUser}
                    title={
                      !memberIsCurrentUser
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
  );
};

export default TeamHabitGrid;