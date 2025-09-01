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
    console.log('[DEBUG] handleLoginSuccess: Received response data:', responseData);
    
    // دعم هياكل بيانات مختلفة من الخادم
    const accessToken = responseData.access || responseData.tokens?.access;
    const refreshToken = responseData.refresh || responseData.tokens?.refresh;
    
    console.log('[DEBUG] handleLoginSuccess: Extracted tokens - access:', accessToken ? 'FOUND' : 'NOT FOUND', 'refresh:', refreshToken ? 'FOUND' : 'NOT FOUND');
    
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
      
      console.log('[DEBUG] handleLoginSuccess: Created user data:', userData);
      this.saveUserToStorage(userData);
      return userData;
    }
    
    console.error('[DEBUG] handleLoginSuccess: Missing tokens. Response keys:', Object.keys(responseData));
    throw new Error('لم يتم استلام التوكن من الخادم');
  }



  // تسجيل الدخول بالبريد الإلكتروني وكلمة المرور
  async login(email, password) {
    try {
      const data = await apiService.post('/api/accounts/login/', { email, password });
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
      console.log('[DEBUG] register: Sending request with:', { email, password, role, userData });
      
      const data = await apiService.post('/api/accounts/register/', { 
        email, 
        password, 
        role, 
        ...userData 
      });
      
      console.log('[DEBUG] register: Received response:', data);
      const userDataResponse = this.handleLoginSuccess(data);
      
      return {
        success: true,
        data: userDataResponse
      };
    } catch (error) {
      console.error('خطأ في التسجيل:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      // Log the actual error data structure
      if (error.response?.data) {
        console.error('Backend error data:', JSON.stringify(error.response.data, null, 2));
      }
      
      // Extract the actual error message from the backend
      let errorMessage = userLanguage === 'ar' ? 'فشل في إنشاء الحساب' : 'Failed to create account';
      
      // Get user language preference (you can pass this from the component)
      const userLanguage = localStorage.getItem('language') || 'ar';
      
      if (error.response?.data) {
        const backendData = error.response.data;
        
        // Check for validation errors
        if (typeof backendData === 'object') {
          const errorMessages = [];
          
          // Handle field-specific errors with user-friendly messages
          Object.keys(backendData).forEach(field => {
            if (Array.isArray(backendData[field])) {
              const fieldErrors = backendData[field];
              
              // Convert Arabic/English error messages to user-friendly messages
              const friendlyMessages = fieldErrors.map(error => {
                // Email errors
                if (error.includes('Email Address موجود مسبقاً') || error.includes('already exists')) {
                  return userLanguage === 'ar' ? 'البريد الإلكتروني مستخدم بالفعل' : 'Email already exists';
                }
                // Username errors
                if (error.includes('مستخدم موجود مسبقاً بهذا الاسم') || error.includes('already exists')) {
                  return userLanguage === 'ar' ? 'اسم المستخدم مستخدم بالفعل' : 'Username already exists';
                }
                // Phone errors
                if (error.includes('phone number already exists') || error.includes('مستخدم بالفعل')) {
                  return userLanguage === 'ar' ? 'رقم الهاتف مستخدم بالفعل' : 'Phone number already exists';
                }
                // Password errors
                if (error.includes('Password must contain')) {
                  return userLanguage === 'ar' ? 'كلمة المرور يجب أن تحتوي على رقم وحرف كبير' : 'Password must contain at least one digit and uppercase letter';
                }
                // Generic fallback
                return error;
              });
              
              errorMessages.push(`${field}: ${friendlyMessages.join(', ')}`);
            } else {
              errorMessages.push(`${field}: ${backendData[field]}`);
            }
          });
          
          if (errorMessages.length > 0) {
            errorMessage = errorMessages.join(' | ');
          }
        } else if (typeof backendData === 'string') {
          errorMessage = backendData;
        }
      }
      
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

      const data = await apiService.post('/api/accounts/google-login/', { 
        token: idToken,  // Fixed: use 'token' instead of 'access_token'
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
        await apiService.post('/api/accounts/logout/', { refresh: refreshToken });
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
      const data = await apiService.post('/api/auth/jwt/refresh/', { 
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
    const token = localStorage.getItem('access_token') || localStorage.getItem('access');
    if (!token) return false;

    try {
      // التحقق من صلاحية التوكن
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp * 1000 < Date.now();
      
      if (isExpired) {
        console.log('Token expired, attempting to refresh...');
        const refreshSuccess = await this.tryRefreshToken();
        if (refreshSuccess) {
          console.log('Token refreshed successfully');
          return true;
        } else {
          console.log('Token refresh failed, clearing auth');
          this.clearAuth();
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('خطأ في التحقق من صلاحية التوكن:', error);
      // If we can't parse the token, try to refresh it
      const refreshSuccess = await this.tryRefreshToken();
      if (!refreshSuccess) {
        this.clearAuth();
      }
      return refreshSuccess;
    }
  }

  // Check if user needs to be redirected to login (for use in components)
  async checkAuthAndRedirect() {
    const isAuth = await this.isAuthenticated();
    if (!isAuth) {
      console.log('User not authenticated, redirecting to login');
      this.clearAuth();
      // Use window.location.href for more reliable redirection
      window.location.href = '/';
      return false;
    }
    return true;
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
    return localStorage.getItem('access_token') || localStorage.getItem('access');
  }

  // تحديد صفحة إعادة التوجيه بناءً على حالة المستخدم
  getRedirectPath() {
    if (!this.user) return '/';
    
    // إذا كان مزود خدمة، يوجه إلى Dashboard الخدمات
    if (this.user.role === 'worker' || this.user.role === 'provider') {
      return '/homeProvider';
    }
    
    // إذا كان عميل، يوجه إلى Dashboard الرئيسي
    if (this.user.role === 'client') {
      return '/homeClient';
    }
    
    // إذا لم يكن لديه دور محدد، يوجه إلى صفحة العميل
    return '/homeClient';
  }

  // دوال إضافية
  async fetchUserProfile() {
    try {
      // Since the user endpoints are not working, return the stored user data
      // The user data should already be stored from the Google login response
      if (this.user) {
        console.log('Using stored user data:', this.user);
        return this.user;
      }
      
      // If no stored user data, try to get it from localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          this.saveUserToStorage(userData);
          console.log('Loaded user data from localStorage:', userData);
          return userData;
        } catch (parseError) {
          console.error('Error parsing stored user data:', parseError);
        }
      }
      
      // If still no user data, throw an error
      throw new Error('No user data available');
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
              await apiService.post('/api/accounts/password/reset/', { email });
      return true;
    } catch (error) {
      console.error('خطأ في طلب إعادة تعيين كلمة المرور:', error);
      throw new Error('فشل في إرسال طلب إعادة التعيين');
    }
  }

  // تأكيد إعادة تعيين كلمة المرور
  async confirmPasswordReset(uid, token, newPassword) {
    try {
              await apiService.post('/api/accounts/password/reset/confirm/', {
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