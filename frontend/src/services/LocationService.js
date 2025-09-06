import apiService from './ApiService';

class LocationService {
  constructor() {
    this.baseEndpoint = '/api/location/locations/';
  }

  async saveLocation(locationData) {
    try {
      // Use the specialized save-location endpoint
      const payload = {
        lat: locationData.lat,
        lng: locationData.lng,
        address: locationData.address || '',
        city: locationData.city || '',
        country: locationData.country || 'مصر'
      };
      
      const response = await apiService.post(`${this.baseEndpoint}save-location/`, payload);
      return {
        success: true,
        data: response.data,
        message: response.message || 'تم حفظ الموقع بنجاح'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'فشل في حفظ الموقع',
        status: error.response?.status || error.status
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
      // Use the service nearby API for better filtering
      let url = `/api/services/nearby/?lat=${lat}&lng=${lng}&radius_km=${radius}`;
      
      if (serviceType) {
        url += `&service_type=${serviceType}`;
      }
      
      console.log('Calling API:', url);
      const response = await apiService.get(url);
      return {
        success: true,
        data: response,
        message: 'تم البحث بنجاح'
      };
    } catch (error) {
      console.error('Service API Error:', error);
      
      // Fallback to location API if service API fails
      try {
        console.log('Falling back to location API...');
        const fallbackUrl = `${this.baseEndpoint}nearby/?lat=${lat}&lng=${lng}&radius=${radius}&max_results=20`;
        const fallbackResponse = await apiService.get(fallbackUrl);
        
        return {
          success: true,
          data: fallbackResponse,
          message: 'تم البحث بنجاح (استخدام API بديل)'
        };
      } catch (fallbackError) {
        console.error('Fallback API Error:', fallbackError);
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