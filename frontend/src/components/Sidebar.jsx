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
  const [userRole, setUserRole] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);

  // Initialize chatbot with welcome message
  React.useEffect(() => {
    // Get user role from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserRole(user.role);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    // Set initial welcome message
    const welcomeMessage = {
      text: userRole === 'client' 
        ? "مرحباً! أنا مساعدك الذكي في منصة خدماتك. كيف يمكنني مساعدتك اليوم؟"
        : userRole === 'worker' 
        ? "مرحباً! أنا مساعدك الذكي في منصة خدماتك. كيف يمكنني مساعدتك في إدارة خدماتك؟"
        : "مرحباً! أنا مساعدك الذكي في منصة خدماتك. كيف يمكنني مساعدتك؟",
      sender: "bot",
      time: new Date().toLocaleTimeString()
    };
    setChatMessages([welcomeMessage]);
  }, [userRole]);

  // Chatbot knowledge base
  const chatbotKnowledge = {
    // General website information
    general: {
      "ما هي منصة خدماتك؟": "منصة خدماتك هي منصة رقمية تربط بين العملاء ومقدمي الخدمات في مختلف المجالات مثل السباكة والكهرباء والنجارة وغيرها.",
      "كيف تعمل المنصة؟": "المنصة تعمل بثلاث خطوات: 1) العميل يطلب خدمة 2) مقدم الخدمة يقبل الطلب 3) تنفيذ الخدمة والدفع",
      "هل المنصة آمنة؟": "نعم، المنصة آمنة تماماً. جميع المعاملات محمية ونحن نضمن جودة الخدمات المقدمة.",
      "كيف يمكنني التواصل مع الدعم؟": "يمكنك التواصل معنا عبر صفحة 'اتصل بنا' أو من خلال الدردشة المباشرة مع فريق الدعم."
    },
    // Client-specific information
    client: {
      "كيف أطلب خدمة؟": "1) اذهب إلى صفحة الخدمات 2) اختر الخدمة المطلوبة 3) املأ تفاصيل الطلب 4) حدد الموقع والوقت 5) أرسل الطلب",
      "كيف أدفع للخدمة؟": "يمكنك الدفع نقداً عند تنفيذ الخدمة أو عبر البطاقات الائتمانية. جميع المعاملات آمنة ومحمية.",
      "كيف أتابع طلباتي؟": "يمكنك متابعة طلباتك من خلال صفحة 'طلباتي' في لوحة التحكم الخاصة بك.",
      "ماذا لو لم أكن راضياً عن الخدمة؟": "نحن نضمن جودة الخدمات. يمكنك التواصل معنا وسنقوم بحل المشكلة أو استرداد المبلغ.",
      "كيف أقيّم مقدم الخدمة؟": "بعد إكمال الخدمة، ستظهر لك صفحة التقييم حيث يمكنك تقييم مقدم الخدمة وترك تعليق.",
      "كيف أضيف خدمة للمفضلة؟": "في صفحة الخدمات، اضغط على زر القلب بجانب الخدمة لإضافتها للمفضلة."
    },
    // Worker-specific information
    worker: {
      "كيف أبدأ العمل في المنصة؟": "1) سجل حساب كمزود خدمة 2) أكمل ملفك الشخصي 3) أضف خدماتك 4) ابدأ في استقبال الطلبات",
      "كيف أستقبل طلبات جديدة؟": "ستصل إليك إشعارات بطلبات جديدة في منطقتك. يمكنك قبول أو رفض الطلبات.",
      "كيف أضيف خدماتي؟": "من لوحة التحكم، اذهب إلى 'خدماتي' وأضف الخدمات التي تقدمها مع الأسعار والوصف.",
      "كيف أحصل على أموالي؟": "بعد إكمال الخدمة، سيتم تحويل المبلغ إلى حسابك خلال 24-48 ساعة.",
      "كيف أتواصل مع العملاء؟": "يمكنك التواصل مع العملاء عبر نظام المراسلة المدمج في المنصة.",
      "ماذا لو رفض العميل الخدمة؟": "يمكنك التواصل مع فريق الدعم لحل المشكلة. نحن نضمن حقوق جميع الأطراف.",
      "كيف أزيد من تقييمي؟": "قدم خدمات عالية الجودة، تواصل مع العملاء باحترافية، والتزم بالمواعيد المحددة."
    }
  };

  // Function to find the best response
  const findBestResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // Check general knowledge first
    for (const [key, value] of Object.entries(chatbotKnowledge.general)) {
      if (message.includes(key.toLowerCase()) || key.toLowerCase().includes(message)) {
        return value;
      }
    }

    // Check role-specific knowledge
    if (userRole === 'client') {
      for (const [key, value] of Object.entries(chatbotKnowledge.client)) {
        if (message.includes(key.toLowerCase()) || key.toLowerCase().includes(message)) {
          return value;
        }
      }
    } else if (userRole === 'worker') {
      for (const [key, value] of Object.entries(chatbotKnowledge.worker)) {
        if (message.includes(key.toLowerCase()) || key.toLowerCase().includes(message)) {
          return value;
        }
      }
    }

    // Default responses based on keywords
    if (message.includes('طلب') || message.includes('خدمة')) {
      return userRole === 'client' 
        ? "لطلب خدمة: 1) اذهب إلى صفحة الخدمات 2) اختر الخدمة 3) املأ التفاصيل 4) أرسل الطلب"
        : "لإدارة طلباتك: 1) تحقق من الإشعارات 2) راجع الطلبات الجديدة 3) قبول أو رفض الطلبات";
    }
    
    if (message.includes('دفع') || message.includes('مال')) {
      return userRole === 'client'
        ? "يمكنك الدفع نقداً عند تنفيذ الخدمة أو عبر البطاقات الائتمانية"
        : "ستحصل على أموالك بعد إكمال الخدمة خلال 24-48 ساعة";
    }
    
    if (message.includes('تقييم') || message.includes('نجمة')) {
      return "التقييمات تساعد في بناء الثقة. يمكنك تقييم الخدمات المقدمة لك أو الحصول على تقييمات من العملاء";
    }
    
    if (message.includes('مشكلة') || message.includes('خطأ')) {
      return "إذا واجهت أي مشكلة، يمكنك التواصل مع فريق الدعم عبر صفحة 'اتصل بنا' وسنقوم بحل المشكلة فوراً";
    }

    // Fallback responses
    const fallbackResponses = [
      "أعتذر، لم أفهم سؤالك. يمكنك أن تسأل عن كيفية طلب الخدمات، الدفع، التقييمات، أو أي شيء آخر.",
      "هل يمكنك إعادة صياغة سؤالك؟ يمكنني مساعدتك في مواضيع مثل الطلبات، الدفع، أو إدارة الحساب.",
      "أنا هنا لمساعدتك! اسأل عن أي شيء متعلق بالمنصة وسأجيب عليك فوراً."
    ];
    
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  };

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
      
      setChatMessages(prev => [...prev, userMessage]);
      setMessage("");
      
      // Show typing indicator
      const typingMessage = {
        text: "يكتب...",
        sender: "bot",
        time: new Date().toLocaleTimeString(),
        isTyping: true
      };
      setChatMessages(prev => [...prev, typingMessage]);
      
      // Generate intelligent response
      setTimeout(() => {
        const botResponse = {
          text: findBestResponse(message),
          sender: "bot",
          time: new Date().toLocaleTimeString(),
          isTyping: false
        };
        
        // Remove typing indicator and add response
        setChatMessages(prev => {
          const withoutTyping = prev.filter(msg => !msg.isTyping);
          return [...withoutTyping, botResponse];
        });
      }, 1500 + Math.random() * 1000); // Random delay between 1.5-2.5 seconds
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
                {msg.isTyping ? (
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                ) : (
                  <p>{msg.text}</p>
                )}
                <span className="burger-message-time">{msg.time}</span>
              </div>
            </div>
          ))}
          
          {/* Quick action buttons */}
          {chatMessages.length === 1 && (
            <div className="quick-actions">
              <h6>أسئلة شائعة:</h6>
              <div className="quick-action-buttons">
                {userRole === 'client' ? (
                  <>
                    <button 
                      className="quick-action-btn"
                      onClick={() => setMessage("كيف أطلب خدمة؟")}
                    >
                      كيف أطلب خدمة؟
                    </button>
                    <button 
                      className="quick-action-btn"
                      onClick={() => setMessage("كيف أدفع للخدمة؟")}
                    >
                      كيف أدفع؟
                    </button>
                    <button 
                      className="quick-action-btn"
                      onClick={() => setMessage("كيف أتابع طلباتي؟")}
                    >
                      متابعة الطلبات
                    </button>
                  </>
                ) : userRole === 'worker' ? (
                  <>
                    <button 
                      className="quick-action-btn"
                      onClick={() => setMessage("كيف أبدأ العمل في المنصة؟")}
                    >
                      كيف أبدأ العمل؟
                    </button>
                    <button 
                      className="quick-action-btn"
                      onClick={() => setMessage("كيف أستقبل طلبات جديدة؟")}
                    >
                      استقبال الطلبات
                    </button>
                    <button 
                      className="quick-action-btn"
                      onClick={() => setMessage("كيف أحصل على أموالي؟")}
                    >
                      الحصول على الأموال
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      className="quick-action-btn"
                      onClick={() => setMessage("ما هي منصة خدماتك؟")}
                    >
                      ما هي المنصة؟
                    </button>
                    <button 
                      className="quick-action-btn"
                      onClick={() => setMessage("كيف تعمل المنصة؟")}
                    >
                      كيف تعمل المنصة؟
                    </button>
                    <button 
                      className="quick-action-btn"
                      onClick={() => setMessage("هل المنصة آمنة؟")}
                    >
                      هل المنصة آمنة؟
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
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

      {/* Enhanced Chatbot Styles */}
      <style jsx="true">{`
        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 8px 0;
        }

        .typing-indicator span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #007bff;
          animation: typing 1.4s infinite ease-in-out;
        }

        .typing-indicator span:nth-child(1) {
          animation-delay: -0.32s;
        }

        .typing-indicator span:nth-child(2) {
          animation-delay: -0.16s;
        }

        @keyframes typing {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .quick-actions {
          padding: 16px;
          border-top: 1px solid #e9ecef;
          background: #f8f9fa;
        }

        .quick-actions h6 {
          margin-bottom: 12px;
          color: #495057;
          font-size: 14px;
          font-weight: 600;
        }

        .quick-action-buttons {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .quick-action-btn {
          background: #fff;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          padding: 10px 16px;
          font-size: 13px;
          color: #495057;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: right;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .quick-action-btn:hover {
          background: #007bff;
          color: white;
          border-color: #007bff;
          transform: translateY(-1px);
          box-shadow: 0 2px 6px rgba(0,123,255,0.3);
        }

        .quick-action-btn:active {
          transform: translateY(0);
        }

        .burger-message.bot {
          background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
          border-left: 3px solid #007bff;
        }

        .burger-message.user {
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
          color: white;
          margin-left: 20px;
        }

        .burger-message-content p {
          margin: 0;
          line-height: 1.5;
          word-wrap: break-word;
        }

        .burger-message-time {
          font-size: 11px;
          opacity: 0.7;
          margin-top: 4px;
          display: block;
        }

        .burger-chatbot-input-field:focus {
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0,123,255,0.2);
        }

        .burger-chatbot-send-btn {
          background: #007bff;
          border: none;
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .burger-chatbot-send-btn:hover {
          background: #0056b3;
          transform: scale(1.05);
        }

        .burger-chatbot-send-btn:active {
          transform: scale(0.95);
        }

        /* Dark mode styles */
        .dark-mode .quick-actions {
          background: #2c3e50;
          border-top-color: #34495e;
        }

        .dark-mode .quick-actions h6 {
          color: #bdc3c7;
        }

        .dark-mode .quick-action-btn {
          background: #34495e;
          border-color: #4a5f7a;
          color: #bdc3c7;
        }

        .dark-mode .quick-action-btn:hover {
          background: #007bff;
          color: white;
        }

        .dark-mode .burger-message.bot {
          background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
          color: #bdc3c7;
        }

        .dark-mode .burger-message.user {
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
        }
      `}</style>
    </>
  );
};

export default Sidebar; 