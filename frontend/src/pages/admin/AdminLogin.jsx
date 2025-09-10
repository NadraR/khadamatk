import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import { adminAuth } from "../../services/adminApiService";
import "./AdminLogin.css";

const AdminLogin = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasAttemptedLogin, setHasAttemptedLogin] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("ar"); // ar | en
  const { login, isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();

  // Debug environment variables
  console.log('AdminLogin: Environment variables:', {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    NODE_ENV: import.meta.env.NODE_ENV
  });

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

  // Redirect to admin dashboard when authenticated (only if user just logged in)
  useEffect(() => {
    console.log('AdminLogin useEffect: isAuthenticated =', isAuthenticated, 'hasAttemptedLogin =', hasAttemptedLogin);
    // Only redirect if user is authenticated AND has attempted login (not from previous session)
    if (isAuthenticated && hasAttemptedLogin) {
      console.log('AdminLogin: User is authenticated after login attempt, redirecting to /admin');
      navigate("/admin");
    }
  }, [isAuthenticated, navigate, hasAttemptedLogin]);

  const toggleLanguage = () => setLanguage(prev => prev === "ar" ? "en" : "ar");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setHasAttemptedLogin(true);
    
    try {
      const result = await adminAuth.login(formData.username, formData.password);
      
      if (result.success) {
        // استخدام context للتعامل مع تسجيل الدخول
        console.log('AdminLogin: Login successful, data:', result.data);
        await login(result.data);
        console.log('AdminLogin: Login context updated, useEffect will handle navigation');
        // لا نحتاج navigate هنا لأن useEffect سيتولى التوجيه
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundImage: 'url(/images/60040011.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      paddingTop: '80px',
      position: 'relative'
    }}>
      {/* Header */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'transparent',
        color: 'white',
        height: '80px',
        zIndex: 1000,
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px'
        }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 600 }}>
              {language === "ar" ? "منصة خدماتك" : "Your Services Platform"}
            </h1>
            <p style={{ fontSize: '0.9rem', margin: '5px 0 0 0', opacity: 0.9 }}>
              {language === "ar" ? "منصتك لإدارة جميع الخدمات" : "Your platform for managing all services"}
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* زر تغيير المظهر */}
            <button
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                color: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
              onClick={() => setDarkMode(!darkMode)}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                e.target.style.transform = 'scale(1.05)';
                e.target.style.border = '1px solid rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                e.target.style.transform = 'scale(1)';
                e.target.style.border = '1px solid rgba(255, 255, 255, 0.2)';
              }}
              aria-label={darkMode ? (language === "ar" ? "الوضع المضيء" : "Light Mode") : (language === "ar" ? "وضع الظلام" : "Dark Mode")}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            {/* زر تغيير اللغة */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                color: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                fontSize: '0.9rem',
                fontWeight: 600
              }}
              onClick={toggleLanguage}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                e.target.style.transform = 'scale(1.05)';
                e.target.style.border = '1px solid rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                e.target.style.transform = 'scale(1)';
                e.target.style.border = '1px solid rgba(255, 255, 255, 0.2)';
              }}
              aria-label={language === "ar" ? "Change to English" : "التغيير إلى العربية"}
            >
              <span>🌐</span>
              <span>{language === "ar" ? "EN" : "عربي"}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Overlay for better readability */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: darkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)',
        zIndex: 1
      }}></div>

      {/* Main Content */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 80px)',
        padding: '20px'
      }}>
      <div style={{
        background: darkMode ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        padding: '2rem',
        borderRadius: '16px',
        boxShadow: darkMode ? '0 6px 30px rgba(0, 0, 0, 0.5)' : '0 6px 30px rgba(0, 0, 0, 0.3)',
        border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.1)',
        width: '100%',
        maxWidth: '500px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 2
      }}>
        <h1 style={{ color: '#0077ff', marginBottom: '1rem' }}>
          {language === "ar" ? "خدماتك" : "Khadamatk"}
        </h1>
        <p style={{ marginBottom: '2rem', color: darkMode ? '#9ca3af' : '#666' }}>
          {language === "ar" ? "سجل الدخول إلى لوحة التحكم الإدارية" : "Sign in to Admin Dashboard"}
        </p>
        
        {error && (
          <div style={{
            background: '#e74c3c',
            color: 'white',
            padding: '1rem',
            borderRadius: '12px',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ textAlign: language === "ar" ? "right" : "left" }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: darkMode ? '#e5e7eb' : '#1e293b' }}>
              {language === "ar" ? "اسم الأدمن" : "Admin Username"}
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder={language === "ar" ? "أدخل اسم الأدمن" : "Enter admin username"}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: darkMode ? '2px solid #374151' : '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '1rem',
                boxSizing: 'border-box',
                textAlign: language === "ar" ? "right" : "left",
                background: darkMode ? '#1f2937' : '#f8fafc',
                color: darkMode ? '#e5e7eb' : '#1e293b'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: darkMode ? '#e5e7eb' : '#1e293b' }}>
              {language === "ar" ? "كلمة المرور" : "Password"}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={language === "ar" ? "أدخل كلمة المرور" : "Enter password"}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: darkMode ? '2px solid #374151' : '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '1rem',
                boxSizing: 'border-box',
                textAlign: language === "ar" ? "right" : "left",
                background: darkMode ? '#1f2937' : '#f8fafc',
                color: darkMode ? '#e5e7eb' : '#1e293b'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: 'linear-gradient(135deg, #0077ff, #4da6ff)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? (language === "ar" ? "جاري التحميل..." : "Loading...") : (language === "ar" ? "تسجيل الدخول" : "Sign In")}
          </button>
        </form>
      </div>
      </div>
    </div>
  );
};

export default AdminLogin;
