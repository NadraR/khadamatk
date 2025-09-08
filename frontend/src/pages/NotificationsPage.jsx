import React, { useState, useEffect, useRef } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import { 
  BsBell, BsCheck2All, BsFilter, BsSearch, BsX,
  BsInfoCircle, BsCheckCircle, BsExclamationTriangle, BsXCircle,
  BsCircleFill, BsEye, BsEyeSlash, BsArrowClockwise, BsCheckLg, BsXLg
} from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { notificationService } from '../services/NotificationService';
import apiService from '../services/ApiService';

const NotificationsPage = () => {
  const injected = useRef(false);
  const navigate = useNavigate();
  
  // State management
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});
  const [actionLoading, setActionLoading] = useState({});
  
  // Filter states
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterRead, setFilterRead] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Inject CSS styles
  useEffect(() => {
    if (injected.current) return;
    const css = `
    :root {
      --primary:#0077ff;
      --primary-dark:#0056b3;
      --gradient:linear-gradient(135deg, #0077ff, #4da6ff);
      --bg:#f9fbff;
      --muted:#6b7280;
    }
    body { background:var(--bg); color:#0f172a; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }

    .notifications-hero { 
      background: var(--gradient); 
      color: white; 
      padding: 80px 0 60px 0; 
      text-align: center; 
      border-radius: 0 0 2rem 2rem; 
      margin-bottom: 2rem;
    }
    .notifications-hero h1 { font-size: 2.5rem; font-weight: 800; margin-bottom: 1rem; }
    .notifications-hero p { font-size: 1.1rem; opacity: 0.9; }
    
    .notification-card { 
      background: #fff; 
      border-radius: 1rem; 
      padding: 1.5rem; 
      box-shadow: 0 4px 12px rgba(0,0,0,.05); 
      transition: .3s; 
      border-left: 4px solid transparent;
      cursor: pointer;
    }
    .notification-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,.1); }
    .notification-card.unread { 
      border-left-color: var(--primary); 
      background: #f8fbff; 
    }
    .notification-card.level-success { border-left-color: #10b981; }
    .notification-card.level-warning { border-left-color: #f59e0b; }
    .notification-card.level-error { border-left-color: #ef4444; }
    .notification-card.level-info { border-left-color: #3b82f6; }
    
    .filter-card { 
      background: #fff; 
      border-radius: 1rem; 
      padding: 1.5rem; 
      box-shadow: 0 4px 12px rgba(0,0,0,.05); 
      margin-bottom: 1.5rem;
    }
    
    .stats-card { 
      background: #fff; 
      border-radius: 1rem; 
      padding: 1rem; 
      text-align: center; 
      box-shadow: 0 4px 12px rgba(0,0,0,.05); 
      transition: .3s; 
    }
    .stats-card:hover { transform: translateY(-2px); }
    .stats-number { font-size: 1.8rem; font-weight: 900; color: var(--primary); }
    .stats-label { color: var(--muted); font-size: 0.9rem; }
    
    .btn-cta {
      background: var(--gradient);
      color: #fff !important;
      border:none;
      padding:.5rem 1rem;
      border-radius:50px;
      font-weight:600;
      transition:.3s;
    }
    .btn-cta:hover { opacity:.9; transform:scale(1.05); }
    `;
    const style = document.createElement("style");
    style.innerHTML = css;
    document.head.appendChild(style);
    injected.current = true;
  }, []);

  // Load notifications and stats on component mount
  useEffect(() => {
    loadNotifications();
    loadStats();
  }, []);

  // Apply filters when they change
  useEffect(() => {
    applyFilters();
  }, [notifications, filterLevel, filterRead, searchTerm]);

  const loadNotifications = async (pageNum = 1, append = false) => {
    setLoading(true);
    setError(null);
    
    const result = await notificationService.getNotifications({
      page: pageNum,
      page_size: 20
    });
    
    if (result.success) {
      // Handle both paginated and non-paginated responses
      let newNotifications = [];
      if (result.data.results) {
        // Paginated response
        newNotifications = result.data.results;
        setHasMore(!!result.data.next); // Check if there's a next page
      } else if (Array.isArray(result.data)) {
        // Direct array response
        newNotifications = result.data;
        setHasMore(newNotifications.length === 20);
      } else {
        // Single notification or other structure
        newNotifications = [result.data];
        setHasMore(false);
      }
      
      setNotifications(prev => append ? [...prev, ...newNotifications] : newNotifications);
      setPage(pageNum);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const loadStats = async () => {
    const result = await notificationService.getStats();
    if (result.success) {
      setStats(result.data);
    }
  };

  const applyFilters = () => {
    let filtered = [...notifications];
    
    // Filter by level
    if (filterLevel !== 'all') {
      filtered = filtered.filter(n => n.level === filterLevel);
    }
    
    // Filter by read status
    if (filterRead === 'unread') {
      filtered = filtered.filter(n => !n.is_read);
    } else if (filterRead === 'read') {
      filtered = filtered.filter(n => n.is_read);
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(n => 
        n.message?.toLowerCase().includes(term) ||
        n.short_message?.toLowerCase().includes(term) ||
        n.verb?.toLowerCase().includes(term)
      );
    }
    
    setFilteredNotifications(filtered);
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read if unread
    if (!notification.is_read) {
      await notificationService.markAsRead(notification.id);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
      );
      
      // Refresh stats
      loadStats();
    }

    // Get current user role to determine redirect
    const userData = localStorage.getItem('user');
    let userRole = 'client'; // default
    if (userData) {
      try {
        const user = JSON.parse(userData);
        userRole = user.role || 'client';
        console.log('[DEBUG] NotificationsPage: User role detected:', userRole, 'User data:', user);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    } else {
      console.log('[DEBUG] NotificationsPage: No user data found in localStorage');
    }

    // Navigate based on user role and notification type
    if (notification.target_url) {
      console.log('[DEBUG] NotificationsPage: Redirecting to target_url:', notification.target_url);
      navigate(notification.target_url);
    } else if (notification.url) {
      console.log('[DEBUG] NotificationsPage: Redirecting to url:', notification.url);
      navigate(notification.url);
    } else {
      // Default redirect based on user role
      if (userRole === 'worker' || userRole === 'provider') {
        console.log('[DEBUG] NotificationsPage: Redirecting worker to /orders');
        navigate('/orders');
      } else {
        console.log('[DEBUG] NotificationsPage: Redirecting client to /track-order');
        navigate('/track-order');
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    const result = await notificationService.markAllAsRead();
    if (result.success) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      loadStats();
    }
  };

  const handleRefresh = () => {
    loadNotifications();
    loadStats();
  };

  const handleNotificationAction = async (notificationId, action) => {
    setActionLoading(prev => ({ ...prev, [notificationId]: action }));
    
    try {
      // Find the notification to get the order ID
      const notification = notifications.find(n => n.id === notificationId);
      if (!notification || !notification.order_id) {
        alert('لا يمكن العثور على معرف الطلب');
        return;
      }

      // Use the same endpoints as Orders.jsx
      const endpoint = action === 'accept' 
        ? `/api/orders/${notification.order_id}/accept/`
        : `/api/orders/${notification.order_id}/decline/`;
      
      const response = await apiService.post(endpoint, {});
      
      if (response) {
        // Update the notification in the local state
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId 
              ? { 
                  ...n, 
                  action_taken: true, 
                  action_type: action === 'accept' ? 'accepted' : 'declined',
                  is_read: true 
                }
              : n
          )
        );
        
        // Show success message
        alert(response.message || `تم ${action === 'accept' ? 'قبول' : 'رفض'} الطلب بنجاح`);
        
        // Refresh stats and notifications to get updated data
        loadStats();
        loadNotifications();
      }
    } catch (error) {
      console.error('Error handling notification action:', error);
      alert(error.response?.data?.error || 'حدث خطأ أثناء معالجة الطلب. يرجى المحاولة مرة أخرى.');
    } finally {
      setActionLoading(prev => ({ ...prev, [notificationId]: null }));
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

  const levelOptions = [
    { value: 'all', label: 'جميع المستويات' },
    { value: 'info', label: 'معلومات' },
    { value: 'success', label: 'نجاح' },
    { value: 'warning', label: 'تحذير' },
    { value: 'error', label: 'خطأ' }
  ];

  const readOptions = [
    { value: 'all', label: 'الكل' },
    { value: 'unread', label: 'غير مقروءة' },
    { value: 'read', label: 'مقروءة' }
  ];

  return (
    <div>
      <Navbar />
      
      {/* Hero Section */}
      <section className="notifications-hero">
        <div className="container">
          <h1>الإشعارات</h1>
          <p>تابع جميع إشعاراتك وتحديثاتك في مكان واحد</p>
        </div>
      </section>

      <div className="container my-4">
        {/* Stats Row */}
        <div className="row g-3 mb-4">
          <div className="col-sm-6 col-lg-3">
            <div className="stats-card">
              <div className="stats-number">{stats.total_count || 0}</div>
              <div className="stats-label">إجمالي الإشعارات</div>
            </div>
          </div>
          <div className="col-sm-6 col-lg-3">
            <div className="stats-card">
              <div className="stats-number text-danger">{stats.unread_count || 0}</div>
              <div className="stats-label">غير مقروءة</div>
            </div>
          </div>
          <div className="col-sm-6 col-lg-3">
            <div className="stats-card">
              <div className="stats-number text-success">{stats.read_count || 0}</div>
              <div className="stats-label">مقروءة</div>
            </div>
          </div>
          <div className="col-sm-6 col-lg-3">
            <div className="stats-card">
              <div className="stats-number text-info">{stats.level_stats?.info?.count || 0}</div>
              <div className="stats-label">معلومات</div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="filter-card">
          <div className="row g-3 align-items-center">
            <div className="col-md-3">
              <label className="form-label small fw-bold">البحث</label>
              <div className="input-group">
                <span className="input-group-text">
                  <BsSearch />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="ابحث في الإشعارات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-2">
              <label className="form-label small fw-bold">المستوى</label>
              <select
                className="form-select"
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
              >
                {levelOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label small fw-bold">الحالة</label>
              <select
                className="form-select"
                value={filterRead}
                onChange={(e) => setFilterRead(e.target.value)}
              >
                {readOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-5">
              <label className="form-label small fw-bold">الإجراءات</label>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  <BsArrowClockwise className="me-1" />
                  تحديث
                </button>
                {stats.unread_count > 0 && (
                  <button
                    className="btn btn-cta btn-sm"
                    onClick={handleMarkAllAsRead}
                  >
                    <BsCheck2All className="me-1" />
                    تحديد الكل كمقروء
                  </button>
                )}
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => {
                    setFilterLevel('all');
                    setFilterRead('all');
                    setSearchTerm('');
                  }}
                >
                  <BsX className="me-1" />
                  مسح الفلاتر
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {loading && notifications.length === 0 ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">جاري التحميل...</span>
            </div>
            <div className="mt-3">جاري تحميل الإشعارات...</div>
          </div>
        ) : error ? (
          <div className="text-center py-5">
            <BsXCircle className="text-danger mb-3" size={48} />
            <div className="text-danger mb-3">{error}</div>
            <button className="btn btn-cta" onClick={handleRefresh}>
              إعادة المحاولة
            </button>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-5">
            <BsBell className="text-muted mb-3" size={48} />
            <div className="text-muted">
              {searchTerm || filterLevel !== 'all' || filterRead !== 'all' 
                ? 'لا توجد إشعارات تطابق الفلاتر المحددة'
                : 'لا توجد إشعارات'
              }
            </div>
          </div>
        ) : (
          <div className="row g-3">
            {filteredNotifications.map((notification) => (
              <div key={notification.id} className="col-12">
                <div
                  className={`notification-card ${!notification.is_read ? 'unread' : ''} level-${notification.level}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="d-flex align-items-start gap-3">
                    <div className="notification-icon mt-1">
                      {getNotificationIcon(notification.level)}
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        {!notification.is_read && (
                          <BsCircleFill size={6} className="text-primary" />
                        )}
                        <div className="fw-bold">
                          {notificationService.getNotificationDisplayText(notification.verb)}
                        </div>
                        <div className="badge bg-light text-dark">
                          {notification.level_display || notification.level}
                        </div>
                      </div>
                      <div className="text-muted mb-2">
                        {notification.message || notification.short_message}
                      </div>
                      
                      {/* Order Details for Workers */}
                      {notification.requires_action && (
                        <div className="order-details mb-3 p-3 bg-light rounded border-start border-primary border-3">
                          <h6 className="text-primary mb-2">
                            <BsInfoCircle className="me-2" />
                            تفاصيل الطلب
                          </h6>
                          
                          {/* Job Description - Most Important Info */}
                          {notification.job_description && (
                            <div className="job-description mb-3 p-2 bg-white rounded border">
                              <div className="text-muted small mb-1">وصف العمل المطلوب:</div>
                              <div className="fw-bold text-dark" style={{ fontSize: '1.1rem' }}>
                                "{notification.job_description}"
                              </div>
                            </div>
                          )}
                          
                          {/* Service Category (Secondary Info) */}
                          {notification.service_name && (
                            <div className="d-flex justify-content-between mb-2">
                              <span className="text-muted small">فئة الخدمة:</span>
                              <span className="text-info">{notification.service_name}</span>
                            </div>
                          )}
                          
                          {/* Client's Offered Price */}
                          {notification.offered_price && (
                            <div className="d-flex justify-content-between mb-2">
                              <span className="text-muted">السعر المعروض من العميل:</span>
                              <span className="fw-bold text-success fs-5">{notification.offered_price} ريال</span>
                            </div>
                          )}
                          
                          {/* Location */}
                          {(notification.location_lat && notification.location_lng) && (
                            <div className="location-info mb-2">
                              <div className="d-flex justify-content-between align-items-center">
                                <span className="text-muted">الموقع:</span>
                                <div className="d-flex gap-2">
                                  <button 
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.open(`https://www.google.com/maps?q=${notification.location_lat},${notification.location_lng}`, '_blank');
                                    }}
                                  >
                                    📍 عرض على الخريطة
                                  </button>
                                </div>
                              </div>
                              {notification.location_address && (
                                <div className="small text-muted mt-1">
                                  {notification.location_address}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Price Information for Non-Action Notifications */}
                      {!notification.requires_action && notification.offered_price && (
                        <div className="price-info mb-2 p-2 bg-light rounded">
                          <div className="d-flex justify-content-between">
                            <span className="text-muted">السعر:</span>
                            <span className="fw-bold text-primary">{notification.offered_price} ريال</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Action Buttons for Workers */}
                      {notification.requires_action && !notification.action_taken && (
                        <div className="action-buttons mb-3">
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-success btn-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNotificationAction(notification.id, 'accept');
                              }}
                              disabled={actionLoading[notification.id]}
                            >
                              {actionLoading[notification.id] === 'accept' ? (
                                <div className="spinner-border spinner-border-sm me-1" role="status">
                                  <span className="visually-hidden">جاري القبول...</span>
                                </div>
                              ) : (
                                <BsCheckLg className="me-1" />
                              )}
                              قبول الطلب
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNotificationAction(notification.id, 'decline');
                              }}
                              disabled={actionLoading[notification.id]}
                            >
                              {actionLoading[notification.id] === 'decline' ? (
                                <div className="spinner-border spinner-border-sm me-1" role="status">
                                  <span className="visually-hidden">جاري الرفض...</span>
                                </div>
                              ) : (
                                <BsXLg className="me-1" />
                              )}
                              رفض الطلب
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {/* Action Status */}
                      {notification.action_taken && (
                        <div className="action-status mb-2">
                          <span className={`badge ${notification.action_type === 'accepted' ? 'bg-success' : 'bg-danger'}`}>
                            {notification.action_type === 'accepted' ? 'تم القبول' : 'تم الرفض'}
                          </span>
                        </div>
                      )}
                      
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                          {formatTime(notification.created_at)}
                        </small>
                        <div className="d-flex align-items-center gap-2">
                          {notification.actor_username && (
                            <small className="text-muted">
                              من: {notification.actor_full_name || notification.actor_username}
                            </small>
                          )}
                          {notification.is_read ? (
                            <BsEye className="text-success" title="مقروء" />
                          ) : (
                            <BsEyeSlash className="text-muted" title="غير مقروء" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && !loading && (
          <div className="text-center mt-4">
            <button
              className="btn btn-outline-primary"
              onClick={() => loadNotifications(page + 1, true)}
            >
              تحميل المزيد
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;



