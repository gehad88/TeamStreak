import React, { useState } from "react";
import HabitSelector from "./HabitSelector";
import TeamHabitGrid from "./TeamHabitGrid";
import { useTeam } from "../../context/TeamContext";

const TeamProgressView = () => {
  const { getAllHabitNames } = useTeam();
  const habitNames = getAllHabitNames();
  const [selectedHabit, setSelectedHabit] = useState(habitNames[0] || "");

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Team Progress
        </h2>
        <p className="text-gray-600">
          Track how everyone is doing with their habits
        </p>
      </div>

      {habitNames.length > 0 ? (
        <>
          <HabitSelector 
            habitNames={habitNames} 
            selectedHabit={selectedHabit} 
            setSelectedHabit={setSelectedHabit} 
          />
          <TeamHabitGrid selectedHabit={selectedHabit} />
        </>
      ) : (
        <p className="text-gray-600">No habits have been created yet.</p>
      )}
    </div>
  );
};

export default TeamProgressView;