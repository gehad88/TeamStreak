import React from "react";

const Header = ({ user, onLogout, logo }) => {
  return (
    <header className="bg-indigo-600 text-white p-4 shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <img src={logo} className="w-15 h-12 rounded-full mr-3" />
          <div>
            <h1 className="text-2xl font-bold">TeamTrack</h1>
            <p className="text-indigo-100">
              Build habits together, achieve more
            </p>
          </div>
        </div>
        <div className="flex items-center">
          {user && (
            <div className="flex items-center mr-4">
              <img
                src={user.picture || "/api/placeholder/32/32"}
                alt={user.name}
                className="w-8 h-8 rounded-full mr-2"
              />
              <span className="text-sm">{user.name}</span>
            </div>
          )}
          <button
            onClick={onLogout}
            className="px-3 py-1 bg-indigo-700 hover:bg-indigo-800 rounded-md text-sm"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;