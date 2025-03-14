// components/IndividualView/HabitItem.js
import React from "react";
import { useTeam } from "../../context/TeamContext";

const HabitItem = ({ habit, memberId, isCurrentUser, onEdit }) => {
  const { toggleHabitCompletion, deleteHabit } = useTeam();
  
  return (
    <div className="flex items-center justify-between">
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
              onClick={onEdit}
              className="text-gray-500 hover:text-indigo-600 text-sm"
            >
              Edit
            </button>
            <button
              onClick={() => deleteHabit(memberId, habit.id)}
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
  );
};

export default HabitItem;