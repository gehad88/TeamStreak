
// components/MemberDetail/MemberHabits.js
import React, { useState } from "react";
import DetailedHabitItem from "./DetailedHabitItem";
import HabitForm from "../IndividualView/HabitForm";
import { useTeam } from "../../context/TeamContext";

const MemberHabits = ({ memberId, isCurrentUser }) => {
  const { getMemberById } = useTeam();
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [isEditingHabit, setIsEditingHabit] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState(null);
  
  const member = getMemberById(memberId);
  
  if (!member) return null;
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Habits</h3>
      </div>

      {/* Add Habit Form */}
      {isAddingHabit && isCurrentUser && (
        <HabitForm
          memberId={memberId}
          onCancel={() => setIsAddingHabit(false)}
          mode="add"
        />
      )}

      {/* Edit Habit Form */}
      {isEditingHabit && isCurrentUser && (
        <HabitForm
          memberId={memberId}
          habitId={editingHabitId}
          initialName={member.habits.find(h => h.id === editingHabitId)?.name || ""}
          onCancel={() => {
            setIsEditingHabit(false);
            setEditingHabitId(null);
          }}
          mode="edit"
        />
      )}

      {/* Habits Detail */}
      <div className="space-y-6">
        {member.habits.map((habit) => (
          <DetailedHabitItem
            key={habit.id}
            habit={habit}
            memberId={memberId}
            isCurrentUser={isCurrentUser}
            onEdit={() => {
              setEditingHabitId(habit.id);
              setIsEditingHabit(true);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default MemberHabits;