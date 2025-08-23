import apiService from './ApiService';

class AuthService {
  constructor() {
    this.user = null;
    this.loadUserFromStorage();
  }

  // تحميل بيانات المستخدم من localStorage
  loadUserFromStorage() {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        this.user = JSON.parse(userData);
      }
    } catch (error) {
      console.error('خطأ في تحميل بيانات المستخدم:', error);
      this.user = null;
    }
  }

  // حفظ بيانات المستخدم في localStorage
  saveUserToStorage(user) {
    try {
      this.user = user;
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('خطأ في حفظ بيانات المستخدم:', error);
    }
  }

  // معالجة استجابة تسجيل الدخول الناجحة
  handleLoginSuccess(responseData) {
    // دعم هياكل بيانات مختلفة من الخادم
    const accessToken = responseData.access || responseData.tokens?.access;
    const refreshToken = responseData.refresh || responseData.tokens?.refresh;
    
    if (accessToken && refreshToken) {
      localStorage.setItem('access', accessToken);
      localStorage.setItem('refresh', refreshToken);
      
      // حفظ بيانات المستخدم
      const userData = {
        id: responseData.id || responseData.user?.id,
        email: responseData.email || responseData.user?.email,
        role: responseData.role || responseData.user?.role || 'client',
        auth_provider: responseData.auth_provider || 'email',
        hasLocation: responseData.has_location || responseData.hasLocation || false,
        name: responseData.name || responseData.user?.name || '',
        profile_completed: responseData.profile_completed || false
      };
      
      this.saveUserToStorage(userData);
      return userData;
    }
    
    throw new Error('لم يتم استلام التوكن من الخادم');
  }

  // تسجيل الدخول بالبريد الإلكتروني وكلمة المرور
  async login(email, password) {
    try {
      const data = await apiService.post('/accounts/login/', { email, password });
      const userData = this.handleLoginSuccess(data);
      
      return {
        success: true,
        data: userData
      };
    } catch (error) {
      console.error('خطأ في تسجيل الدخول:', error);
      const errorMessage = error.data?.message || 
                          error.data?.detail || 
                          error.message || 
                          'فشل في تسجيل الدخول';
      throw new Error(errorMessage);
    }
  }

  // تسجيل مستخدم جديد
  async register(email, password, role = 'client', userData = {}) {
    try {
      const data = await apiService.post('/accounts/register/', { 
        email, 
        password, 
        role, 
        ...userData 
      });
      const userDataResponse = this.handleLoginSuccess(data);
      
      return {
        success: true,
        data: userDataResponse
      };
    } catch (error) {
      console.error('خطأ في التسجيل:', error);
      const errorMessage = error.data?.message || 
                          error.data?.detail || 
                          error.message || 
                          'فشل في إنشاء الحساب';
      throw new Error(errorMessage);
    }
  }

  // تسجيل الدخول باستخدام Google
  async googleLogin(idToken, role = 'client') {
    if (!idToken) throw new Error('لم يتم استلام توكن من Google');

    try {
      console.log('جاري تسجيل الدخول بـ Google:', { 
        idTokenPreview: idToken.substring(0, 20) + '...', 
        role 
      });

      const data = await apiService.post('/accounts/google-login/', { 
        access_token: idToken,
        role 
      });

      console.log('استجابة الخادم Google login:', data);
      const userData = this.handleLoginSuccess(data);
      
      return {
        success: true,
        data: userData
      };
      
    } catch (error) {
      console.error('خطأ في تسجيل الدخول بجوجل:', error);
      const serverError = error.data;
      console.error('تفاصيل الخادم:', serverError);
      const errorMessage = serverError?.message || serverError?.detail || error.message || 'فشل في تسجيل الدخول باستخدام Google';
      throw new Error(errorMessage);
    }
  }

  // تسجيل الخروج ومسح البيانات
  async logout() {
    try {
      const refreshToken = localStorage.getItem('refresh');
      if (refreshToken) {
        await apiService.post('/accounts/logout/', { refresh: refreshToken });
      }
    } catch (error) {
      console.warn('لم يتم تسجيل الخروج من الخادم:', error);
    } finally {
      this.clearAuth();
    }
  }

  // مسح بيانات المصادقة
  clearAuth() {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    this.user = null;
  }

  // محاولة تجديد التوكن تلقائيًا
  async tryRefreshToken() {
    const refreshToken = localStorage.getItem('refresh');
    if (!refreshToken) return false;

    try {
      const data = await apiService.post('/accounts/token/refresh/', { 
        refresh: refreshToken 
      });

      if (data.access) {
        localStorage.setItem('access', data.access);
        if (data.refresh) {
          localStorage.setItem('refresh', data.refresh);
        }
        return true;
      }
    } catch (error) {
      console.error('فشل في تجديد التوكن:', error);
    }
    
    this.clearAuth();
    return false;
  }

  // التحقق من حالة المصادقة مع إمكانية التجديد
  async isAuthenticated() {
    const token = localStorage.getItem('access');
    if (!token) return false;

    try {
      // التحقق من صلاحية التوكن
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp * 1000 < Date.now();
      
      if (isExpired) {
        return await this.tryRefreshToken();
      }
      
      return true;
    } catch (error) {
      console.error('خطأ في التحقق من صلاحية التوكن:', error);
      return false;
    }
  }

  // الحصول على بيانات المستخدم الحالي
  getCurrentUser() {
    return this.user;
  }

  // التحقق مما إذا كان المستخدم لديه موقع
  hasLocation() {
    return this.user?.hasLocation || false;
  }

  // تحديث حالة الموقع
  async setLocationStatus(hasLocation, locationData = null) {
    if (this.user) {
      try {
        // تحديث بيانات المستخدم على الخادم
        const updatedUser = await apiService.patch(`/accounts/user/${this.user.id}/`, {
          has_location: hasLocation,
          ...(locationData && { location: locationData })
        });
        
        // تحديث البيانات المحلية
        this.user.hasLocation = hasLocation;
        if (locationData) {
          this.user.location = locationData;
        }
        this.saveUserToStorage(this.user);
        
        return updatedUser;
      } catch (error) {
        console.error('خطأ في تحديث حالة الموقع:', error);
        throw new Error('فشل في تحديث الموقع');
      }
    }
  }

  // الحصول على التوكن
  getToken() {
    return localStorage.getItem('access');
  }

  // تحديد صفحة إعادة التوجيه بناءً على حالة المستخدم
  getRedirectPath() {
    if (!this.user) return '/login';
    
    // إذا لم يكن لدى المستخدم موقع، يوجه إلى صفحة الموقع
    if (!this.user.hasLocation) {
      return '/location';
    }
    
    // إذا كان مزود خدمة، يوجه إلى Dashboard الخدمات
    if (this.user.role === 'worker') {
      return '/worker-dashboard';
    }
    
    // إذا كان عميل، يوجه إلى Dashboard الرئيسي
    return '/client-dashboard';
  }

  // دوال إضافية
  async fetchUserProfile() {
    try {
      const userData = await apiService.get('/accounts/user/');
      this.saveUserToStorage(userData);
      return userData;
    } catch (error) {
      console.error('خطأ في جلب بيانات المستخدم:', error);
      if (this.user) return this.user;
      throw new Error('تعذر تحميل بيانات المستخدم');
    }
  }

  // تحديث بيانات المستخدم
  async updateUserProfile(userData) {
    try {
      if (!this.user) throw new Error('لا يوجد مستخدم مسجل');
      
      const updatedUser = await apiService.patch(`/accounts/user/${this.user.id}/`, userData);
      this.saveUserToStorage({ ...this.user, ...updatedUser });
      
      return updatedUser;
    } catch (error) {
      console.error('خطأ في تحديث بيانات المستخدم:', error);
      throw new Error('فشل في تحديث البيانات');
    }
  }

  // طلب إعادة تعيين كلمة المرور
  async requestPasswordReset(email) {
    try {
      await apiService.post('/accounts/password/reset/', { email });
      return true;
    } catch (error) {
      console.error('خطأ في طلب إعادة تعيين كلمة المرور:', error);
      throw new Error('فشل في إرسال طلب إعادة التعيين');
    }
  }

  // تأكيد إعادة تعيين كلمة المرور
  async confirmPasswordReset(uid, token, newPassword) {
    try {
      await apiService.post('/accounts/password/reset/confirm/', {
        uid,
        token,
        new_password: newPassword
      });
      return true;
    } catch (error) {
      console.error('خطأ في تأكيد إعادة تعيين كلمة المرور:', error);
      throw new Error('فشل في إعادة تعيين كلمة المرور');
    }
  }
}

// تصدير instance واحدة لاستخدامها في التطبيق
export const authService = new AuthService();
export default authService;