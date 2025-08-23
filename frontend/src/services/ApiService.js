class ApiService {
  constructor(baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api") {
    this.baseURL = baseURL;
    this.retryCount = 0;
    this.maxRetries = 1;
    this.timeoutDuration = 10000; // 10 ثواني
  }

  async request(endpoint, method = "GET", body = null, customHeaders = {}, isRetry = false) {
    let accessToken = localStorage.getItem("access");
    const refreshToken = localStorage.getItem("refresh");

    let headers = {
      ...customHeaders,
    };

    // لا نضيف Content-Type لـ FormData
    if (!(body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutDuration);

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method,
        headers,
        body: body instanceof FormData ? body : body ? JSON.stringify(body) : null,
        signal: controller.signal,
      });
      clearTimeout(timeout);

      // إذا كان الخطأ 401 ولم نكن في محاولة إعادة، نحاول تجديد التوكن
      if (response.status === 401 && refreshToken && !isRetry && this.retryCount < this.maxRetries) {
        this.retryCount++;
        const newTokens = await this.refreshToken(refreshToken);
        if (newTokens?.access) {
          localStorage.setItem("access", newTokens.access);
          if (newTokens.refresh) {
            localStorage.setItem("refresh", newTokens.refresh);
          }
          // إعادة المحاولة مع تعيين isRetry = true لمنع الحلقات اللانهائية
          return this.request(endpoint, method, body, customHeaders, true);
        }
      }

      const responseData = await this.safeJsonParse(response);

      if (!response.ok) {
        throw {
          status: response.status,
          message: responseData?.detail || responseData?.message || "An error occurred",
          data: responseData,
        };
      }

      this.retryCount = 0;
      return responseData;

    } catch (error) {
      clearTimeout(timeout);

      if (error.name === "AbortError") {
        throw { status: 408, message: "Request timed out" };
      }

      throw {
        status: error.status || 500,
        message: error.message || "Something went wrong",
        data: error.data || null,
      };
    }
  }

  async safeJsonParse(response) {
    const text = await response.text();
    if (!text) return null;
    
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  }

  async refreshToken(refreshToken) {
    try {
      const response = await fetch(`${this.baseURL}/auth/jwt/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        this.clearAuth();
        return null;
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error refreshing token:", error);
      this.clearAuth();
      return null;
    }
  }

  clearAuth() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    this.retryCount = 0;
  }

  // Helpers
  get(endpoint, headers = {}) {
    return this.request(endpoint, "GET", null, headers);
  }
  
  post(endpoint, body, headers = {}) {
    return this.request(endpoint, "POST", body, headers);
  }
  
  put(endpoint, body, headers = {}) {
    return this.request(endpoint, "PUT", body, headers);
  }
  
  patch(endpoint, body, headers = {}) {
    return this.request(endpoint, "PATCH", body, headers);
  }
  
  delete(endpoint, headers = {}) {
    return this.request(endpoint, "DELETE", null, headers);
  }
}

export default new ApiService();