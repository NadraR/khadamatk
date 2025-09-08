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
        country: locationData.country || 'مصر',
        neighborhood: locationData.neighborhood || '',
        location_type: locationData.location_type || 'other',
        name: locationData.name || '',
        is_primary: locationData.is_primary || false,
        building_number: locationData.building_number || '',
        apartment_number: locationData.apartment_number || '',
        floor_number: locationData.floor_number || '',
        landmark: locationData.landmark || '',
        additional_details: locationData.additional_details || ''
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

  async searchNearbyLocations(lat, lng, radius = 20, serviceType = null, searchQuery = '') {
    try {
      // First try the enhanced worker search endpoint
      let url = `${this.baseEndpoint}search-workers/?lat=${lat}&lng=${lng}&radius=${radius}&max_results=100`;
      
      if (serviceType) {
        url += `&service_type=${encodeURIComponent(serviceType)}`;
      }
      
      if (searchQuery && searchQuery.trim()) {
        url += `&q=${encodeURIComponent(searchQuery.trim())}`;
      }
      
      console.log('[LocationService] Calling enhanced worker search API:', url);
      const response = await apiService.get(url);
      
      // Transform the response to match expected format
      const transformedData = response.results || response || [];
      
      console.log('[LocationService] Enhanced search results:', transformedData.length, 'workers found');
      
      return {
        success: true,
        data: transformedData,
        message: response.message || 'تم البحث بنجاح'
      };
    } catch (error) {
      console.error('[LocationService] Enhanced search API Error:', error);
      
      // Fallback 1: Try the service nearby API
      try {
        console.log('[LocationService] Falling back to service API...');
        let serviceUrl = `/api/services/nearby/?lat=${lat}&lng=${lng}&radius_km=${radius}`;
        
        if (serviceType) {
          serviceUrl += `&service_type=${encodeURIComponent(serviceType)}`;
        }
        
        if (searchQuery && searchQuery.trim()) {
          serviceUrl += `&q=${encodeURIComponent(searchQuery.trim())}`;
        }
        
        const serviceResponse = await apiService.get(serviceUrl);
        return {
          success: true,
          data: serviceResponse,
          message: 'تم البحث بنجاح (خدمات)'
        };
      } catch (serviceError) {
        console.error('[LocationService] Service API Error:', serviceError);
        
        // Fallback 2: Try the basic location nearby API
        try {
          console.log('[LocationService] Falling back to basic location API...');
          const locationUrl = `${this.baseEndpoint}nearby/?lat=${lat}&lng=${lng}&radius=${radius}&max_results=50`;
          const locationResponse = await apiService.get(locationUrl);
          
          return {
            success: true,
            data: locationResponse,
            message: 'تم البحث بنجاح (مواقع)'
          };
        } catch (locationError) {
          console.error('[LocationService] All search APIs failed:', locationError);
          return {
            success: false,
            error: error.response?.data?.error || error.message || 'فشل في البحث عن العمال القريبين',
            status: error.response?.status || error.status
          };
        }
      }
    }
  }

  async searchWorkersWithRetry(lat, lng, options = {}) {
    const {
      radius = 20,
      serviceType = null,
      searchQuery = '',
      maxRetries = 3,
      retryDelay = 1000
    } = options;

    let lastError = null;
    let currentDelay = retryDelay;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[LocationService] Search attempt ${attempt}/${maxRetries}`);
        
        const result = await this.searchNearbyLocations(lat, lng, radius, serviceType, searchQuery);
        
        if (result.success) {
          console.log(`[LocationService] Search successful on attempt ${attempt}`);
          return result;
        }
        
        lastError = result;
        
        // If this isn't the last attempt, wait before retrying
        if (attempt < maxRetries) {
          console.log(`[LocationService] Waiting ${currentDelay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, currentDelay));
          // Increase delay for next retry (exponential backoff)
          currentDelay *= 2;
        }
        
      } catch (error) {
        console.error(`[LocationService] Search attempt ${attempt} failed:`, error);
        lastError = {
          success: false,
          error: error.message || 'Network error',
          status: error.status
        };
        
        // If this isn't the last attempt, wait before retrying
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, currentDelay));
          currentDelay *= 2;
        }
      }
    }
    
    console.error('[LocationService] All search attempts failed');
    return lastError || {
      success: false,
      error: 'فشل في البحث بعد عدة محاولات',
      status: 500
    };
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