import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  FaHome, 
  FaWrench, 
  FaUserFriends, 
  FaCog, 
  FaSignOutAlt, 
  FaComments,
  FaLightbulb,
  FaStar,
  FaHistory,
  FaRobot,
  FaTimes,
  FaBars
} from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { authService } from "../services/authService";
import "./Sidebar.css";

const Sidebar = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      text: t("chatbot.welcome"),
      sender: "bot",
      time: new Date().toLocaleTimeString()
    }
  ]);

  const closeMenu = () => {
    // Add a small delay to allow smooth navbar animation
    setTimeout(() => {
      onClose();
    }, 100);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      const userMessage = {
        text: message,
        sender: "user",
        time: new Date().toLocaleTimeString()
      };
      
      setChatMessages([...chatMessages, userMessage]);
      setMessage("");
      
      setTimeout(() => {
        const botResponse = {
          text: t("chatbot.response"),
          sender: "bot",
          time: new Date().toLocaleTimeString()
        };
        setChatMessages(prev => [...prev, botResponse]);
      }, 1000);
    }
  };

  const toggleChatbot = () => {
    setChatbotOpen(!chatbotOpen);
    closeMenu();
  };

  const handleLogout = async () => {
    try {
      console.log('[DEBUG] Sidebar: Starting logout process');
      
      // Clear all user data from localStorage
      authService.clearAuth();
      
      // Dispatch logout event to notify navbar
      window.dispatchEvent(new CustomEvent('userLogout'));
      
      // Close the sidebar first
      closeMenu();
      
      // Show success toast with a slight delay to ensure it displays
      setTimeout(() => {
        console.log('[DEBUG] Sidebar: Showing logout success toast');
        toast.success(t('sidebar.logoutSuccess') || 'تم تسجيل الخروج بنجاح', {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
          rtl: t('language') === 'ar'
        });
      }, 100);
      
      // Redirect to home page after giving time for toast to show
      setTimeout(() => {
        console.log('[DEBUG] Sidebar: Redirecting to home page');
        window.location.href = '/';
      }, 1500);
      
    } catch (error) {
      console.error('[DEBUG] Sidebar: Logout error:', error);
      toast.error(t('sidebar.logoutError') || 'حدث خطأ أثناء تسجيل الخروج', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
        rtl: t('language') === 'ar'
      });
    }
  };

  // Test function to verify toast is working
  const testToast = () => {
    console.log('[DEBUG] Sidebar: Testing toast');
    toast.success('Test toast message', {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "light",
      rtl: t('language') === 'ar'
    });
  };

  // Make test function available globally for debugging
  window.testSidebarToast = testToast;

  return (
    <>
      {/* Overlay عندما يكون Menu مفتوح */}
      {isOpen && <div className="burger-overlay" onClick={closeMenu}></div>}

      {/* Sidebar كمكون Burger Menu */}
      <div className={`burger-sidebar ${isOpen ? 'burger-sidebar-open' : ''}`}>
        <div className="burger-sidebar-content">
          {/* Header مع زر الإغلاق */}
          <div className="burger-header">
            <div className="burger-logo">
              <FaWrench className="burger-logo-icon" />
              <h3>Khadamatk</h3>
            </div>
            <button className="burger-close-btn" onClick={closeMenu}>
              <FaTimes />
            </button>
          </div>

          {/* القائمة الرئيسية */}
          <div className="burger-menu-items">
            <Link to="/Home" className="burger-menu-item" onClick={closeMenu}>
              <FaHome className="burger-item-icon" />
              <span>{t("sidebar.home")}</span>
            </Link>

            <Link to="/services" className="burger-menu-item" onClick={closeMenu}>
              <FaWrench className="burger-item-icon" />
              <span>{t("sidebar.services")}</span>
            </Link>

            <Link to="/Clients" className="burger-menu-item" onClick={closeMenu}>
              <FaUserFriends className="burger-item-icon" />
              <span>{t("sidebar.clients")}</span>
            </Link>

            <Link to="/Settings" className="burger-menu-item" onClick={closeMenu}>
              <FaCog className="burger-item-icon" />
              <span>{t("sidebar.settings")}</span>
            </Link>
          </div>

          {/* الميزات الإضافية */}
          <div className="burger-features">
            <h4>{t("Orders")}</h4>
            
            <div className="burger-feature-item">
              <FaStar className="burger-feature-icon" />
              <div>
                <h5>{t("favorites")}</h5>
                <p>{t("favorite orders")}</p>
              </div>
            </div>

            <div className="burger-feature-item">
              <FaHistory className="burger-feature-icon" />
              <div>
                <h5>{t("history")}</h5>
                <p>{t("orders history")}</p>
              </div>
            </div>

            <div className="burger-feature-item">
              <FaLightbulb className="burger-feature-icon" />
              <div>
                <h5>{t("suggestions")}</h5>
                <p>{t("suggested services")}</p>
              </div>
            </div>
          </div>

          {/* زر الدردشة الذكية */}
          <div className="burger-chatbot-section">
            <button className="burger-chatbot-btn" onClick={toggleChatbot}>
              <FaRobot className="burger-chatbot-icon" />
              <span>{t("sidebar.chatbot")}</span>
            </button>
          </div>

          {/* تسجيل الخروج */}
          <div className="burger-footer">
            <button className="burger-logout-btn" onClick={handleLogout}>
              <FaSignOutAlt className="burger-logout-icon" />
              <span>{t("sidebar.logout")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* نافذة الدردشة الذكية المنبثقة */}
      <div className={`burger-chatbot-window ${chatbotOpen ? 'burger-chatbot-open' : ''}`}>
        <div className="burger-chatbot-header">
          <div className="burger-chatbot-title">
            <FaRobot />
            <span>{t("chatbot.title")}</span>
          </div>
          <button className="burger-chatbot-close" onClick={() => setChatbotOpen(false)}>
            <FaTimes />
          </button>
        </div>

        <div className="burger-chatbot-messages">
          {chatMessages.map((msg, index) => (
            <div key={index} className={`burger-message ${msg.sender}`}>
              <div className="burger-message-content">
                <p>{msg.text}</p>
                <span className="burger-message-time">{msg.time}</span>
              </div>
            </div>
          ))}
        </div>

        <form className="burger-chatbot-input" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t("chatbot.placeholder")}
            className="burger-chatbot-input-field"
          />
          <button type="submit" className="burger-chatbot-send-btn">
            <FaComments />
          </button>
        </form>
      </div>

      {/* Toast Container for logout notifications */}
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={t('language') === 'ar'}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
};

export default Sidebar;