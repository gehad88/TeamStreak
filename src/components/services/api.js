// src/services/api.js

const API_BASE_URL = 'https://localhost:7064';

// Helper function for making authenticated requests
const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem('teamtrack_token');
  
  if (!token) {
    throw new Error('Authentication token not found');
  }
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.status}`);
  }
  
  return response.json();
};

// Team related API calls
export const teamApi = {
  // Get all team members with their habits
  getTeamMembers: () => fetchWithAuth('/api/Team/members'),
  
  // Get a specific team member by ID
  getTeamMember: (memberId) => fetchWithAuth(`/api/Team/members/${memberId}`),
  
  // Get all users (potential team members)
  getAllUsers: () => fetchWithAuth('/api/Team/AllUsers'),
  
  // Get team statistics
  getTeamStats: () => fetchWithAuth('/api/Team/stats'),
  
  // Get all unique habit names
  getHabitNames: () => fetchWithAuth('/api/Team/habit-names')
};

// Habit related API calls
export const habitApi = {
  // Add a new habit
  addHabit: (data) => fetchWithAuth('/api/Habits', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  // Update a habit
  updateHabit: (habitId, data) => fetchWithAuth(`/api/Habits/${habitId}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  
  // Delete a habit
  deleteHabit: (habitId, memberId) => fetchWithAuth(`/api/Habits/${habitId}?memberId=${memberId}`, {
    method: 'DELETE'
  }),
  
  // Toggle habit completion status
  toggleHabit: (habitId, memberId) => fetchWithAuth(`/api/Habits/${habitId}/toggle?memberId=${memberId}`, {
    method: 'PUT'
  })
};

// User related API calls
export const userApi = {
  // Get the current user's profile
  getCurrentUser: () => fetchWithAuth('/api/Users/me'),
  
  // Google authentication - already implemented in your App.js
  googleAuth: (credential) => fetch(`${API_BASE_URL}/api/Users/google-auth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ credential })
  }).then(res => {
    if (!res.ok) {
      return res.json().then(data => {
        throw new Error(data.message || 'Authentication failed');
      });
    }
    return res.json();
  })
};