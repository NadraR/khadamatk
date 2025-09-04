import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaScrewdriver, FaBell, FaSun, FaMoon, FaGlobe, FaHeart, FaComments, FaStar, FaBars, FaSignInAlt, FaSignOutAlt } from 'react-icons/fa';
import './Navbar.css';
import Sidebar from './Sidebar';
import { useTranslation } from "react-i18next";

const Navbar = () => {
  const [username, setUsername] = useState('');
  const [userRole, setUserRole] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notificationCount, setNotificationCount] = useState(9); // تغيير إلى رقم أكبر للاختبار
  const [messageCount, setMessageCount] = useState(0); // عدد الرسائل الجديدة
  const [scrolled, setScrolled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    // Check if user is logged in with proper validation
    const accessToken = localStorage.getItem('access');
    const userData = localStorage.getItem('user');
    
    console.log('[DEBUG] Navbar: Checking login state - accessToken:', accessToken ? 'FOUND' : 'NOT FOUND', 'userData:', userData ? 'FOUND' : 'NOT FOUND');
    
    if (accessToken && userData) {
      try {
        const user = JSON.parse(userData);
        console.log('[DEBUG] Navbar: Parsed user data:', user);
        
        // Validate that we have proper user data
        const hasValidName = user.name || (user.first_name && user.last_name);
        const hasValidRole = user.role && ['client', 'worker', 'admin'].includes(user.role);
        
        console.log('[DEBUG] Navbar: Validation - hasValidName:', hasValidName, 'hasValidRole:', hasValidRole);
        
        if (hasValidName && hasValidRole) {
          const fullName = user.name || `${user.first_name} ${user.last_name}`.trim();
          console.log('[DEBUG] Navbar: Setting user as logged in - name:', fullName, 'role:', user.role);
          setUsername(fullName);
          setUserRole(user.role);
          setIsLoggedIn(true);
        } else {
          // Invalid user data, clear it and show login button
          console.log('[DEBUG] Navbar: Invalid user data, clearing localStorage');
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          localStorage.removeItem('user');
          localStorage.removeItem('user_id');
          localStorage.removeItem('user_role');
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('[DEBUG] Navbar: Error parsing user data:', error);
        // Clear invalid data
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('user');
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_role');
        setIsLoggedIn(false);
      }
    } else {
      console.log('[DEBUG] Navbar: No token or user data, showing login button');
      setIsLoggedIn(false);
    }

    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);

    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Listen for storage changes to update login state
  useEffect(() => {
    const handleStorageChange = () => {
      console.log('[DEBUG] Navbar: Storage change detected, checking login state');
      const accessToken = localStorage.getItem('access');
      const userData = localStorage.getItem('user');
      
      if (!accessToken || !userData) {
        console.log('[DEBUG] Navbar: No token or user data after storage change');
        setIsLoggedIn(false);
        setUsername('');
        setUserRole('');
      } else {
        try {
          const user = JSON.parse(userData);
          console.log('[DEBUG] Navbar: Storage change - parsed user data:', user);
          const hasValidName = user.name || (user.first_name && user.last_name);
          const hasValidRole = user.role && ['client', 'worker', 'admin'].includes(user.role);
          
          if (hasValidName && hasValidRole) {
            const fullName = user.name || `${user.first_name} ${user.last_name}`.trim();
            console.log('[DEBUG] Navbar: Storage change - setting user as logged in:', fullName, user.role);
            setUsername(fullName);
            setUserRole(user.role);
            setIsLoggedIn(true);
          } else {
            console.log('[DEBUG] Navbar: Storage change - invalid user data');
            setIsLoggedIn(false);
            setUsername('');
            setUserRole('');
          }
        } catch (error) {
          console.error('[DEBUG] Navbar: Storage change - error parsing user data:', error);
          setIsLoggedIn(false);
          setUsername('');
          setUserRole('');
        }
      }
    };

    // Listen for both storage events and custom events
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLogin', handleStorageChange);
    window.addEventListener('userLogout', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogin', handleStorageChange);
      window.removeEventListener('userLogout', handleStorageChange);
    };
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === "ar" ? "en" : "ar";
    i18n.changeLanguage(newLang);
    document.documentElement.lang = newLang;
    // إزالة تغيير الاتجاه للحفاظ على مواضع الأيقونات
    // document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  const handleNotificationsClick = () => {
    alert(i18n.language === "ar" ? "الإشعارات مفتوحة" : "Notifications opened");
    setNotificationCount(0);
  };

  const handleMessagesClick = () => {
    // Reset message count when clicked
    setMessageCount(0);
    window.location.href = "/messages";
  };

  // دالة لتنسيق رقم الإشعارات إذا كان كبيراً
  const formatNotificationCount = (count) => {
    if (count > 99) return "99+";
    return count;
  };

  // Handle login redirect
  const handleLoginClick = () => {
    window.location.href = '/auth';
  };

  // Debug function to clear user data (can be called from browser console)
  const clearUserData = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_role');
    localStorage.removeItem('username');
    setUsername('');
    setUserRole('');
    setIsLoggedIn(false);
    console.log('User data cleared, login button should appear');
  };

  // Make clearUserData available globally for debugging
  window.clearUserData = clearUserData;
  
  // Function to manually refresh login state (for debugging)
  const refreshLoginState = () => {
    console.log('[DEBUG] Navbar: Manual refresh of login state');
    const accessToken = localStorage.getItem('access');
    const userData = localStorage.getItem('user');
    
    if (accessToken && userData) {
      try {
        const user = JSON.parse(userData);
        const hasValidName = user.name || (user.first_name && user.last_name);
        const hasValidRole = user.role && ['client', 'worker', 'admin'].includes(user.role);
        
        if (hasValidName && hasValidRole) {
          const fullName = user.name || `${user.first_name} ${user.last_name}`.trim();
          setUsername(fullName);
          setUserRole(user.role);
          setIsLoggedIn(true);
          console.log('[DEBUG] Navbar: Manual refresh - User logged in:', fullName, user.role);
        } else {
          setIsLoggedIn(false);
          console.log('[DEBUG] Navbar: Manual refresh - Invalid user data');
        }
      } catch (error) {
        console.error('[DEBUG] Navbar: Manual refresh - Error parsing user data:', error);
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
      console.log('[DEBUG] Navbar: Manual refresh - No token or user data');
    }
  };
  
  // Make refreshLoginState available globally for debugging
  window.refreshLoginState = refreshLoginState;

  // Handle logout
  const handleLogout = () => {
    // Clear all user data from localStorage
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_role');
    localStorage.removeItem('username');
    
    // Dispatch logout event
    window.dispatchEvent(new CustomEvent('userLogout'));
    
    // Reset state
    setUsername('');
    setUserRole('');
    setIsLoggedIn(false);
    
    // Redirect to home page
    window.location.href = '/';
  };

  // Generate avatar initials
  const getAvatarInitials = (name) => {
    if (!name || name === 'undefined undefined' || name.includes('undefined')) {
      return 'U';
    }
    const words = name.trim().split(' ').filter(word => word && word !== 'undefined');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    if (words.length === 1) {
      return words[0][0].toUpperCase();
    }
    return 'U';
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''} ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="navbar-container">
                  {/* Left Section - Logo and Title */}
        <div className="navbar-left">
          {/* Burger Menu Button */}
          <button className="burger-menu-button" onClick={toggleSidebar}>
            <FaBars />
          </button>
          <div className="logo-section">
            <FaScrewdriver className="logo-icon" />
            <div className="title-group">
              <h1 className="platform-title">Khadamatk</h1>
              <p className="platform-slogan">{t("platformSlogan")}</p>
            </div>
          </div>
        </div>

          {/* Center Section - Navigation Tabs */}
          <div className="navbar-center">
            <div className="navbar-nav">
              <Link 
                className={`navbar-nav-link ${location.pathname === '/' ? 'active' : ''}`} 
                to="/"
              >
                <FaHeart className="nav-icon" />
                {i18n.language === "ar" ? "الرئيسية" : "Home"}
              </Link>
              <Link 
                className={`navbar-nav-link ${location.pathname === '/services' ? 'active' : ''}`} 
                to="/services"
              >
                <FaScrewdriver className="nav-icon" />
                {i18n.language === "ar" ? "الخدمات" : "Services"}
              </Link>
              <Link 
                className={`navbar-nav-link ${location.pathname === '/about' ? 'active' : ''}`} 
                to="/about"
              >
                <FaStar className="nav-icon" />
                {i18n.language === "ar" ? "حول" : "About"}
              </Link>
              <Link 
                className={`navbar-nav-link ${location.pathname === '/contact' ? 'active' : ''}`} 
                to="/contact"
              >
                <FaComments className="nav-icon" />
                {i18n.language === "ar" ? "اتصل بنا" : "Contact"}
              </Link>
            </div>
          </div>

          {/* Right Section - Controls and User */}
          <div className="navbar-right">
            <div className="navbar-controls">
              {/* Language Toggle */}
              <button onClick={toggleLanguage} className="control-button language-button" title={i18n.language === "ar" ? "Switch to English" : "التبديل إلى العربية"}>
                <FaGlobe className="control-icon" />
                <span className="control-text">{i18n.language === "ar" ? "EN" : "عربي"}</span>
              </button>

              {/* Dark Mode Toggle */}
              <button onClick={toggleDarkMode} className="control-button theme-button" title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                {darkMode ? <FaSun className="control-icon" /> : <FaMoon className="control-icon" />}
              </button>

              {/* Messages Icon */}
              <button
                className="control-button message-button"
                title={i18n.language === "ar" ? "الرسائل" : "Messages"}
                onClick={handleMessagesClick}
              >
                <FaComments className="control-icon" />
                {/* لو عايز تعرض عدد الرسائل الجديدة */}
                {messageCount > 0 && (
                  <span className="notification-badge">
                    {formatNotificationCount(messageCount)}
                  </span>
                )}
              </button>

              {/* Notifications with improved badge */}
              <button 
                className="control-button notification-button" 
                title="Notifications"
                onClick={handleNotificationsClick}
              >
                <FaBell className="control-icon" />
                {notificationCount > 0 && (
                  <span className="notification-badge">
                    {formatNotificationCount(notificationCount)}
                  </span>
                )}
              </button>
            </div>

            {/* User Info or Login Button */}
            <div className={`user-section ${isLoggedIn ? 'user-logged-in' : 'user-not-logged-in'}`}>
              {isLoggedIn ? (
                <div className="user-info">
                  <div className="user-avatar">
                    <span className="avatar-initials">{getAvatarInitials(username)}</span>
                  </div>
                  <div className="user-details">
                    <span className="username">{username}</span>
                    <span className="user-role">
                      {userRole === 'client' ? (i18n.language === "ar" ? "عميل" : "Client") : 
                       userRole === 'worker' ? (i18n.language === "ar" ? "مزود خدمة" : "Service Provider") :
                       userRole === 'admin' ? (i18n.language === "ar" ? "مدير" : "Admin") : 
                       (i18n.language === "ar" ? "مستخدم" : "User")}
                    </span>
                  </div>
                  <button 
                    className="logout-button" 
                    onClick={handleLogout}
                    title={i18n.language === "ar" ? "تسجيل الخروج" : "Logout"}
                  >
                    <FaSignOutAlt />
                  </button>
                </div>
              ) : (
                <button className="login-button" onClick={handleLoginClick}>
                  <FaSignInAlt className="login-icon" />
                  <span className="login-text">{i18n.language === "ar" ? "تسجيل الدخول" : "Login"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
};

export default Navbar;