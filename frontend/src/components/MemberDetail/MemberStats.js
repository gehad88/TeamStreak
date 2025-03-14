
// components/MemberDetail/MemberStats.js
import React from "react";
import { useTeam } from "../../context/TeamContext";

const MemberStats = ({ memberId }) => {
  const { getMemberById, calculateMemberStats } = useTeam();
  
  const member = getMemberById(memberId);
  const stats = calculateMemberStats(memberId);
  
  if (!member) return null;
  
  return (
    <div className="p-4 border-b border-gray-200">
      <h3 className="font-medium mb-3">Stats Overview</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-gray-500 text-sm">
            Today's Completion
          </div>
          <div className="text-2xl font-bold mt-1">
            {stats.completionRate}%
          </div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-gray-500 text-sm">
            Habits Completed
          </div>
          <div className="text-2xl font-bold mt-1">
            {stats.completedHabits}/{stats.totalHabits}
          </div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-gray-500 text-sm">
            Longest Streak
          </div>
          <div className="text-2xl font-bold mt-1">
            {stats.longestStreak} days
          </div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-gray-500 text-sm">
            Total Habits
          </div>
          <div className="text-2xl font-bold mt-1">
            {member.habits.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberStats;