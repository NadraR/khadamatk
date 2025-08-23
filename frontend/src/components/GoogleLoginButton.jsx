import React from 'react';
import { GoogleLogin, useGoogleLogin } from '@react-oauth/google';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';

const GoogleLoginButton = ({ onSuccess, onError, disabled, userType = 'client', mode = 'component' }) => {
  const navigate = useNavigate();

  const redirectAfterLogin = (userData) => {
    if (!userData?.hasLocation) {
      navigate('/location');
    } else if (userData?.role === 'worker') {
      navigate('/worker-dashboard');
    } else {
      navigate('/client-dashboard');
    }
  };

  const hookLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const idToken = tokenResponse?.id_token || tokenResponse?.credential;
        if (!idToken) throw new Error('لم يتم استلام ID Token من Google');

        const result = await authService.googleLogin(idToken, userType);
        if (result) {
          onSuccess?.(result);
          redirectAfterLogin(result);
        } else {
          onError?.('فشل تسجيل الدخول بواسطة Google');
        }
      } catch (error) {
        onError?.(error.message || 'فشل تسجيل الدخول بواسطة Google');
      }
    },
    onError: (error) => {
      onError?.(error.error_description || 'فشل تسجيل الدخول بواسطة Google');
    },
  });

  if (mode === 'component') {
    return (
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          try {
            const idToken = credentialResponse?.credential;
            if (!idToken) throw new Error('لم يتم استلام ID Token من Google');

            const result = await authService.googleLogin(idToken, userType);
            if (result) {
              onSuccess?.(result);
              redirectAfterLogin(result);
            } else {
              onError?.('فشل تسجيل الدخول بواسطة Google');
            }
          } catch (error) {
            onError?.(error.message || 'فشل تسجيل الدخول بواسطة Google');
          }
        }}
        onError={() => onError?.('فشل تسجيل الدخول بواسطة Google')}
        useOneTap={false}
      />
    );
  }

  return (
    <button
      onClick={hookLogin}
      disabled={disabled}
      className="google-login-button"
    >
      <img 
        src="https://developers.google.com/identity/images/g-logo.png" 
        alt="Google" 
        width="20" 
        height="20" 
      />
      تسجيل الدخول بـ Google
    </button>
  );
};

export default GoogleLoginButton;
