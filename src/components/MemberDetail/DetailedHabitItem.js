// components/MemberDetail/DetailedHabitItem.js
import React from "react";
import { useTeam } from "../../context/TeamContext";

const DetailedHabitItem = ({ habit, memberId, isCurrentUser, onEdit }) => {
  const { toggleHabitCompletion, deleteHabit } = useTeam();
  
  // Days of the week for the habit grid
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
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
                onClick={onEdit}
                className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Edit
              </button>
              <button
                onClick={() => deleteHabit(memberId, habit.id)}
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
            onClick={() => isCurrentUser && toggleHabitCompletion(memberId, habit.id)}
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
  );
};

export default DetailedHabitItem;