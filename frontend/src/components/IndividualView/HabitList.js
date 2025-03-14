
// components/IndividualView/HabitList.js
import React, { useState } from "react";
import HabitItem from "./HabitItem";
import HabitForm from "./HabitForm";
import { useTeam } from "../../context/TeamContext";

const HabitList = ({ memberId, habits, isCurrentUser }) => {
  const [editingHabitId, setEditingHabitId] = useState(null);
  
  return (
    <div className="space-y-4">
      {habits.map((habit) => {
        if (editingHabitId === habit.id && isCurrentUser) {
          return (
            <HabitForm
              key={habit.id}
              memberId={memberId}
              habitId={habit.id}
              initialName={habit.name}
              onCancel={() => setEditingHabitId(null)}
              mode="edit"
            />
          );
        } else {
          return (
            <HabitItem 
              key={habit.id}
              habit={habit}
              memberId={memberId}
              isCurrentUser={isCurrentUser}
              onEdit={() => setEditingHabitId(habit.id)}
            />
          );
        }
      })}
    </div>
  );
};

export default HabitList;