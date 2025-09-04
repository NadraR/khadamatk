import apiService from './ApiService';

class LocationService {
  constructor() {
    this.baseEndpoint = '/api/location/locations/';
  }

  async saveLocation(locationData) {
    try {
      const response = await apiService.post(this.baseEndpoint, locationData);
      return {
        success: true,
        data: response,
        message: 'تم حفظ الموقع بنجاح'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'فشل في حفظ الموقع',
        status: error.status
      };
    }
  }

  async getMyLocations() {
    try {
      const response = await apiService.get(`${this.baseEndpoint}my-locations/`);
      return {
        success: true,
        data: response,
        message: 'تم جلب المواقع بنجاح'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'فشل في جلب المواقع',
        status: error.status
      };
    }
  }

  async getLatestLocation() {
    try {
      // التحقق من وجود token قبل إجراء الطلب
      const token = localStorage.getItem('access');
      if (!token) {
        return {
          success: false,
          error: 'User not authenticated',
          status: 401
        };
      }

      const response = await apiService.get(`${this.baseEndpoint}latest-location/`);
      return {
        success: true,
        data: response,
        message: 'تم جلب آخر موقع بنجاح'
      };
    } catch (error) {
      // إرجاع خطأ صامت بدلاً من إظهار رسالة خطأ
      return {
        success: false,
        error: null, // لا نعرض رسالة خطأ
        status: error.status
      };
    }
  }

  async searchNearbyLocations(lat, lng, radius = 10, maxResults = 20) {
    try {
      const response = await apiService.get(
        `${this.baseEndpoint}nearby/?lat=${lat}&lng=${lng}&radius=${radius}&max_results=${maxResults}`
      );
      return {
        success: true,
        data: response,
        message: 'تم البحث بنجاح'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'فشل في البحث عن مواقع قريبة',
        status: error.status
      };
    }
  }

  async deleteLocation(locationId) {
    try {
      const response = await apiService.delete(`${this.baseEndpoint}${locationId}/delete-my-location/`);
      return {
        success: true,
        data: response,
        message: 'تم حذف الموقع بنجاح'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'فشل في حذف الموقع',
        status: error.status
      };
    }
  }

  async deleteAllLocations() {
    try {
      const response = await apiService.delete(`${this.baseEndpoint}delete-all-my-locations/`);
      return {
        success: true,
        data: response,
        message: 'تم حذف جميع المواقع بنجاح'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'فشل في حذف المواقع',
        status: error.status
      };
    }
  }

  async getLocationStats() {
    try {
      const response = await apiService.get(`${this.baseEndpoint}stats/`);
      return {
        success: true,
        data: response,
        message: 'تم جلب الإحصائيات بنجاح'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'فشل في جلب الإحصائيات',
        status: error.status
      };
    }
  }
}

export const locationService = new LocationService();