// components/Dashboard/ViewSelector.js
import React from "react";

const ViewSelector = ({ selectedView, setSelectedView, setSelectedMember }) => {
  return (
    <div className="flex space-x-4 mb-6">
      <button
        className={`px-4 py-2 rounded ${
          selectedView === "team"
            ? "bg-indigo-600 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
        onClick={() => setSelectedView("team")}
      >
        Team View
      </button>
      <button
        className={`px-4 py-2 rounded ${
          selectedView === "individual"
            ? "bg-indigo-600 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
        onClick={() => {
          setSelectedMember(null);
          setSelectedView("individual");
        }}
      >
        Individual View
      </button>
    </div>
  );
};

export default ViewSelector;