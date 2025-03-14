
// hooks/useAuth.js
import { useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { authApi } from '../services/api';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  const { isAuthenticated, user, setAuth } = context;
  
  const login = useCallback(async (credential) => {
    try {
      const userData = await authApi.googleAuth(credential);
      
      // Store in localStorage for persistence
      localStorage.setItem('teamtrack_user', JSON.stringify(userData));
      localStorage.setItem('teamtrack_token', userData.token);
      
      setAuth({
        isAuthenticated: true,
        user: userData,
      });
      
      return userData;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, [setAuth]);
  
  const logout = useCallback(() => {
    localStorage.removeItem('teamtrack_user');
    localStorage.removeItem('teamtrack_token');
    
    setAuth({
      isAuthenticated: false,
      user: null,
    });
  }, [setAuth]);
  
  return {
    isAuthenticated,
    user,
    login,
    logout,
  };
};