
import React, { useState, useEffect } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "axios";

const GoogleLoginButton = ({ onSuccess, language = "ar", onError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasAttemptedLogin, setHasAttemptedLogin] = useState(false);
  const [loginInProgress, setLoginInProgress] = useState(false);

  const handleLoginResponse = async (idToken) => {
    console.log("[DEBUG] GoogleLoginButton: handleLoginResponse called with token:", idToken ? "Present" : "Missing");
    
    if (!idToken) {
      const errorMsg = language === "ar"
        ? "لم يتم الحصول على رمز الوصول من Google"
        : "Failed to get access token from Google";
      console.error("[DEBUG] GoogleLoginButton: No ID token received");
      onError?.(errorMsg);
      return;
    }

    // منع المحاولات المتعددة
    if (hasAttemptedLogin || loginInProgress) {
      console.warn("[DEBUG] GoogleLoginButton: Login already attempted or in progress, ignoring duplicate request");
      return;
    }

    setHasAttemptedLogin(true);
    setLoginInProgress(true);
    setIsLoading(true);
    try {
      console.log("[DEBUG] GoogleLoginButton: Starting Google login process");
      console.log("[DEBUG] GoogleLoginButton: Token preview:", idToken.substring(0, 20) + "...");

      // Send token to backend for verification and role selection
      const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const apiURL = `${baseURL}/api/accounts/google-login/`;

      console.log("[DEBUG] GoogleLoginButton: Sending request to:", apiURL);

      const res = await axios.post(apiURL, { 
        token: idToken  // Changed from access_token to token to match backend
      });
      
      console.log("[DEBUG] GoogleLoginButton: Server response:", res.data);

      if (res.data.needs_role) {
        console.log("[DEBUG] GoogleLoginButton: User needs to select role");
        // Pass the token to parent component for role selection
        onSuccess?.({ 
          token: idToken, 
          needsRole: true, 
          email: res.data.email,
          isNewUser: res.data.is_new_user 
        });
      } else {
        console.log("[DEBUG] GoogleLoginButton: Login successful, user has role");
        // Pass the complete response data to parent component
        onSuccess?.(res.data);
        // Don't show toast here - let parent component handle it
      }
    } catch (err) {
      console.error("[DEBUG] GoogleLoginButton: Error details:", {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message
      });
      
      let errorMessage = language === "ar"
        ? "فشل تسجيل الدخول باستخدام Google"
        : "Google login failed";

      if (err.response?.status === 400) {
        errorMessage = language === "ar" ? "بيانات الدخول غير صحيحة" : "Invalid login data";
      } else if (err.response?.status === 404) {
        errorMessage = language === "ar" ? "عنوان الخدمة غير صحيح" : "Service endpoint not found";
      } else if (err.response?.status === 500) {
        errorMessage = language === "ar" ? "خطأ في الخادم، يرجى المحاولة لاحقاً" : "Server error, please try again later";
      }

      onError?.(errorMessage);
      // Don't show toast here - let parent component handle it
    } finally {
      setIsLoading(false);
      setLoginInProgress(false);
      // إعادة تعيين hasAttemptedLogin بعد 5 ثواني للسماح بمحاولة جديدة
      setTimeout(() => {
        setHasAttemptedLogin(false);
      }, 5000);
    }
  };

  return (
    <div className="google-login-section">
      <div className="google-login-description">
        <p className="google-login-text">
          {language === "ar"
            ? "استخدم حساب Google لتسجيل الدخول بسهولة وأمان"
            : "Use your Google account for easy and secure login"}
        </p>
      </div>

      <div className="google-login-button-container">
        <div className={`google-login-wrapper ${isLoading ? "loading" : ""}`}>
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              const idToken = credentialResponse?.credential;
              console.log("[DEBUG] GoogleLoginButton: Google OAuth success, token received");
              handleLoginResponse(idToken);
            }}
            onError={(error) => {
              console.error("[DEBUG] GoogleLoginButton: Google OAuth error:", error);
              const errorMsg = language === "ar" ? "فشل تسجيل الدخول باستخدام Google" : "Google login failed";
              onError?.(errorMsg);
              // Don't show toast here - let parent component handle it
            }}
            theme="filled_blue"
            size="large"
            width="280"
            locale={language === "ar" ? "ar" : "en"}
            text="signin_with"
            useOneTap={false}
            oneTapDisabled={true}
            shape="rectangular"
            prompt_parent_id="google-login-button-container"
          />

          {isLoading && (
            <div className="google-login-loading-overlay">
              <div className="google-login-spinner"></div>
              <p className="google-login-loading-text">
                {language === "ar" ? "جاري تسجيل الدخول..." : "Signing in..."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function GoogleLoginWrapper({ onSuccess, language = "ar", onError }) {
  const [googleClientId, setGoogleClientId] = useState(null);
  const [configError, setConfigError] = useState(null);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    console.log("[DEBUG] GoogleLoginWrapper: Client ID from env:", clientId ? "Found" : "Missing");

    if (clientId && clientId !== "YOUR_GOOGLE_CLIENT_ID") {
      setGoogleClientId(clientId);
      setConfigError(null);

      const currentOrigin = window.location.origin;
      console.log("[DEBUG] GoogleLoginWrapper: Current origin:", currentOrigin);
      
      if (currentOrigin.includes('localhost') && !clientId.includes('localhost')) {
        const warningMsg = language === "ar"
          ? "تحذير: تأكد من إضافة http://localhost:5173 إلى Authorized JavaScript origins في Google Console"
          : "Warning: Make sure to add http://localhost:5173 to Authorized JavaScript origins in Google Console";
        console.warn("[DEBUG] GoogleLoginWrapper:", warningMsg);
      }
    } else {
      const errorMsg = language === "ar" ? "إعدادات Google غير مكتملة" : "Google settings are not configured";
      console.error("[DEBUG] GoogleLoginWrapper:", errorMsg);
      setConfigError(errorMsg);
      onError?.(errorMsg);
    }
  }, [language, onError]);

  if (configError) {
    return (
      <div className="google-config-error">
        <div className="error-icon">⚠️</div>
        <p className="error-message">{configError}</p>
      </div>
    );
  }

  if (!googleClientId) {
    return (
      <div className="google-loading-state">
        <div className="google-loading-spinner"></div>
        <p className="google-loading-text">
          {language === "ar" ? "جاري التهيئة..." : "Initializing..."}
        </p>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <GoogleLoginButton
        onSuccess={onSuccess}
        language={language}
        onError={onError}
      />
    </GoogleOAuthProvider>
  );
}