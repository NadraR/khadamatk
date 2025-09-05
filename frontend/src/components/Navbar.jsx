import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaScrewdriver, FaBell, FaSun, FaMoon, FaGlobe, FaHeart, FaComments, FaStar, FaBars, FaSignInAlt, FaSignOutAlt, FaEnvelope, FaEnvelopeOpen } from 'react-icons/fa';
import './Navbar.css';
import Sidebar from './Sidebar';
import NotificationDropdown from './NotificationDropdown';
import { useTranslation } from "react-i18next";
import chatService from '../services/chatService';

const Navbar = () => {
  const [username, setUsername] = useState('');
  const [userRole, setUserRole] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [messageCount, setMessageCount] = useState(0); // عدد الرسائل الجديدة
  const [unreadMessages, setUnreadMessages] = useState(false); // حالة الرسائل غير المقروءة
  const [recentMessages, setRecentMessages] = useState([]); // الرسائل الحديثة
  const [scrolled, setScrolled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showMessageDropdown, setShowMessageDropdown] = useState(false); // قائمة الرسائل المنسدلة
  const [messageLoading, setMessageLoading] = useState(false); // حالة تحميل الرسائل
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

    // Listen for user login events (including role changes)
    const handleUserLogin = (event) => {
      console.log('[DEBUG] Navbar: Received userLogin event:', event.detail);
      const user = event.detail;
      if (user && user.name && user.role) {
        setUsername(user.name);
        setUserRole(user.role);
        setIsLoggedIn(true);
      }
    };

    window.addEventListener('userLogin', handleUserLogin);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('userLogin', handleUserLogin);
    };
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


  // Enhanced message handling functions
  const handleMessagesClick = () => {
    if (!isLoggedIn) {
      handleLoginClick();
      return;
    }
    
    // Reset message count and unread status when clicked
    setMessageCount(0);
    setUnreadMessages(false);
    setShowMessageDropdown(false);
    
    // Store the last message check time
    localStorage.setItem('lastMessageCheck', Date.now().toString());
    
    window.location.href = "/messages";
  };

  const toggleMessageDropdown = (e) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      handleLoginClick();
      return;
    }
    setShowMessageDropdown(!showMessageDropdown);
  };

  // Fetch real message count from backend
  const fetchMessageCount = async () => {
    if (!isLoggedIn) return;
    
    try {
      setMessageLoading(true);
      const result = await chatService.getUnreadMessageCount();
      
      if (result.success) {
        const { unread_count, has_unread } = result.data;
        setMessageCount(unread_count);
        setUnreadMessages(has_unread);
        console.log(`[DEBUG] Navbar: Fetched ${unread_count} unread messages`);
      } else {
        console.warn('Failed to fetch message count:', result.error);
        // Fallback to 0 if API fails
        setMessageCount(0);
        setUnreadMessages(false);
      }
    } catch (error) {
      console.error('Error fetching message count:', error);
      setMessageCount(0);
      setUnreadMessages(false);
    } finally {
      setMessageLoading(false);
    }
  };

  // Fetch recent messages for dropdown
  const fetchRecentMessages = async () => {
    if (!isLoggedIn) return;
    
    try {
      const result = await chatService.getRecentMessages(3); // Get 3 recent messages
      
      if (result.success) {
        const messages = result.data.recent_messages.map(msg => ({
          id: msg.id,
          sender: msg.sender_name,
          preview: msg.message,
          time: chatService.getFormattedMessageTime(msg.timestamp, i18n.language),
          orderId: msg.order_id,
          conversationId: msg.conversation_id
        }));
        setRecentMessages(messages);
        console.log(`[DEBUG] Navbar: Fetched ${messages.length} recent messages`);
      } else {
        console.warn('Failed to fetch recent messages:', result.error);
        setRecentMessages([]);
      }
    } catch (error) {
      console.error('Error fetching recent messages:', error);
      setRecentMessages([]);
    }
  };

  // Check for new messages periodically
  useEffect(() => {
    if (isLoggedIn) {
      fetchMessageCount();
      fetchRecentMessages();
      
      // Check for new messages every 30 seconds
      const messageInterval = setInterval(() => {
        fetchMessageCount();
        fetchRecentMessages();
      }, 30000);
      
      return () => clearInterval(messageInterval);
    } else {
      // Reset message state when logged out
      setMessageCount(0);
      setUnreadMessages(false);
      setRecentMessages([]);
    }
  }, [isLoggedIn]);

  // دالة لتنسيق رقم الإشعارات إذا كان كبيراً
  const formatNotificationCount = (count) => {
    if (count > 99) return "99+";
    return count;
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMessageDropdown && !event.target.closest('.message-dropdown-container')) {
        setShowMessageDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMessageDropdown]);

  // Handle message item click
  const handleMessageItemClick = (message) => {
    // Navigate to the specific conversation/order
    window.location.href = `/order/${message.orderId}`;
    setShowMessageDropdown(false);
  };

  // Message dropdown component with real data
  const MessageDropdown = () => (
    <div className="message-dropdown">
      <div className="dropdown-header">
        <h4>{i18n.language === "ar" ? "الرسائل" : "Messages"}</h4>
        <span className="message-count-text">
          {messageLoading ? (
            i18n.language === "ar" ? "جاري التحميل..." : "Loading..."
          ) : messageCount > 0 ? (
            i18n.language === "ar" ? `${messageCount} جديدة` : `${messageCount} new`
          ) : (
            i18n.language === "ar" ? "لا توجد رسائل جديدة" : "No new messages"
          )}
        </span>
      </div>
      <div className="dropdown-content">
        {messageLoading ? (
          <div className="loading-messages">
            <div className="loading-spinner"></div>
            <p>{i18n.language === "ar" ? "جاري تحميل الرسائل..." : "Loading messages..."}</p>
          </div>
        ) : recentMessages.length > 0 ? (
          <div className="message-preview-list">
            {recentMessages.map((message) => (
              <div 
                key={message.id} 
                className="message-preview-item"
                onClick={() => handleMessageItemClick(message)}
              >
                <div className="message-sender">
                  {message.sender}
                </div>
                <div className="message-preview">
                  {message.preview}
                </div>
                <div className="message-time">
                  {message.time}
                </div>
              </div>
            ))}
            {messageCount > recentMessages.length && (
              <div className="more-messages-indicator">
                <p>
                  {i18n.language === "ar" 
                    ? `و ${messageCount - recentMessages.length} رسائل أخرى` 
                    : `and ${messageCount - recentMessages.length} more messages`
                  }
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="no-messages">
            <FaEnvelope className="no-messages-icon" />
            <p>{i18n.language === "ar" ? "لا توجد رسائل جديدة" : "No new messages"}</p>
          </div>
        )}
      </div>
      <div className="dropdown-footer">
        <button 
          className="view-all-messages-btn" 
          onClick={handleMessagesClick}
          disabled={messageLoading}
        >
          {i18n.language === "ar" ? "عرض جميع الرسائل" : "View All Messages"}
        </button>
      </div>
    </div>
  );

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

  // Add CSS styles for message dropdown (inject into head)
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* Message Dropdown Styles */
      .message-dropdown-container {
        position: relative;
        display: inline-block;
      }

      /* Message Button Styling - Blue Theme */
      .message-button {
        background: rgba(0, 123, 255, 0.1) !important;
        border: 1px solid rgba(0, 123, 255, 0.2) !important;
        position: relative;
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .message-button:hover {
        background: rgba(0, 123, 255, 0.2) !important;
        border-color: rgba(0, 123, 255, 0.4) !important;
      }

      .message-button:hover .control-icon {
        color: #007bff !important;
        transform: scale(1.1);
      }

      .message-button.has-unread {
        background: linear-gradient(135deg, #007bff, #0056b3) !important;
        border-color: rgba(0, 123, 255, 0.4) !important;
        animation: pulse-message 2s infinite;
      }

      .message-button.has-unread .control-icon {
        color: white !important;
      }

      .message-button.active {
        background: rgba(0, 123, 255, 0.25) !important;
        border-color: rgba(0, 123, 255, 0.5) !important;
        color: white;
      }

      .message-icon-unread {
        color: #fff;
        animation: shake 0.5s ease-in-out;
      }

      .message-icon-read {
        color: var(--text-color);
      }

      .message-badge {
        position: absolute;
        top: -2px;
        right: -2px;
        background: linear-gradient(135deg, #007bff, #0056b3);
        color: white;
        border-radius: 50%;
        min-width: 22px;
        height: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 700;
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0, 123, 255, 0.5);
        animation: bounce-in 0.3s ease-out;
        padding: 0 4px;
        line-height: 1;
      }

      .message-dropdown {
        position: absolute;
        top: calc(100% + 10px);
        right: 0;
        width: 320px;
        background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
        border: 2px solid rgba(0, 123, 255, 0.2);
        border-radius: 16px;
        box-shadow: 0 12px 35px rgba(0, 123, 255, 0.2), 0 4px 15px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        animation: slideDown 0.3s ease-out;
        max-height: 450px;
        overflow: hidden;
        backdrop-filter: blur(10px);
      }

      .dropdown-header {
        padding: 20px 24px;
        border-bottom: 2px solid rgba(0, 123, 255, 0.1);
        background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
        color: white;
        border-radius: 16px 16px 0 0;
      }

      .dropdown-header h4 {
        margin: 0 0 4px 0;
        font-size: 18px;
        font-weight: 700;
        color: white;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      }

      .message-count-text {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.9);
        font-weight: 500;
      }

      .dropdown-content {
        max-height: 240px;
        overflow-y: auto;
      }

      .message-preview-list {
        padding: 8px 0;
      }

      .message-preview-item {
        padding: 16px 24px;
        border-bottom: 1px solid rgba(0, 123, 255, 0.1);
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }

      .message-preview-item:hover {
        background: linear-gradient(135deg, rgba(0, 123, 255, 0.05) 0%, rgba(0, 86, 179, 0.05) 100%);
        transform: translateX(4px);
        border-left: 3px solid #007bff;
        padding-left: 21px;
      }

      .message-preview-item:last-child {
        border-bottom: none;
      }

      .message-sender {
        font-weight: 700;
        font-size: 14px;
        color: #007bff;
        margin-bottom: 6px;
      }

      .message-preview {
        font-size: 13px;
        color: #495057;
        margin-bottom: 6px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        line-height: 1.4;
      }

      .message-time {
        font-size: 11px;
        color: #6c757d;
        font-weight: 500;
      }

      .no-messages {
        padding: 40px 24px;
        text-align: center;
        color: #6c757d;
      }

      .no-messages-icon {
        font-size: 36px;
        color: #007bff;
        margin-bottom: 16px;
        opacity: 0.7;
      }

      .no-messages p {
        margin: 0;
        font-size: 15px;
        font-weight: 500;
        color: #495057;
      }

      .dropdown-footer {
        padding: 16px 24px;
        border-top: 2px solid rgba(0, 123, 255, 0.1);
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        border-radius: 0 0 16px 16px;
      }

      .view-all-messages-btn {
        width: 100%;
        padding: 12px 20px;
        background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
        color: white;
        border: none;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .view-all-messages-btn:hover {
        background: linear-gradient(135deg, #0056b3 0%, #004085 100%);
        transform: translateY(-2px);
        box-shadow: 0 6px 18px rgba(0, 123, 255, 0.4);
      }

      .view-all-messages-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }

      /* Loading states */
      .loading-messages {
        padding: 40px 24px;
        text-align: center;
        color: #6c757d;
      }

      .loading-spinner {
        width: 24px;
        height: 24px;
        border: 3px solid rgba(0, 123, 255, 0.2);
        border-top: 3px solid #007bff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 16px;
      }

      .more-messages-indicator {
        padding: 12px 24px;
        text-align: center;
        border-top: 1px solid rgba(0, 123, 255, 0.1);
        background: linear-gradient(135deg, rgba(0, 123, 255, 0.02) 0%, rgba(0, 86, 179, 0.02) 100%);
      }

      .more-messages-indicator p {
        margin: 0;
        font-size: 13px;
        color: #007bff;
        font-style: italic;
        font-weight: 500;
      }

      /* Message item hover effects */
      .message-preview-item {
        position: relative;
        overflow: hidden;
      }

      .message-preview-item::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: 0;
        height: 2px;
        width: 0;
        background: var(--primary-color);
        transition: width 0.3s ease;
      }

      .message-preview-item:hover::after {
        width: 100%;
      }

      /* Enhanced message button states */
      .message-button.has-unread {
        position: relative;
        overflow: hidden;
      }

      .message-button.has-unread::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
        animation: shimmer 2s infinite;
      }

      /* Animations */
      @keyframes pulse-message {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }

      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-2px); }
        75% { transform: translateX(2px); }
      }

      @keyframes bounce-in {
        0% { transform: scale(0); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
      }

      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      @keyframes shimmer {
        0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
        100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
      }

      /* Dark mode adjustments */
      .dark-mode .message-button {
        background: rgba(0, 123, 255, 0.15) !important;
        border-color: rgba(0, 123, 255, 0.3) !important;
      }

      .dark-mode .message-button:hover {
        background: rgba(0, 123, 255, 0.25) !important;
        border-color: rgba(0, 123, 255, 0.5) !important;
      }

      .dark-mode .message-dropdown {
        background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
        border-color: rgba(0, 123, 255, 0.3);
        box-shadow: 0 12px 35px rgba(0, 0, 0, 0.4), 0 4px 15px rgba(0, 123, 255, 0.2);
      }

      .dark-mode .dropdown-header {
        background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
        border-bottom-color: rgba(0, 123, 255, 0.2);
      }

      .dark-mode .message-preview-item {
        border-bottom-color: rgba(0, 123, 255, 0.15);
      }

      .dark-mode .message-preview-item:hover {
        background: linear-gradient(135deg, rgba(0, 123, 255, 0.1) 0%, rgba(0, 86, 179, 0.1) 100%);
        border-left-color: #0056b3;
      }

      .dark-mode .message-sender {
        color: #0056b3;
      }

      .dark-mode .message-preview {
        color: #bdc3c7;
      }

      .dark-mode .message-time {
        color: #95a5a6;
      }

      .dark-mode .no-messages {
        color: #95a5a6;
      }

      .dark-mode .no-messages-icon {
        color: #0056b3;
      }

      .dark-mode .no-messages p {
        color: #bdc3c7;
      }

      .dark-mode .dropdown-footer {
        background: linear-gradient(135deg, #34495e 0%, #2c3e50 100%);
        border-top-color: rgba(0, 123, 255, 0.2);
      }

      .dark-mode .more-messages-indicator {
        background: linear-gradient(135deg, rgba(0, 123, 255, 0.05) 0%, rgba(0, 86, 179, 0.05) 100%);
        border-top-color: rgba(0, 123, 255, 0.15);
      }

      .dark-mode .more-messages-indicator p {
        color: #0056b3;
      }

      /* RTL Support */
      [dir="rtl"] .message-dropdown {
        right: auto;
        left: 0;
      }

      /* Mobile responsiveness */
      @media (max-width: 768px) {
        .message-dropdown {
          width: 280px;
          right: -20px;
        }

        [dir="rtl"] .message-dropdown {
          left: -20px;
        }
      }
    `;
    
    document.head.appendChild(style);
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

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

              {/* Enhanced Messages Icon with Dropdown */}
              <div className="message-dropdown-container">
                <button
                  className={`control-button message-button ${unreadMessages ? 'has-unread' : ''} ${showMessageDropdown ? 'active' : ''}`}
                  title={i18n.language === "ar" ? "الرسائل" : "Messages"}
                  onClick={toggleMessageDropdown}
                >
                  {unreadMessages ? (
                    <FaEnvelopeOpen className="control-icon message-icon-unread" />
                  ) : (
                    <FaEnvelope className="control-icon message-icon-read" />
                  )}
                  {messageCount > 0 && (
                    <span className="notification-badge message-badge">
                      {formatNotificationCount(messageCount)}
                    </span>
                  )}
                </button>
                
                {/* Message Dropdown */}
                {showMessageDropdown && isLoggedIn && <MessageDropdown />}
              </div>

              {/* Notifications Dropdown */}
              <NotificationDropdown isLoggedIn={isLoggedIn} />
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