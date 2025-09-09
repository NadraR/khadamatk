import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import LoginForm from "../components/LoginForm";
import RegisterForm from "../components/RegisterForm";
import GoogleLoginButton from "../components/GoogleLoginButton";
import RoleSelector from "../components/RoleSelector";
import { authService } from "../services/authService";
import "./AuthPage.css";

const AuthPage = () => {
  const [mode, setMode] = useState("login");
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [pendingGoogleToken, setPendingGoogleToken] = useState(null);
  const [googleRole, setGoogleRole] = useState("client");
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("ar"); // ar | en
  const [showGoogleRoleSelector, setShowGoogleRoleSelector] = useState(false);

  // تحديث لغة الصفحة وRTL/LTR
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  // Dark Mode
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(savedDarkMode ? JSON.parse(savedDarkMode) : prefersDarkMode);
  }, []);

  useEffect(() => {
    if (darkMode) document.body.classList.add("dark-mode");
    else document.body.classList.remove("dark-mode");
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  const showNotification = (message, type = "error") => {
    const toastOptions = {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: darkMode ? "dark" : "light",
      rtl: language === "ar",
    };

    switch (type) {
      case "success": toast.success(message, toastOptions); break;
      case "warning": toast.warning(message, toastOptions); break;
      case "info": toast.info(message, toastOptions); break;
      default: toast.error(message, toastOptions);
    }
  };

  const redirectAfterLogin = async (userData) => {
    console.log("[DEBUG] AuthPage: redirectAfterLogin called with:", userData);
    
    // Check if there's a pending redirect (from booking flow)
    const pendingRedirect = localStorage.getItem('redirectAfterLogin');
    const pendingOrder = localStorage.getItem('pendingOrder');
    
    if (pendingRedirect && pendingOrder) {
      console.log("[DEBUG] AuthPage: Found pending redirect:", pendingRedirect);
      console.log("[DEBUG] AuthPage: Found pending order data");
      
      // Clear the redirect flag
      localStorage.removeItem('redirectAfterLogin');
      
      // For clients with pending orders, redirect to order page
      if (userData.role === 'client' && pendingRedirect === '/order') {
        console.log("[DEBUG] AuthPage: Redirecting client to complete pending order");
        window.location.href = '/order';
        return;
      }
    }
    
    // Check if there's saved location data to send to backend
    const savedLocation = localStorage.getItem('selectedLocation');
    const savedLocationDetails = localStorage.getItem('locationDetails');
    
    if (savedLocation && userData.role === 'client') {
      try {
        console.log("[DEBUG] AuthPage: Found saved location data, sending to backend");
        const locationData = JSON.parse(savedLocation);
        const detailsData = savedLocationDetails ? JSON.parse(savedLocationDetails) : {};
        
        // Import locationService dynamically to avoid circular imports
        const { locationService } = await import('../services/LocationService');
        
        const locationPayload = {
          lat: locationData.lat,
          lng: locationData.lng,
          address: locationData.address || '',
          city: locationData.city || '',
          country: locationData.country || 'مصر',
          neighborhood: locationData.neighborhood || '',
          location_type: 'home',
          name: 'الموقع الرئيسي',
          is_primary: true,
          building_number: detailsData.building_number || '',
          apartment_number: detailsData.apartment_number || '',
          floor_number: detailsData.floor_number || '',
          landmark: detailsData.landmark || '',
          additional_details: detailsData.additional_details || ''
        };
        
        const result = await locationService.saveLocation(locationPayload);
        if (result.success) {
          console.log("[DEBUG] AuthPage: Location saved successfully to backend");
          // Clear saved location data after successful save
          localStorage.removeItem('selectedLocation');
          localStorage.removeItem('locationDetails');
        } else {
          console.warn("[DEBUG] AuthPage: Failed to save location to backend:", result.error);
        }
      } catch (error) {
        console.error("[DEBUG] AuthPage: Error saving location to backend:", error);
      }
    }
    
    // Check if worker needs profile completion
    if (userData.role === 'worker' && !userData.profile_completed) {
      console.log("[DEBUG] AuthPage: Redirecting worker to profile completion");
      window.location.href = "/worker-profile-completion";
      return;
    }
    
    // Default redirect based on user role
    switch (userData.role) {
      case 'worker':
        console.log("[DEBUG] AuthPage: Redirecting worker to provider home");
        window.location.href = "/homeProvider";
        break;
      case 'client':
        console.log("[DEBUG] AuthPage: Redirecting client to home");
        window.location.href = "/";
        break;
      default:
        console.log("[DEBUG] AuthPage: Redirecting to default home page");
        window.location.href = "/";
    }
  };

  // Google Login handlers
const handleGoogleSuccess = async (googleData) => {
  console.log("[DEBUG] AuthPage: Google success data received:", googleData);
  
  // Check if user needs role selection
  if (googleData.needsRole || !googleData.role) {
    console.log("[DEBUG] AuthPage: User needs role selection");
    setPendingGoogleToken(googleData.token || googleData.access_token);
    setShowRoleSelector(true);
    showNotification(language === "ar" ? 
      "تم تسجيل الدخول بنجاح باستخدام Google. يرجى اختيار نوع الحساب" : 
      "Google login successful. Please choose account type", "info");
    return;
  }
  
  // User already has a role, proceed with login
  if (googleData.access && googleData.user_id) {
    console.log("[DEBUG] AuthPage: User has role, proceeding with login");
    
    // Store the tokens in localStorage (using consistent keys)
    localStorage.setItem('access', googleData.access);
    localStorage.setItem('refresh', googleData.refresh);
    localStorage.setItem('user_id', googleData.user_id);
    localStorage.setItem('user_role', googleData.role);
    
    // Also store user data for immediate access
    const userData = {
      id: googleData.user_id,
      email: googleData.email,
      role: googleData.role,
      hasLocation: googleData.has_location || false,
      name: googleData.first_name + ' ' + googleData.last_name,
      profile_completed: googleData.profile_completed || (googleData.role === 'worker' ? false : true)
    };
    
    localStorage.setItem('user', JSON.stringify(userData));
    authService.saveUserToStorage(userData);
    
    // Show success message
    showNotification(language === "ar" ? 
      "تم تسجيل الدخول بنجاح!" : 
      "Logged in successfully!", "success");
    
    // Redirect using the unified redirect logic
    await redirectAfterLogin(userData);
  } else {
    console.error("[DEBUG] AuthPage: Invalid Google response data:", googleData);
    showNotification(language === "ar" ? 
      "بيانات الاستجابة من Google غير صحيحة" : 
      "Invalid response data from Google");
  }
};

  const handleRoleConfirm = async (selectedRole) => {
    setIsLoading(true);
    try {
      console.log("[DEBUG] AuthPage: Confirming role with token:", pendingGoogleToken.substring(0, 20) + "...");
      const result = await authService.googleLogin(pendingGoogleToken, selectedRole);
      if (result.success) {
        console.log("[DEBUG] AuthPage: Role confirmation successful, result:", result);
        
        // Store user data in localStorage for immediate access
        if (result.data) {
          const userData = {
            id: result.data.user_id || result.data.id,
            email: result.data.email,
            role: selectedRole,
            hasLocation: result.data.has_location || false,
            name: result.data.first_name + ' ' + result.data.last_name,
            profile_completed: selectedRole === 'worker' ? false : true
          };
          localStorage.setItem('user', JSON.stringify(userData));
          
          // Store tokens if available (using consistent keys)
          if (result.data.itaccess) {
            localStorage.setItem('access', result.data.access);
          }
          if (result.data.refresh) {
            localStorage.setItem('refresh', result.data.refresh);
          }
        }
        
        showNotification(language === "ar" 
          ? `مرحباً بك! تم تسجيل الدخول بنجاح كـ ${selectedRole === "client" ? "عميل" : "مزود خدمة"}`
          : `Welcome! Logged in successfully as ${selectedRole}`, 
          "success");
        await redirectAfterLogin(result.data);
      } else {
        showNotification(result.message || (language === "ar" ? "فشل تسجيل الدخول باستخدام Google" : "Google login failed"));
      }
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || (language === "ar" ? "حدث خطأ أثناء تسجيل الدخول" : "Login error occurred");
      showNotification(msg);
    } finally {
      setIsLoading(false);
      setShowRoleSelector(false);
      setPendingGoogleToken(null);
      setGoogleRole("client");
    }
  };

  const handleRoleCancel = () => {
    setShowRoleSelector(false);
    setPendingGoogleToken(null);
    setGoogleRole("client");
    showNotification(language === "ar" ? "تم إلغاء عملية تسجيل الدخول" : "Login cancelled", "warning");
  };

  const handleGoogleError = (error) => {
    console.error("Google login error:", error);
    let errorMessage = language === "ar" ? "فشل تسجيل الدخول باستخدام Google" : "Google login failed";

    if (error.error === "popup_closed_by_user") errorMessage = language === "ar" ? "تم إغلاق نافذة تسجيل الدخول" : "Popup closed";
    else if (error.error === "access_denied") errorMessage = language === "ar" ? "تم رفض الوصول إلى الحساب" : "Access denied";
    else if (error.error === "idpiframe_initialization_failed") errorMessage = language === "ar" ? "تعذر تهيئة تسجيل الدخول" : "Login initialization failed";

    showNotification(errorMessage);
  };

  const handleGoogleRoleSelection = async (selectedRole) => {
    if (!pendingGoogleToken) return;
    
    setIsLoading(true);
    setShowGoogleRoleSelector(false);
    
    try {
      const result = await authService.googleLogin(pendingGoogleToken, selectedRole);
      console.log("[DEBUG] AuthPage: Google login result:", result);
      
      if (result.success) {
        showNotification(
          language === "ar" ? "تم تسجيل الدخول بنجاح!" : "Login successful!",
          "success"
        );
        
        // Redirect based on user role
        await redirectAfterLogin(result.data);
      }
    } catch (error) {
      console.error("[DEBUG] AuthPage: Google login error:", error);
      showNotification(error.message, "error");
    } finally {
      setIsLoading(false);
      setPendingGoogleToken(null);
    }
  };

  const handleModeChange = (newMode) => setMode(newMode);
  const toggleLanguage = () => setLanguage(prev => prev === "ar" ? "en" : "ar");

  return (
    <div className="auth-page-container">
      {/* الهيدر المثبت في الأعلى */}
      <header className="auth-header">
        <div className="header-content">
          <div className="header-text">
            <h1>{language === "ar" ? "منصة خدماتك" : "Your Services Platform"}</h1>
            <p>{language === "ar" ? "منصتك لكل الخدمات في مكان واحد" : "Your platform for all services in one place"}</p>
          </div>
          
          <div className="header-controls">
            <button
              className="header-btn darkmode-toggle"
              onClick={() => setDarkMode(!darkMode)}
              aria-label={darkMode ? (language === "ar" ? "الوضع المضيء" : "Light Mode") : (language === "ar" ? "وضع الظلام" : "Dark Mode")}
            >
              {darkMode ? (language === "ar" ? "🌞 مضيء" : "🌞 Light") : (language === "ar" ? "🌙 مظلم" : "🌙 Dark")}
            </button>

            <button
              className="header-btn language-toggle"
              onClick={toggleLanguage}
              aria-label={language === "ar" ? "Change to English" : "التغيير إلى العربية"}
            >
              {language === "ar" ? "EN" : "عربي"}
            </button>
          </div>
        </div>
      </header>

      {/* المحتوى الرئيسي */}
      <div className="auth-container" dir={language === "ar" ? "rtl" : "ltr"}>
        <div className="auth-card">
          {/* Enhanced Welcome Section */}
          <div className="auth-welcome">
            <div className="brand-section">
              <div className="brand-title-container">
                <h1 className="brand-title">Khadamatk</h1>
                <div className="brand-icon-small">
                  <i className="fas fa-wrench"></i>
                </div>
              </div>
            </div>
            <p>
              {mode === "login" 
                ? (language === "ar" ? "سجل الدخول إلى حسابك للوصول إلى الخدمات" : "Sign in to your account to access services")
                : (language === "ar" ? "أنشئ حساباً جديداً للبدء" : "Create a new account to get started")
              }
            </p>
          </div>

          <div className="mode-switch">
            <button onClick={() => handleModeChange("login")} className={mode === "login" ? "active" : ""}>
              <i className="fas fa-sign-in-alt"></i>
              {language === "ar" ? "تسجيل الدخول" : "Login"}
            </button>
            <button onClick={() => handleModeChange("register")} className={mode === "register" ? "active" : ""}>
              <i className="fas fa-user-plus"></i>
              {language === "ar" ? "تسجيل جديد" : "Register"}
            </button>
          </div>

          <div className="auth-form-container">
            {mode === "login" ? (
              <LoginForm onSuccess={redirectAfterLogin} onError={showNotification} darkMode={darkMode} language={language} />
            ) : (
              <RegisterForm onSuccess={redirectAfterLogin} onError={showNotification} darkMode={darkMode} language={language} />
            )}
          </div>

          <div className="divider"><span>{language === "ar" ? "أو" : "Or"}</span></div>

          <div className="google-login-wrapper">
            <GoogleLoginButton onSuccess={handleGoogleSuccess} onError={handleGoogleError} language={language} />
            <p className="google-hint">{language === "ar" ? "استخدم حساب Google لتسجيل الدخول بسهولة وأمان" : "Use Google account for easy and secure login"}</p>
          </div>
        </div>

        {showRoleSelector && (
          <RoleSelector
            value={googleRole}
            onChange={setGoogleRole}
            onConfirm={() => handleRoleConfirm(googleRole)}
            onCancel={handleRoleCancel}
            isLoading={isLoading}
            darkMode={darkMode}
            language={language}
          />
        )}

        {showGoogleRoleSelector && (
          <RoleSelector
            value={googleRole}
            onChange={setGoogleRole}
            onConfirm={() => handleGoogleRoleSelection(googleRole)}
            onCancel={() => {
              setShowGoogleRoleSelector(false);
              setPendingGoogleToken(null);
            }}
            isLoading={isLoading}
            darkMode={darkMode}
            language={language}
          />
        )}

        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={language === "ar"}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme={darkMode ? "dark" : "light"}
        />
      </div>
    </div>
  );
};

export default AuthPage;