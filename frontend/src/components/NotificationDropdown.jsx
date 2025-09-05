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
      
      // Set up polling for real-time updates
      const cleanup = notificationService.pollNotifications((data) => {
        setUnreadCount(data.unread_count || 0);
      }, 30000); // Poll every 30 seconds

      return cleanup;
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
    if (notification.url) {
      navigate(notification.url);
      setIsOpen(false);
    } else if (notification.target_url) {
      navigate(notification.target_url);
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
        className="control-button notification-button"
        onClick={handleDropdownToggle}
        title="الإشعارات"
      >
        <BsBell className="control-icon" />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="notification-dropdown-menu position-absolute end-0 mt-2 bg-white border rounded shadow-lg"
          style={{ 
            width: '350px', 
            maxHeight: '500px', 
            zIndex: 1050,
            border: '1px solid #dee2e6',
            animation: 'slideDown 0.3s ease-out',
            transformOrigin: 'top right'
          }}
        >
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
            <h6 className="mb-0 fw-bold">الإشعارات</h6>
            <div className="d-flex gap-2">
              {unreadCount > 0 && (
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={handleMarkAllAsRead}
                  title="تحديد الكل كمقروء"
                >
                  <BsCheck2All size={16} />
                </button>
              )}
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => {
                  navigate('/notifications');
                  setIsOpen(false);
                }}
                title="عرض جميع الإشعارات"
              >
                عرض الكل
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="notification-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {loading ? (
              <div className="text-center p-4">
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                  <span className="visually-hidden">جاري التحميل...</span>
                </div>
                <div className="mt-2 small text-muted">جاري تحميل الإشعارات...</div>
              </div>
            ) : error ? (
              <div className="text-center p-4">
                <BsXCircle className="text-danger mb-2" size={24} />
                <div className="small text-danger">{error}</div>
                <button 
                  className="btn btn-sm btn-outline-primary mt-2"
                  onClick={fetchNotifications}
                >
                  إعادة المحاولة
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center p-4">
                <BsBell className="text-muted mb-2" size={24} />
                <div className="small text-muted">لا توجد إشعارات</div>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item p-3 border-bottom cursor-pointer ${
                    !notification.is_read ? 'bg-light' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                  style={{ 
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    borderLeft: !notification.is_read ? '3px solid #0077ff' : '3px solid transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                    e.currentTarget.style.transform = 'translateX(-2px)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = notification.is_read ? 'transparent' : '#f8f9fa';
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div className="d-flex align-items-start gap-3">
                    <div className="notification-icon mt-1">
                      {getNotificationIcon(notification.level)}
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        {!notification.is_read && (
                          <BsCircleFill size={6} className="text-primary" />
                        )}
                        <div className="fw-bold small text-truncate">
                          {notification.verb || 'إشعار جديد'}
                        </div>
                      </div>
                      <div className="small text-muted mb-1">
                        {notification.short_message || notification.message}
                      </div>
                      <div className="small text-muted">
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
            <div className="p-2 border-top text-center">
              <button
                className="btn btn-sm btn-link text-primary"
                onClick={() => {
                  navigate('/notifications');
                  setIsOpen(false);
                }}
              >
                عرض جميع الإشعارات
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Custom CSS Animations */}
      <style jsx>{`
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
