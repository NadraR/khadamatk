import apiService from './ApiService';

class LocationService {
  constructor() {
    this.baseEndpoint = '/api/location/locations/';
  }

  async saveLocation(locationData) {
    try {
      const response = await apiService.post(`${this.baseEndpoint}save-location/`, locationData);
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

  async searchNearbyLocations(lat, lng, radius = 10, serviceType = null) {
    try {
      // Check if user is authenticated
      const accessToken = localStorage.getItem('access');
      if (!accessToken || accessToken.trim() === '' || accessToken === 'null' || accessToken === 'undefined') {
        // User not authenticated, use public nearby endpoint
        console.log('[LocationService] User not authenticated, using public nearby API');
        let url = `${this.baseEndpoint}nearby/?lat=${lat}&lng=${lng}&radius=${radius}&max_results=20`;
        if (serviceType) {
          url += `&service_type=${serviceType}`;
        }
        const response = await apiService.get(url);
        return {
          success: true,
          data: response,
          message: 'تم البحث بنجاح'
        };
      }

      // User is authenticated, use nearby endpoint (it's public but works for authenticated users too)
      console.log('[LocationService] User authenticated, using nearby API');
      let url = `${this.baseEndpoint}nearby/?lat=${lat}&lng=${lng}&radius=${radius}&max_results=20`;
      if (serviceType) {
        url += `&service_type=${serviceType}`;
      }
      const response = await apiService.get(url);
      return {
        success: true,
        data: response,
        message: 'تم البحث بنجاح'
      };
    } catch (error) {
      console.error('[LocationService] Enhanced search API Error:', error);
      
      // Fallback to public nearby API
      try {
        console.log('[LocationService] Falling back to public nearby API...');
        const fallbackUrl = `${this.baseEndpoint}nearby/?lat=${lat}&lng=${lng}&radius=${radius}&max_results=20`;
        const fallbackResponse = await apiService.get(fallbackUrl);
        
        return {
          success: true,
          data: fallbackResponse,
          message: 'تم البحث بنجاح (استخدام API بديل)'
        };
      } catch (fallbackError) {
        console.error('[LocationService] Fallback API Error:', fallbackError);
        return {
          success: false,
          error: error.message || 'فشل في البحث عن خدمات قريبة',
          status: error.status
        };
      }
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