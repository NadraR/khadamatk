import axios from "axios";

class ApiService {
  constructor(baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000") {
    this.baseURL = baseURL;
    this.retryCount = 0;
    this.maxRetries = 1;

    this.api = axios.create({
      baseURL: this.baseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 30000, // 30 ثانية - زيادة timeout
    });

    // ⬅️ Interceptor لإضافة الـ access token
    this.api.interceptors.request.use(
      (config) => {
        const accessToken = localStorage.getItem("access");
        console.log("[DEBUG][Request] →", config.url);
        console.log("[DEBUG][Request] Access token:", accessToken);

        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // ⬅️ Interceptor لتجديد التوكن عند 401
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

          console.log("[DEBUG] 401 detected → Trying refresh...");
          const newTokens = await this.refreshToken(localStorage.getItem("refresh"));

          if (newTokens?.access) {
            localStorage.setItem("access", newTokens.access);
            if (newTokens.refresh) localStorage.setItem("refresh", newTokens.refresh);

            console.log("[DEBUG] Token refreshed, retrying request:", originalRequest.url);
            return this.api(originalRequest);
          } else {
            console.warn("[DEBUG] Refresh token failed → clearing auth");
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
      console.log("[DEBUG] Calling refresh endpoint with token:", refreshToken);
      const response = await axios.post(`${this.baseURL}/api/accounts/token/refresh/`, {
        refresh: refreshToken,
      });
      console.log("[DEBUG] Refresh response:", response.data);
      return response.data;
    } catch (err) {
      this.clearAuth();
      console.error("[DEBUG] Error refreshing token:", err.response?.data || err.message);
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
    try {
      return await this.api.get(endpoint, { headers }).then((res) => res.data);
    } catch (error) {
      this.handleRequestError(error, 'GET', endpoint);
      throw error;
    }
  }
  async post(endpoint, body, headers = {}) {
    try {
      return await this.api.post(endpoint, body, { headers }).then((res) => res.data);
    } catch (error) {
      this.handleRequestError(error, 'POST', endpoint);
      throw error;
    }
  }
  async put(endpoint, body, headers = {}) {
    try {
      return await this.api.put(endpoint, body, { headers }).then((res) => res.data);
    } catch (error) {
      this.handleRequestError(error, 'PUT', endpoint);
      throw error;
    }
  }
  async patch(endpoint, body, headers = {}) {
    try {
      return await this.api.patch(endpoint, body, { headers }).then((res) => res.data);
    } catch (error) {
      this.handleRequestError(error, 'PATCH', endpoint);
      throw error;
    }
  }
  async delete(endpoint, headers = {}) {
    try {
      return await this.api.delete(endpoint, { headers }).then((res) => res.data);
    } catch (error) {
      this.handleRequestError(error, 'DELETE', endpoint);
      throw error;
    }
  }

  // معالجة أخطاء الطلبات
  handleRequestError(error, method, endpoint) {
    console.error(`[API Error] ${method} ${endpoint}:`, error);
    
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - الخادم لا يستجيب في الوقت المحدد');
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
