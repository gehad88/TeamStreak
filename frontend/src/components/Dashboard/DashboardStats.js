import React from "react";

const Dashboard = ({ stats, teamMembersCount }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="text-gray-500 text-sm">Today's Completion</div>
        <div className="text-3xl font-bold mt-1">
          {stats.completionRate}%
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="text-gray-500 text-sm">Habits Completed</div>
        <div className="text-3xl font-bold mt-1">
          {stats.completedHabits}/{stats.totalHabits}
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="text-gray-500 text-sm">Top Streaker</div>
        <div className="text-3xl font-bold mt-1">
          {stats.topStreaker?.name || "N/A"}
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="text-gray-500 text-sm">Team Members</div>
        <div className="text-3xl font-bold mt-1">
          {teamMembersCount}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;