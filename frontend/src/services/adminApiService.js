// frontend/src/services/adminApiService.js
import axios from 'axios';

// إنشاء instance من axios مع الإعدادات الافتراضية
const adminApi = axios.create({
  baseURL: '/api/admin/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// إضافة interceptor لإضافة token للطلبات
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// إضافة interceptor للتعامل مع الأخطاء
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // إزالة token من localStorage وإعادة توجيه للصفحة الرئيسية
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin_refresh_token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// ==================== Authentication ====================
export const adminAuth = {
  // تسجيل الدخول
  login: async (username, password) => {
    try {
      const response = await adminApi.post('login/', {
        username,
        password,
      });
      
      const { access, refresh, user } = response.data;
      
      // حفظ tokens في localStorage
      console.log('adminAuth.login: Saving tokens and user data');
      localStorage.setItem('admin_access_token', access);
      localStorage.setItem('admin_refresh_token', refresh);
      localStorage.setItem('admin_user', JSON.stringify(user));
      
      console.log('adminAuth.login: Tokens saved successfully');
      console.log('adminAuth.login: Access token length:', access?.length);
      console.log('adminAuth.login: User data:', user);
      
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'خطأ في تسجيل الدخول',
      };
    }
  },

  // تسجيل الخروج
  logout: () => {
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    localStorage.removeItem('admin_user');
  },

  // جلب معلومات المستخدم الحالي
  getMe: async () => {
    try {
      const response = await adminApi.get('me/');
      return response.data;
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw error;
    }
  },

  // الحصول على معلومات المستخدم الحالي
  getCurrentUser: () => {
    const user = localStorage.getItem('admin_user');
    return user ? JSON.parse(user) : null;
  },

  // التحقق من صحة token
  isAuthenticated: () => {
    return !!localStorage.getItem('admin_access_token');
  },
};

// ==================== Dashboard Stats ====================
export const dashboardApi = {
  // الحصول على إحصائيات لوحة التحكم
  getStats: async () => {
    try {
      const response = await adminApi.get('stats/');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'خطأ في الحصول على الإحصائيات',
      };
    }
  },

  // الحصول على اتجاهات الطلبات
  getOrdersTrend: async () => {
    try {
      const response = await adminApi.get('orders-trend/');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'خطأ في الحصول على اتجاهات الطلبات',
      };
    }
  },

  // الحصول على الطلبات الأخيرة
  getRecentOrders: async () => {
    try {
      const response = await adminApi.get('recent-orders/');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'خطأ في الحصول على الطلبات الأخيرة',
      };
    }
  },

  // الحصول على اتجاهات الطلبات
  getOrdersTrend: async () => {
    try {
      const response = await adminApi.get('orders-trend/');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'خطأ في الحصول على اتجاهات الطلبات',
      };
    }
  },

  // الحصول على التقرير المالي
  getFinancialReport: async () => {
    try {
      const response = await adminApi.get('financial-report/');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'خطأ في الحصول على التقرير المالي',
      };
    }
  },
};

// ==================== Users Management ====================
export const usersApi = {
  // الحصول على قائمة المستخدمين
  getUsers: async (params = {}) => {
    try {
      const response = await adminApi.get('users/', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'خطأ في الحصول على المستخدمين',
      };
    }
  },

  // الحصول على مستخدم واحد
  getUser: async (id) => {
    try {
      const response = await adminApi.get(`users/${id}/`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'خطأ في الحصول على المستخدم',
      };
    }
  },

  // إنشاء مستخدم جديد
  createUser: async (userData) => {
    try {
      console.log('Creating user with data:', userData);
      const response = await adminApi.post('users/', userData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creating user:', error.response?.data);
      return {
        success: false,
        error: error.response?.data?.detail || error.response?.data || 'خطأ في إنشاء المستخدم',
      };
    }
  },

  // تحديث مستخدم
  updateUser: async (id, userData) => {
    try {
      const response = await adminApi.patch(`users/${id}/`, userData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'خطأ في تحديث المستخدم',
      };
    }
  },

  // حذف مستخدم
  deleteUser: async (id) => {
    try {
      await adminApi.delete(`users/${id}/`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'خطأ في حذف المستخدم',
      };
    }
  },

  // تفعيل مستخدم
  activateUser: async (id) => {
    try {
      const response = await adminApi.post(`users/${id}/activate/`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'خطأ في تفعيل المستخدم',
      };
    }
  },

  // إلغاء تفعيل مستخدم
  deactivateUser: async (id) => {
    try {
      const response = await adminApi.post(`users/${id}/deactivate/`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'خطأ في إلغاء تفعيل المستخدم',
      };
    }
  },

  // تعيين مستخدم كموظف
  setStaff: async (id, isStaff) => {
    try {
      const response = await adminApi.post(`users/${id}/set_staff/`, { is_staff: isStaff });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'خطأ في تعيين المستخدم كموظف',
      };
    }
  },
};

// ==================== Categories Management ====================
export const categoriesApi = {
  // الحصول على قائمة الفئات
  getCategories: async (params = {}) => {
    try {
      const response = await adminApi.get('categories/', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'خطأ في الحصول على الفئات',
      };
    }
  },

  // الحصول على فئة واحدة
  getCategory: async (id) => {
    try {
      const response = await adminApi.get(`categories/${id}/`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'خطأ في الحصول على الفئة',
      };
    }
  },

  // إنشاء فئة جديدة
  createCategory: async (categoryData) => {
    try {
      const response = await adminApi.post('categories/', categoryData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'خطأ في إنشاء الفئة',
      };
    }
  },

  // تحديث فئة
  updateCategory: async (id, categoryData) => {
    try {
      const response = await adminApi.patch(`categories/${id}/`, categoryData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'خطأ في تحديث الفئة',
      };
    }
  },

  // حذف فئة
  deleteCategory: async (id) => {
    try {
      await adminApi.delete(`categories/${id}/`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'خطأ في حذف الفئة',
      };
    }
  },
};

// ==================== Services Management ====================
export const servicesApi = {
  // الحصول على قائمة الخدمات
  getServices: async (params = {}) => {
    try {
      const response = await adminApi.get('services/', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'خطأ في الحصول على الخدمات',
      };
    }
  },

  // الحصول على خدمة واحدة
  getService: async (id) => {
    try {
      const response = await adminApi.get(`services/${id}/`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'خطأ في الحصول على الخدمة',
      };
    }
  },

  // إنشاء خدمة جديدة
  createService: async (serviceData) => {
    try {
      const response = await adminApi.post('services/', serviceData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'خطأ في إنشاء الخدمة',
      };
    }
  },

  // تحديث خدمة
  updateService: async (id, serviceData) => {
    try {
      const response = await adminApi.patch(`services/${id}/`, serviceData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'خطأ في تحديث الخدمة',
      };
    }
  },

  // حذف خدمة
  deleteService: async (id) => {
    try {
      await adminApi.delete(`services/${id}/`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'خطأ في حذف الخدمة',
      };
    }
  },

  // تبديل حالة الخدمة
  toggleServiceActive: async (id) => {
    try {
      const response = await adminApi.post(`services/${id}/toggle_active/`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'خطأ في تبديل حالة الخدمة',
      };
    }
  },
};

// ==================== Orders Management ====================
export const ordersApi = {
  // الحصول على قائمة الطلبات
  getOrders: async (params = {}) => {
    try {
      const response = await adminApi.get('orders/', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'خطأ في الحصول على الطلبات',
      };
    }
  },

  // الحصول على طلب واحد
  getOrder: async (id) => {
    try {
      const response = await adminApi.get(`orders/${id}/`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'خطأ في الحصول على الطلب',
      };
    }
  },

  // تحديث حالة الطلب
  setOrderStatus: async (id, status) => {
    try {
      const response = await adminApi.post(`orders/${id}/set_status/`, { status });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'خطأ في تحديث حالة الطلب',
      };
    }
  },

  // تعيين مزود خدمة للطلب
  assignProvider: async (id, providerId) => {
    try {
      const response = await adminApi.post(`orders/${id}/assign_provider/`, { provider_id: providerId });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'خطأ في تعيين مزود الخدمة',
      };
    }
  },
};

// ==================== Reviews Management ====================
export const reviewsApi = {
  // الحصول على قائمة التقييمات
  getReviews: async (params = {}) => {
    try {
      const response = await adminApi.get('reviews/', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'خطأ في الحصول على التقييمات',
      };
    }
  },

  // حذف تقييم (soft delete)
  softDeleteReview: async (id) => {
    try {
      const response = await adminApi.post(`reviews/${id}/soft_delete/`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'خطأ في حذف التقييم',
      };
    }
  },
};


// ==================== Logs ====================
export const logsApi = {
  // الحصول على سجل الإجراءات
  getLogs: async (params = {}) => {
    try {
      const response = await adminApi.get('logs/', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'خطأ في الحصول على سجل الإجراءات',
      };
    }
  },
};


// ==================== Invoices ====================
export const invoicesApi = {
  // الحصول على قائمة الفواتير
  getInvoices: async (params = {}) => {
    try {
      const response = await adminApi.get('invoices/', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'خطأ في الحصول على الفواتير',
      };
    }
  },

  // تعيين فاتورة كمقبوضة
  markInvoicePaid: async (id) => {
    try {
      const response = await adminApi.post(`invoices/${id}/mark_paid/`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'خطأ في تعيين الفاتورة كمقبوضة',
      };
    }
  },

  // تصدير الفواتير كـ CSV
  exportInvoicesCSV: async () => {
    try {
      const response = await adminApi.get('invoices/export_csv/', { responseType: 'blob' });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'خطأ في تصدير الفواتير',
      };
    }
  },
};

// ==================== Ratings ====================
export const ratingsApi = {
  // الحصول على قائمة التقييمات
  getRatings: async (params = {}) => {
    try {
      const response = await adminApi.get('ratings/', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'خطأ في الحصول على التقييمات',
      };
    }
  },
};

// ==================== Settings ====================
export const settingsApi = {
  // الحصول على جميع الإعدادات
  getSettings: async () => {
    try {
      const response = await adminApi.get('settings/');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'خطأ في الحصول على الإعدادات',
      };
    }
  },

  // الحصول على إعدادات محددة
  getSetting: async (key) => {
    try {
      const response = await adminApi.get(`settings/${key}/`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'خطأ في الحصول على الإعداد',
      };
    }
  },

  // تحديث إعداد
  updateSetting: async (key, value) => {
    try {
      const response = await adminApi.put(`settings/${key}/`, { value });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'خطأ في تحديث الإعداد',
      };
    }
  },

  // تحديث عدة إعدادات
  updateSettings: async (settings) => {
    try {
      const response = await adminApi.put('settings/bulk/', settings);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'خطأ في تحديث الإعدادات',
      };
    }
  },

  // إعادة تعيين الإعدادات للقيم الافتراضية
  resetSettings: async () => {
    try {
      const response = await adminApi.post('settings/reset/');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'خطأ في إعادة تعيين الإعدادات',
      };
    }
  },

  // تصدير الإعدادات
  exportSettings: async () => {
    try {
      const response = await adminApi.get('settings/export/', { responseType: 'blob' });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'خطأ في تصدير الإعدادات',
      };
    }
  },

  // استيراد الإعدادات
  importSettings: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await adminApi.post('settings/import/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'خطأ في استيراد الإعدادات',
      };
    }
  },
};

// ==================== Notifications ====================
export const notificationsApi = {
  // جلب جميع الإشعارات
  getNotifications: async (params = {}) => {
    try {
      const response = await adminApi.get('notifications/', { params });
    return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  // جلب عدد الإشعارات غير المقروءة
  getUnreadCount: async () => {
    try {
      const response = await adminApi.get('notifications/unread_count/');
      return response.data.unread_count;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  },

  // الحصول على الإشعارات غير المقروءة
  getUnreadNotifications: async () => {
    try {
      const response = await adminApi.get('notifications/unread/');
    return response.data;
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      throw error;
    }
  },

  // تحديد إشعار كمقروء
  markAsRead: async (notificationId) => {
    try {
      const response = await adminApi.post(`notifications/${notificationId}/mark_as_read/`);
    return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // تحديث حالة الإشعار كمقروء (طريقة بديلة)
  updateNotification: async (id, data) => {
    try {
      const response = await adminApi.patch(`notifications/${id}/`, data);
    return response.data;
    } catch (error) {
      console.error('Error updating notification:', error);
      throw error;
    }
  },

  // تحديد جميع الإشعارات كمقروءة
  markAllAsRead: async () => {
    try {
      const response = await adminApi.post('notifications/mark_all_as_read/');
    return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  // حذف إشعار
  deleteNotification: async (notificationId) => {
    try {
      const response = await adminApi.delete(`notifications/${notificationId}/`);
    return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
  }
  },
};

export default adminApi;