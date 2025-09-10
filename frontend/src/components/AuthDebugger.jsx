import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthDebugger = () => {
  const [authStatus, setAuthStatus] = useState({});
  const [isVisible, setIsVisible] = useState(false);

  const checkAuthStatus = async () => {
    const status = {
      // Check all possible token keys
      accessToken: localStorage.getItem('access'),
      refreshToken: localStorage.getItem('refresh'),
      accessTokenAlt: localStorage.getItem('access_token'),
      refreshTokenAlt: localStorage.getItem('refresh_token'),
      
      // Check user data
      user: localStorage.getItem('user'),
      userId: localStorage.getItem('user_id'),
      userRole: localStorage.getItem('user_role'),
      
      // Check authentication status
      isAuthenticated: await authService.isAuthenticated(),
      currentUser: authService.getCurrentUser(),
      
      // All localStorage keys
      allKeys: Object.keys(localStorage)
    };
    
    setAuthStatus(status);
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const clearAllAuth = () => {
    authService.clearAuth();
    checkAuthStatus();
  };

  if (!isVisible) {
    return (
      <button 
        onClick={() => setIsVisible(true)}
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          zIndex: 9999,
          background: '#ff4444',
          color: 'white',
          border: 'none',
          padding: '10px',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        🔍 Auth Debug
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      zIndex: 9999,
      background: 'white',
      border: '2px solid #333',
      borderRadius: '8px',
      padding: '15px',
      maxWidth: '400px',
      maxHeight: '80vh',
      overflow: 'auto',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ margin: 0, color: '#333' }}>🔍 Auth Debug</h3>
        <button 
          onClick={() => setIsVisible(false)}
          style={{ background: '#ccc', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}
        >
          ✕
        </button>
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Authentication Status:</strong> {authStatus.isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Access Token:</strong> {authStatus.accessToken ? '✅ Found' : '❌ Missing'}
        {authStatus.accessToken && (
          <div style={{ fontSize: '12px', color: '#666', wordBreak: 'break-all' }}>
            {authStatus.accessToken.substring(0, 50)}...
          </div>
        )}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Refresh Token:</strong> {authStatus.refreshToken ? '✅ Found' : '❌ Missing'}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>User Data:</strong> {authStatus.user ? '✅ Found' : '❌ Missing'}
        {authStatus.user && (
          <div style={{ fontSize: '12px', color: '#666' }}>
            {JSON.parse(authStatus.user).email}
          </div>
        )}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>All localStorage Keys:</strong>
        <div style={{ fontSize: '12px', color: '#666' }}>
          {authStatus.allKeys?.join(', ')}
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <button 
          onClick={checkAuthStatus}
          style={{ background: '#007bff', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}
        >
          🔄 Refresh
        </button>
        <button 
          onClick={clearAllAuth}
          style={{ background: '#dc3545', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}
        >
          🗑️ Clear All
        </button>
      </div>
    </div>
  );
};

export default AuthDebugger;



