// components/IndividualView/HabitForm.js
import React, { useState } from "react";
import { useTeam } from "../../context/TeamContext";

const HabitForm = ({ memberId, habitId, initialName = "", onCancel, mode = "add" }) => {
  const { addHabit, updateHabit } = useTeam();
  const [habitName, setHabitName] = useState(initialName);
  
  const handleSubmit = () => {
    if (!habitName.trim()) return;
    
    if (mode === "add") {
      addHabit(memberId, habitName);
    } else if (mode === "edit") {
      updateHabit(memberId, habitId, habitName);
    }
    
    onCancel();
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
      <h3 className="text-lg font-medium mb-2">
        {mode === "add" ? "Add New Habit" : "Edit Habit"}
      </h3>
      <input
        type="text"
        value={habitName}
        onChange={(e) => setHabitName(e.target.value)}
        placeholder="Enter habit name"
        className="w-full p-2 border border-gray-300 rounded mb-2"
      />
      <div className="flex justify-end space-x-2">
        <button
          onClick={onCancel}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          {mode === "add" ? "Add Habit" : "Update Habit"}
        </button>
      </div>
    </div>
  );
};

export default HabitForm;