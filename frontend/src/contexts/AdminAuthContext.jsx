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
    const userData = localStorage.getItem('admin_user');
    console.log('AdminAuthContext: Token found:', !!token);
    console.log('AdminAuthContext: User data found:', !!userData);
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('AdminAuthContext: User loaded from localStorage:', parsedUser);
        setUser(parsedUser);
        setLoading(false);
      } catch (error) {
        console.log('AdminAuthContext: Error parsing user data:', error);
        adminAuth.logout();
        setLoading(false);
      }
    } else if (userData && !token) {
      // إذا كان هناك user data لكن لا يوجد token، نظف البيانات
      console.log('AdminAuthContext: User data found but no token, clearing data');
      adminAuth.logout();
      setLoading(false);
    } else if (token) {
      // إذا كان هناك token لكن لا يوجد user data، جرب جلب البيانات من الخادم
      adminAuth.getMe()
        .then((userData) => {
          console.log('AdminAuthContext: User loaded from server:', userData);
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
    console.log('AdminAuthContext: Login data received:', loginData);
    
    // التحقق من أن البيانات موجودة
    const token = localStorage.getItem('admin_access_token');
    const userData = localStorage.getItem('admin_user');
    console.log('AdminAuthContext: Token after login:', !!token);
    console.log('AdminAuthContext: User data after login:', !!userData);
    
    // البيانات تأتي من AdminLogin مع tokens محفوظة بالفعل
    setUser(loginData.user);
    console.log('AdminAuthContext: User set in context:', loginData.user);
    console.log('AdminAuthContext: isAuthenticated will be:', !!loginData.user);
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
