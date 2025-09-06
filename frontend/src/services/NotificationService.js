import apiService from './ApiService';

class NotificationService {
  constructor() {
    this.baseURL = '/api/notifications';
  }

  // Get all notifications
  async getNotifications(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.unread) {
        queryParams.append('unread', 'true');
      }
      if (params.level) {
        queryParams.append('level', params.level);
      }
      if (params.page) {
        queryParams.append('page', params.page);
      }
      if (params.page_size) {
        queryParams.append('page_size', params.page_size);
      }

      const url = queryParams.toString() 
        ? `${this.baseURL}/?${queryParams.toString()}`
        : `${this.baseURL}/`;
      
      const response = await apiService.get(url);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'فشل في تحميل الإشعارات'
      };
    }
  }

  // Get notification by ID
  async getNotification(id) {
    try {
      const response = await apiService.get(`${this.baseURL}/${id}/`);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error fetching notification:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'فشل في تحميل الإشعار'
      };
    }
  }

  // Get unread notifications count
  async getUnreadCount() {
    try {
      const response = await apiService.get(`${this.baseURL}/unread-count/`);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'فشل في تحميل عدد الإشعارات',
        data: { unread_count: 0 }
      };
    }
  }

  // Get notification statistics
  async getStats() {
    try {
      const response = await apiService.get(`${this.baseURL}/stats/`);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'فشل في تحميل إحصائيات الإشعارات'
      };
    }
  }

  // Mark notification as read
  async markAsRead(id) {
    try {
      const response = await apiService.post(`${this.baseURL}/${id}/mark-read/`);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'فشل في تحديد الإشعار كمقروء'
      };
    }
  }

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      const response = await apiService.post(`${this.baseURL}/mark-all-read/`);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'فشل في تحديد جميع الإشعارات كمقروءة'
      };
    }
  }

  // Update notification (mark as read/unread)
  async updateNotification(id, data) {
    try {
      const response = await apiService.patch(`${this.baseURL}/${id}/`, data);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error updating notification:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'فشل في تحديث الإشعار'
      };
    }
  }

  // Get notifications with polling for real-time updates
  async pollNotifications(callback, interval = 30000) {
    const poll = async () => {
      const result = await this.getUnreadCount();
      if (result.success && callback) {
        callback(result.data);
      }
    };

    // Initial call
    poll();
    
    // Set up polling
    const intervalId = setInterval(poll, interval);
    
    // Return cleanup function
    return () => clearInterval(intervalId);
  }

  // Helper method to get notification icon based on level
  getNotificationIcon(level) {
    const icons = {
      'info': '🔵',
      'success': '✅',
      'warning': '⚠️',
      'error': '❌'
    };
    return icons[level] || '📢';
  }

  // Helper method to get notification color based on level
  getNotificationColor(level) {
    const colors = {
      'info': '#3b82f6',
      'success': '#10b981',
      'warning': '#f59e0b',
      'error': '#ef4444'
    };
    return colors[level] || '#6b7280';
  }

  // Format notification time
  formatNotificationTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'الآن';
    } else if (diffInMinutes < 60) {
      return `منذ ${diffInMinutes} دقيقة`;
    } else if (diffInMinutes < 1440) { // 24 hours
      const hours = Math.floor(diffInMinutes / 60);
      return `منذ ${hours} ساعة`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `منذ ${days} يوم`;
    }
  }

  // Enhanced polling with error handling and backoff
  startPolling(callback, interval = 30000) {
    let pollInterval = interval;
    let consecutiveErrors = 0;
    let isPolling = true;

    const poll = async () => {
      if (!isPolling) return;

      try {
        const result = await this.getUnreadCount();
        if (result.success) {
          consecutiveErrors = 0;
          pollInterval = interval; // Reset interval on success
          if (callback) {
            callback(result.data);
          }
        } else {
          consecutiveErrors++;
          console.warn(`Notification polling error (${consecutiveErrors}):`, result.error);
          
          // Exponential backoff on consecutive errors
          if (consecutiveErrors > 3) {
            pollInterval = Math.min(interval * Math.pow(2, consecutiveErrors - 3), 300000); // Max 5 minutes
          }
        }
      } catch (error) {
        consecutiveErrors++;
        console.error('Notification polling exception:', error);
        
        // Exponential backoff on consecutive errors
        if (consecutiveErrors > 3) {
          pollInterval = Math.min(interval * Math.pow(2, consecutiveErrors - 3), 300000); // Max 5 minutes
        }
      }

      if (isPolling) {
        setTimeout(poll, pollInterval);
      }
    };

    // Start polling
    poll();

    // Return stop function
    return () => {
      isPolling = false;
    };
  }

  // Get notification display text based on verb
  getNotificationDisplayText(verb) {
    const verbTexts = {
      'order_created': 'طلب جديد',
      'order_created_confirm': 'تأكيد الطلب',
      'order_status_changed': 'تغيير حالة الطلب',
      'order_status_changed_provider': 'تحديث الطلب',
      'order_cancelled': 'إلغاء الطلب',
      'order_completed': 'اكتمال الطلب',
      'order_payment_failed': 'فشل الدفع',
      'message_received': 'رسالة جديدة',
      'review_received': 'تقييم جديد',
    };
    return verbTexts[verb] || verb || 'إشعار جديد';
  }

  // Check if notification is urgent based on level and verb
  isUrgentNotification(notification) {
    if (notification.level === 'error') return true;
    if (notification.level === 'warning') return true;
    
    const urgentVerbs = ['order_payment_failed', 'order_cancelled'];
    return urgentVerbs.includes(notification.verb);
  }

  // Group notifications by date
  groupNotificationsByDate(notifications) {
    const groups = {};
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    notifications.forEach(notification => {
      const notificationDate = new Date(notification.created_at);
      let groupKey;

      if (this.isSameDay(notificationDate, today)) {
        groupKey = 'اليوم';
      } else if (this.isSameDay(notificationDate, yesterday)) {
        groupKey = 'أمس';
      } else {
        groupKey = notificationDate.toLocaleDateString('ar-SA', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(notification);
    });

    return groups;
  }

  // Helper function to check if two dates are the same day
  isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  // Get notification priority score for sorting
  getNotificationPriority(notification) {
    let priority = 0;
    
    // Unread notifications have higher priority
    if (!notification.is_read) priority += 100;
    
    // Level-based priority
    const levelPriority = {
      'error': 50,
      'warning': 30,
      'success': 20,
      'info': 10
    };
    priority += levelPriority[notification.level] || 0;
    
    // Verb-based priority
    const verbPriority = {
      'order_payment_failed': 40,
      'order_cancelled': 30,
      'order_created': 25,
      'message_received': 20,
      'order_status_changed': 15
    };
    priority += verbPriority[notification.verb] || 0;
    
    // Recent notifications have higher priority
    const hoursOld = (new Date() - new Date(notification.created_at)) / (1000 * 60 * 60);
    if (hoursOld < 1) priority += 10;
    else if (hoursOld < 24) priority += 5;
    
    return priority;
  }
}

export const notificationService = new NotificationService();



