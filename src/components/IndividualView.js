import React, { useState } from "react";
import MemberCard from "./MemberCard";

const IndividualView = ({
  teamMembers,
  user,
  viewMemberDetails,
  toggleHabitCompletion,
  addHabit,
  updateHabit,
  deleteHabit
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {teamMembers.map((member) => (
        <MemberCard
          key={member.id}
          member={member}
          isCurrentUser={user && member.userId === user.id}
          viewMemberDetails={viewMemberDetails}
          toggleHabitCompletion={toggleHabitCompletion}
          addHabit={addHabit}
          updateHabit={updateHabit}
          deleteHabit={deleteHabit}
        />
      ))}
    </div>
  );
};

export default IndividualView;