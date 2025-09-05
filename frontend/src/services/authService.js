import apiService from "./ApiService";

class AuthService {
  constructor() {
    this.user = null;
    this.loadUserFromStorage();
  }

  loadUserFromStorage() {
    try {
      const userData = localStorage.getItem("user");
      if (userData) this.user = JSON.parse(userData);
    } catch (error) {
      console.error("[DEBUG] Error loading user from storage:", error);
      this.user = null;
    }
  }

  saveUserToStorage(user) {
    try {
      this.user = user;
      localStorage.setItem("user", JSON.stringify(user));
    } catch (error) {
      console.error("[DEBUG] Error saving user:", error);
    }
  }

  handleLoginSuccess(responseData) {
    const accessToken = responseData.access;
    const refreshToken = responseData.refresh;

    localStorage.setItem("access", accessToken);
    localStorage.setItem("refresh", refreshToken);

    // ← هنا نضيف Authorization header
    if (accessToken && apiService.defaults) {
        apiService.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    }

    const userData = {
      id: responseData.id || responseData.user_id,
      email: responseData.email,
      role: responseData.role || "client",
      name: responseData.username || "",
    };

    this.saveUserToStorage(userData);
    return userData;
}


  async login(email, password) {
    try {
      const data = await apiService.post("/api/accounts/login/", { email, password });
      const userData = this.handleLoginSuccess(data);
      return { success: true, data: userData };
    } catch (error) {
      console.error("[DEBUG] Login error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || "فشل في تسجيل الدخول");
    }
  }

  async logout() {
    try {
      const refreshToken = localStorage.getItem("refresh");
      if (refreshToken) {
        await apiService.post("/api/accounts/logout/", { refresh: refreshToken });
      }
    } catch (error) {
      console.warn("[DEBUG] Server logout failed:", error.response?.data || error.message);
    } finally {
      this.clearAuth();
    }
  }

  clearAuth() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    this.user = null;
  }

  async tryRefreshToken() {
    const refreshToken = localStorage.getItem("refresh");
    if (!refreshToken) return false;

    try {
      const data = await apiService.post("/api/accounts/token/refresh/", { refresh: refreshToken });
      if (data.access) {
        localStorage.setItem("access", data.access);
        if (data.refresh) localStorage.setItem("refresh", data.refresh);
        return true;
      }
    } catch (error) {
      console.error("[DEBUG] tryRefreshToken failed:", error.response?.data || error.message);
    }

    this.clearAuth();
    return false;
  }

  async isAuthenticated() {
    const token = localStorage.getItem("access");
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const isExpired = payload.exp * 1000 < Date.now();

      if (isExpired) {
        console.log("[DEBUG] Token expired → refreshing...");
        return await this.tryRefreshToken();
      }
      return true;
    } catch (error) {
      console.error("[DEBUG] Invalid token format:", error);
      return await this.tryRefreshToken();
    }
  }

  getCurrentUser() {
    return this.user;
  }
}

export const authService = new AuthService();
export default authService;
