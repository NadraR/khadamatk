import axios from "axios";

class ApiService {
  constructor(baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000") {
    this.baseURL = baseURL;
    this.retryCount = 0;
    this.maxRetries = 1;

    // إنشاء instance من axios
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 15000, // 15 ثانية - تقليل timeout
    });

    // interceptor لإضافة token تلقائياً
    this.api.interceptors.request.use(
      (config) => {
        const accessToken = localStorage.getItem("access");
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // interceptor للتعامل مع الأخطاء و retry لتجديد التوكن
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (
          error.response?.status === 401 &&
          localStorage.getItem("refresh") &&
          !originalRequest._retry &&
          this.retryCount < this.maxRetries
        ) {
          this.retryCount++;
          originalRequest._retry = true;

          const newTokens = await this.refreshToken(localStorage.getItem("refresh"));
          if (newTokens?.access) {
            localStorage.setItem("access", newTokens.access);
            if (newTokens.refresh) localStorage.setItem("refresh", newTokens.refresh);

            // إعادة المحاولة بعد تحديث التوكن
            return this.api(originalRequest);
          } else {
            this.clearAuth();
          }
        }

        this.retryCount = 0;
        return Promise.reject(error);
      }
    );
  }

  async refreshToken(refreshToken) {
    try {
      // Fixed: use the correct endpoint that matches backend
      const response = await axios.post(`${this.baseURL}/api/accounts/token/refresh/`, {
        refresh: refreshToken,
      });
      return response.data;
    } catch (err) {
      this.clearAuth();
      console.error("Error refreshing token:", err);
      return null;
    }
  }

  clearAuth() {
    // Clear all possible token keys for consistency
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_role");
    this.retryCount = 0;
  }

  // دوال مساعدة للطلبات مع معالجة أفضل للأخطاء
  async get(endpoint, headers = {}) {
    return this.retryRequest(async () => {
      return await this.api.get(endpoint, { headers }).then((res) => res.data);
    }, 'GET', endpoint);
  }

  async retryRequest(requestFn, method, endpoint, maxRetries = 2) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;
        this.handleRequestError(error, method, endpoint, attempt, maxRetries);
        
        // إذا كانت هذه المحاولة الأخيرة، ارمي الخطأ
        if (attempt === maxRetries) {
          throw error;
        }
        
        // انتظار قبل المحاولة التالية (1 ثانية * رقم المحاولة)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
    
    throw lastError;
  }

  async post(endpoint, body, headers = {}) {
    return this.retryRequest(async () => {
      return await this.api.post(endpoint, body, { headers }).then((res) => res.data);
    }, 'POST', endpoint);
  }

  async put(endpoint, body, headers = {}) {
    return this.retryRequest(async () => {
      return await this.api.put(endpoint, body, { headers }).then((res) => res.data);
    }, 'PUT', endpoint);
  }

  async patch(endpoint, body, headers = {}) {
    return this.retryRequest(async () => {
      return await this.api.patch(endpoint, body, { headers }).then((res) => res.data);
    }, 'PATCH', endpoint);
  }

  async delete(endpoint, headers = {}) {
    return this.retryRequest(async () => {
      return await this.api.delete(endpoint, { headers }).then((res) => res.data);
    }, 'DELETE', endpoint);
  }

  // معالجة أخطاء الطلبات
  handleRequestError(error, method, endpoint, attempt = 1, maxRetries = 1) {
    console.error(`[API Error] ${method} ${endpoint} (Attempt ${attempt}/${maxRetries}):`, error);
    
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - الخادم لا يستجيب في الوقت المحدد');
      if (attempt < maxRetries) {
        console.log(`سيتم إعادة المحاولة خلال ${attempt} ثانية...`);
      }
      error.message = 'انتهت مهلة الاتصال. يرجى التحقق من اتصال الإنترنت أو المحاولة مرة أخرى.';
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused - الخادم غير متاح');
      error.message = 'الخادم غير متاح. يرجى التحقق من أن الخادم الخلفي يعمل.';
    } else if (error.code === 'NETWORK_ERROR') {
      console.error('Network error - مشكلة في الشبكة');
      error.message = 'مشكلة في الاتصال بالشبكة. يرجى التحقق من اتصال الإنترنت.';
    }
  }
}

export default new ApiService();
export { ApiService };