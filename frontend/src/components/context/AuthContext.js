import React, { createContext, useState, useContext, useCallback } from "react";
import { authApi, teamApi } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Check for existing auth on component mount
  React.useEffect(() => {
    const storedUser = localStorage.getItem("teamtrack_user");
    const token = localStorage.getItem("teamtrack_token");

    if (storedUser && token) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setIsAuthenticated(true);
    }
  }, []);

  // Handle successful login
  const handleLoginSuccess = async (credentialResponse) => {
    try {
      // Get the credential token from Google response
      const credential = credentialResponse.credential;
      
      // Use the authApi to authenticate
      const userData = await authApi.googleAuth(credential);
      
      // Set authenticated state
      setUser(userData);
      setIsAuthenticated(true);
      
      // Store in localStorage for persistence
      localStorage.setItem("teamtrack_user", JSON.stringify(userData));
      localStorage.setItem("teamtrack_token", userData.token);
    } catch (error) {
      console.error("Login Failed:", error);
      alert("Login failed. Please try again.");
    }
  };

  // Handle login failure
  const handleLoginFailure = (error) => {
    console.error("Login Failed:", error);
    alert("Login failed. Please try again.");
  };

  // Fetch team data
  const fetchTeamData = useCallback(async () => {
    try {
      const token = localStorage.getItem("teamtrack_token");
      if (token) {
        await teamApi.getTeamMembers();
      }
    } catch (error) {
      console.error("Error fetching team data:", error);
    }
  }, []);

  // Handle logout
  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("teamtrack_user");
    localStorage.removeItem("teamtrack_token");
  };

  const value = {
    isAuthenticated,
    user,
    handleLoginSuccess,
    handleLoginFailure,
    handleLogout,
    fetchTeamData
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};