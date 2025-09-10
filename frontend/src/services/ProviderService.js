import apiService from './ApiService';

class ProviderService {
  constructor() {
    this.baseEndpoint = '/api/accounts';
  }

  /**
   * Get public provider profile by ID
   * @param {number} providerId - Provider ID
   * @returns {Promise<Object>} Provider profile data
   */
  async getProviderProfile(providerId) {
    try {
      console.log('[ProviderService] Fetching provider profile for ID:', providerId);
      
      const response = await apiService.get(`${this.baseEndpoint}/provider/${providerId}/`);
      
      console.log('[ProviderService] Provider profile response:', response);
      
      return {
        success: true,
        data: response,
        message: 'تم جلب ملف مقدم الخدمة بنجاح'
      };
    } catch (error) {
      console.error('[ProviderService] Error fetching provider profile:', error);
      
      let errorMessage = 'فشل في جلب ملف مقدم الخدمة';
      
      if (error.response?.status === 404) {
        errorMessage = 'مقدم الخدمة غير موجود';
      } else if (error.response?.status === 403) {
        errorMessage = 'غير مصرح لك بعرض هذا الملف';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى';
      }
      
      return {
        success: false,
        error: errorMessage,
        status: error.response?.status
      };
    }
  }

  /**
   * Get provider's services
   * @param {number} providerId - Provider ID
   * @returns {Promise<Object>} Provider services data
   */
  async getProviderServices(providerId) {
    try {
      console.log('[ProviderService] Fetching services for provider ID:', providerId);
      
      const response = await apiService.get(`/api/services/?provider=${providerId}`);
      
      return {
        success: true,
        data: response,
        message: 'تم جلب خدمات مقدم الخدمة بنجاح'
      };
    } catch (error) {
      console.error('[ProviderService] Error fetching provider services:', error);
      
      return {
        success: false,
        error: 'فشل في جلب خدمات مقدم الخدمة',
        status: error.response?.status
      };
    }
  }

  /**
   * Get provider's reviews
   * @param {number} providerId - Provider ID
   * @returns {Promise<Object>} Provider reviews data
   */
  async getProviderReviews(providerId) {
    try {
      console.log('[ProviderService] Fetching reviews for provider ID:', providerId);
      
      const response = await apiService.get(`/api/reviews/provider/${providerId}/`);
      
      return {
        success: true,
        data: response,
        message: 'تم جلب تقييمات مقدم الخدمة بنجاح'
      };
    } catch (error) {
      console.error('[ProviderService] Error fetching provider reviews:', error);
      
      return {
        success: false,
        error: 'فشل في جلب تقييمات مقدم الخدمة',
        status: error.response?.status
      };
    }
  }

  /**
   * Get provider's location
   * @param {number} providerId - Provider ID
   * @returns {Promise<Object>} Provider location data
   */
  async getProviderLocation(providerId) {
    try {
      console.log('[ProviderService] Fetching location for provider ID:', providerId);
      
      const response = await apiService.get(`/api/location/locations/?user=${providerId}`);
      
      return {
        success: true,
        data: response,
        message: 'تم جلب موقع مقدم الخدمة بنجاح'
      };
    } catch (error) {
      console.error('[ProviderService] Error fetching provider location:', error);
      
      return {
        success: false,
        error: 'فشل في جلب موقع مقدم الخدمة',
        status: error.response?.status
      };
    }
  }

  /**
   * Contact provider via WhatsApp
   * @param {string} phoneNumber - Provider's phone number
   * @param {string} message - Message to send
   */
  contactViaWhatsApp(phoneNumber, message = 'مرحباً، أود الاستفسار عن خدماتك') {
    if (!phoneNumber) {
      console.error('[ProviderService] No phone number provided for WhatsApp contact');
      return false;
    }

    // Remove non-digit characters and ensure Egyptian format
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    let formattedPhone = cleanPhone;

    // Add country code if not present
    if (cleanPhone.length === 11 && cleanPhone.startsWith('01')) {
      formattedPhone = '2' + cleanPhone; // Add Egypt country code
    } else if (cleanPhone.length === 10 && cleanPhone.startsWith('1')) {
      formattedPhone = '20' + cleanPhone; // Add Egypt country code
    }

    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    
    console.log('[ProviderService] Opening WhatsApp with URL:', whatsappUrl);
    
    window.open(whatsappUrl, '_blank');
    return true;
  }

  /**
   * Get provider statistics
   * @param {number} providerId - Provider ID
   * @returns {Promise<Object>} Provider statistics
   */
  async getProviderStats(providerId) {
    try {
      console.log('[ProviderService] Fetching stats for provider ID:', providerId);
      
      // This would be a comprehensive stats endpoint if available
      // For now, we'll aggregate from the main profile endpoint
      const profileResult = await this.getProviderProfile(providerId);
      
      if (profileResult.success) {
        const stats = profileResult.data.stats || {};
        return {
          success: true,
          data: stats,
          message: 'تم جلب إحصائيات مقدم الخدمة بنجاح'
        };
      }
      
      return profileResult;
    } catch (error) {
      console.error('[ProviderService] Error fetching provider stats:', error);
      
      return {
        success: false,
        error: 'فشل في جلب إحصائيات مقدم الخدمة',
        status: error.response?.status
      };
    }
  }
}

export const providerService = new ProviderService();
export default providerService;
