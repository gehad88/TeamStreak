// components/TeamView/HabitSelector.js
import React from "react";

const HabitSelector = ({ habitNames, selectedHabit, setSelectedHabit }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {habitNames.map((habit) => (
        <button
          key={habit}
          className={`px-3 py-1 rounded ${
            selectedHabit === habit
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          onClick={() => setSelectedHabit(habit)}
        >
          {habit}
        </button>
      ))}
    </div>
  );
};

export default HabitSelector;