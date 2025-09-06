import React, { useState, useEffect, useRef } from 'react';
import { 
  BsBell, BsBellFill, BsCheck2All, BsX, BsCircleFill,
  BsInfoCircle, BsCheckCircle, BsExclamationTriangle, BsXCircle
} from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../services/NotificationService';

const NotificationDropdown = ({ isLoggedIn }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch unread count when user is logged in
  useEffect(() => {
    if (isLoggedIn) {
      fetchUnreadCount();
      
      // Set up enhanced polling for real-time updates
      const stopPolling = notificationService.startPolling((data) => {
        setUnreadCount(data.unread_count || 0);
      }, 30000); // Poll every 30 seconds with exponential backoff on errors

      return stopPolling;
    }
  }, [isLoggedIn]);

  const fetchUnreadCount = async () => {
    const result = await notificationService.getUnreadCount();
    if (result.success) {
      setUnreadCount(result.data.unread_count || 0);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    
    const result = await notificationService.getNotifications({
      page_size: 10 // Limit to recent 10 notifications
    });
    
    if (result.success) {
      setNotifications(result.data.results || result.data || []);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleDropdownToggle = () => {
    if (!isLoggedIn) return;
    
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchNotifications();
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read if unread
    if (!notification.is_read) {
      await notificationService.markAsRead(notification.id);
      fetchUnreadCount(); // Refresh count
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
      );
    }

    // Navigate to notification URL if available
    if (notification.target_url) {
      navigate(notification.target_url);
      setIsOpen(false);
    } else if (notification.url) {
      navigate(notification.url);
      setIsOpen(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    const result = await notificationService.markAllAsRead();
    if (result.success) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    }
  };

  const getNotificationIcon = (level) => {
    switch (level) {
      case 'success': return <BsCheckCircle className="text-success" />;
      case 'warning': return <BsExclamationTriangle className="text-warning" />;
      case 'error': return <BsXCircle className="text-danger" />;
      default: return <BsInfoCircle className="text-info" />;
    }
  };

  const formatTime = (dateString) => {
    return notificationService.formatNotificationTime(dateString);
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="notification-dropdown position-relative" ref={dropdownRef}>
      {/* Notification Bell Icon */}
      <button
        className={`control-button notification-button ${unreadCount > 0 ? 'has-unread' : ''} ${isOpen ? 'active' : ''}`}
        onClick={handleDropdownToggle}
        title="الإشعارات"
      >
        {unreadCount > 0 ? (
          <BsBellFill className="control-icon notification-icon-unread" />
        ) : (
          <BsBell className="control-icon notification-icon-read" />
        )}
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="notification-dropdown-menu position-absolute end-0 mt-2"
          style={{ 
            width: '350px', 
            maxHeight: '500px', 
            zIndex: 1050,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            border: '2px solid rgba(0, 123, 255, 0.2)',
            borderRadius: '16px',
            boxShadow: '0 12px 35px rgba(0, 123, 255, 0.2), 0 4px 15px rgba(0, 0, 0, 0.1)',
            animation: 'slideDown 0.3s ease-out',
            transformOrigin: 'top right',
            backdropFilter: 'blur(10px)',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div 
            className="d-flex justify-content-between align-items-center"
            style={{
              padding: '20px 24px',
              borderBottom: '2px solid rgba(0, 123, 255, 0.1)',
              background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
              color: 'white',
              borderRadius: '16px 16px 0 0'
            }}
          >
            <h6 className="mb-0" style={{ 
              fontSize: '18px', 
              fontWeight: '700', 
              color: 'white',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' 
            }}>الإشعارات</h6>
            <div className="d-flex gap-2">
              {unreadCount > 0 && (
                <button
                  className="btn btn-sm"
                  onClick={handleMarkAllAsRead}
                  title="تحديد الكل كمقروء"
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <BsCheck2All size={16} />
                </button>
              )}
              <button
                className="btn btn-sm"
                onClick={() => {
                  navigate('/notifications');
                  setIsOpen(false);
                }}
                title="عرض جميع الإشعارات"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                عرض الكل
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="notification-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {loading ? (
              <div className="text-center" style={{ padding: '40px 24px', color: '#6c757d' }}>
                <div 
                  className="spinner-border spinner-border-sm"
                  role="status"
                  style={{
                    width: '24px',
                    height: '24px',
                    border: '3px solid rgba(0, 123, 255, 0.2)',
                    borderTop: '3px solid #007bff',
                    borderRadius: '50%',
                    margin: '0 auto 16px'
                  }}
                >
                  <span className="visually-hidden">جاري التحميل...</span>
                </div>
                <div className="small" style={{ fontWeight: '500' }}>جاري تحميل الإشعارات...</div>
              </div>
            ) : error ? (
              <div className="text-center" style={{ padding: '40px 24px' }}>
                <BsXCircle className="mb-2" style={{ color: '#007bff', fontSize: '36px' }} />
                <div className="small" style={{ color: '#007bff', fontWeight: '500' }}>{error}</div>
                <button 
                  className="btn btn-sm mt-3"
                  onClick={fetchNotifications}
                  style={{
                    background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0, 123, 255, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  إعادة المحاولة
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center" style={{ padding: '40px 24px', color: '#6c757d' }}>
                <BsBell className="mb-3" style={{ fontSize: '36px', color: '#007bff', opacity: '0.7' }} />
                <div className="small" style={{ fontSize: '15px', fontWeight: '500', color: '#495057' }}>لا توجد إشعارات</div>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="notification-item cursor-pointer"
                  onClick={() => handleNotificationClick(notification)}
                  style={{ 
                    padding: '16px 24px',
                    borderBottom: '1px solid rgba(0, 123, 255, 0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    backgroundColor: !notification.is_read ? 'rgba(0, 123, 255, 0.05)' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 123, 255, 0.05) 0%, rgba(0, 86, 179, 0.05) 100%)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                    e.currentTarget.style.borderLeft = '3px solid #007bff';
                    e.currentTarget.style.paddingLeft = '21px';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = !notification.is_read ? 'rgba(0, 123, 255, 0.05)' : 'transparent';
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.borderLeft = 'none';
                    e.currentTarget.style.paddingLeft = '24px';
                  }}
                >
                  <div className="d-flex align-items-start gap-3">
                    <div className="notification-icon mt-1">
                      {getNotificationIcon(notification.level)}
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        {!notification.is_read && (
                          <BsCircleFill size={6} style={{ color: '#dc3545' }} />
                        )}
                        <div style={{ 
                          fontWeight: '700', 
                          fontSize: '14px', 
                          color: '#dc3545',
                          marginBottom: '6px'
                        }}>
                          {notificationService.getNotificationDisplayText(notification.verb)}
                        </div>
                      </div>
                      <div style={{ 
                        fontSize: '13px', 
                        color: '#495057', 
                        marginBottom: '6px',
                        lineHeight: '1.4'
                      }}>
                        {notification.short_message || notification.message}
                      </div>
                      <div style={{ 
                        fontSize: '11px', 
                        color: '#6c757d',
                        fontWeight: '500'
                      }}>
                        {formatTime(notification.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div 
              className="text-center"
              style={{
                padding: '16px 24px',
                borderTop: '2px solid rgba(220, 53, 69, 0.1)',
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                borderRadius: '0 0 16px 16px'
              }}
            >
              <button
                className="btn btn-sm"
                onClick={() => {
                  navigate('/notifications');
                  setIsOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(220, 53, 69, 0.3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #c82333 0%, #a71e2a 100%)';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 18px rgba(220, 53, 69, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.3)';
                }}
              >
                عرض جميع الإشعارات
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Custom CSS Animations */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        
        .notification-badge {
          animation: pulse 2s infinite;
        }
        
        .notification-icon {
          transition: transform 0.2s ease;
        }
        
        .notification-item:hover .notification-icon {
          transform: scale(1.1);
        }
        
        .notification-dropdown-menu {
          backdrop-filter: blur(10px);
        }

        /* Dark mode styles */
        .dark-mode .notification-dropdown-menu {
          background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%) !important;
          border-color: rgba(220, 53, 69, 0.3) !important;
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.4), 0 4px 15px rgba(220, 53, 69, 0.2) !important;
        }
        
        .notification-item {
          position: relative;
          overflow: hidden;
        }
        
        .notification-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(0, 119, 255, 0.1), transparent);
          transition: left 0.5s ease;
        }
        
        .notification-item:hover::before {
          left: 100%;
        }
      `}</style>
    </div>
  );
};

export default NotificationDropdown;
