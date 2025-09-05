import { ApiService } from './ApiService';

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
      
      const response = await ApiService.get(url);
      return {
        success: true,
        data: response.data
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
      const response = await ApiService.get(`${this.baseURL}/${id}/`);
      return {
        success: true,
        data: response.data
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
      const response = await ApiService.get(`${this.baseURL}/unread-count/`);
      return {
        success: true,
        data: response.data
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
      const response = await ApiService.get(`${this.baseURL}/stats/`);
      return {
        success: true,
        data: response.data
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
      const response = await ApiService.post(`${this.baseURL}/${id}/mark-read/`);
      return {
        success: true,
        data: response.data
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
      const response = await ApiService.post(`${this.baseURL}/mark-all-read/`);
      return {
        success: true,
        data: response.data
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
      const response = await ApiService.patch(`${this.baseURL}/${id}/`, data);
      return {
        success: true,
        data: response.data
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
}

export const notificationService = new NotificationService();



