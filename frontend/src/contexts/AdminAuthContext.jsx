import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminApiService } from '../services/adminApiService';

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    console.log('AdminAuthContext: Token found:', !!token);
    if (token) {
      adminApiService.getMe()
        .then((user) => {
          console.log('AdminAuthContext: User loaded:', user);
          setUser(user);
        })
        .catch((error) => {
          console.log('AdminAuthContext: Error loading user:', error);
          localStorage.removeItem('adminToken');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    console.log('AdminAuthContext: Starting login process');
    const response = await adminApiService.login(username, password);
    console.log('AdminAuthContext: Login response received:', response);
    localStorage.setItem('adminToken', response.access);
    setUser(response.user);
    console.log('AdminAuthContext: User set in context:', response.user);
    return response; // Return the response for the login component
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};
