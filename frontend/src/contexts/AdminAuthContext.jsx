import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminAuth } from '../services/adminApiService';

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
    const token = localStorage.getItem('admin_access_token');
    console.log('AdminAuthContext: Token found:', !!token);
    if (token) {
      adminAuth.getMe()
        .then((userData) => {
          console.log('AdminAuthContext: User loaded:', userData);
          setUser(userData);
        })
        .catch((error) => {
          console.log('AdminAuthContext: Error loading user:', error);
          adminAuth.logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (loginData) => {
    console.log('AdminAuthContext: Starting login process');
    // البيانات تأتي من AdminLogin مع tokens محفوظة بالفعل
    setUser(loginData.user);
    console.log('AdminAuthContext: User set in context:', loginData.user);
    return loginData;
  };

  const logout = () => {
    adminAuth.logout();
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
