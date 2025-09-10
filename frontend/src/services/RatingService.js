import apiService from './ApiService';

class RatingService {
  constructor() {
    this.baseEndpoint = '/api/ratings';
  }

  // Get rating statistics for a service
  async getServiceRating(serviceId) {
    try {
      const response = await apiService.get(`${this.baseEndpoint}/service/${serviceId}/`);
      return {
        success: true,
        data: {
          average_rating: response.average_rating || 0,
          total_ratings: response.total_ratings || 0,
          rating_distribution: response.rating_distribution || {}
        },
        message: 'تم تحميل تقييم الخدمة بنجاح'
      };
    } catch (error) {
      console.error('Error fetching service rating:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'خطأ في تحميل تقييم الخدمة',
        data: {
          average_rating: 0,
          total_ratings: 0,
          rating_distribution: {}
        }
      };
    }
  }

  // Get rating statistics for a provider
  async getProviderRating(providerId) {
    try {
      const response = await apiService.get(`${this.baseEndpoint}/provider/${providerId}/`);
      return {
        success: true,
        data: {
          average_rating: response.average_rating || 0,
          total_ratings: response.total_ratings || 0,
          rating_distribution: response.rating_distribution || {},
          recent_reviews: response.recent_reviews || []
        },
        message: 'تم تحميل تقييم مزود الخدمة بنجاح'
      };
    } catch (error) {
      console.error('Error fetching provider rating:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'خطأ في تحميل تقييم مزود الخدمة',
        data: {
          average_rating: 0,
          total_ratings: 0,
          rating_distribution: {},
          recent_reviews: []
        }
      };
    }
  }

  // Create or update a rating
  async rateService(ratingData) {
    try {
      const response = await apiService.post(`${this.baseEndpoint}/rate/`, ratingData);
      return {
        success: true,
        data: response,
        message: response.message || 'تم إرسال التقييم بنجاح'
      };
    } catch (error) {
      console.error('Error rating service:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'خطأ في إرسال التقييم'
      };
    }
  }

  // Get user's rating for a specific service
  async getUserRating(serviceId) {
    try {
      const response = await apiService.get(`${this.baseEndpoint}/my-rating/${serviceId}/`);
      return {
        success: true,
        data: response,
        message: 'تم تحميل تقييمك بنجاح'
      };
    } catch (error) {
      console.error('Error fetching user rating:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'لم يتم العثور على تقييمك',
        data: null
      };
    }
  }

  // Get all ratings by current user
  async getMyRatings() {
    try {
      const response = await apiService.get(`${this.baseEndpoint}/my-ratings/`);
      return {
        success: true,
        data: response || [],
        message: 'تم تحميل تقييماتك بنجاح'
      };
    } catch (error) {
      console.error('Error fetching my ratings:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'خطأ في تحميل تقييماتك',
        data: []
      };
    }
  }

  // Delete a rating
  async deleteRating(ratingId) {
    try {
      await apiService.delete(`${this.baseEndpoint}/${ratingId}/`);
      return {
        success: true,
        message: 'تم حذف التقييم بنجاح'
      };
    } catch (error) {
      console.error('Error deleting rating:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'خطأ في حذف التقييم'
      };
    }
  }

  // Get top rated services
  async getTopRatedServices(limit = 10) {
    try {
      const response = await apiService.get(`${this.baseEndpoint}/top-rated/?limit=${limit}`);
      return {
        success: true,
        data: response || [],
        message: 'تم تحميل الخدمات الأعلى تقييماً بنجاح'
      };
    } catch (error) {
      console.error('Error fetching top rated services:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'خطأ في تحميل الخدمات الأعلى تقييماً',
        data: []
      };
    }
  }

  // Get top rated providers
  async getTopRatedProviders(limit = 10) {
    try {
      const response = await apiService.get(`${this.baseEndpoint}/top-providers/?limit=${limit}`);
      return {
        success: true,
        data: response || [],
        message: 'تم تحميل مزودي الخدمة الأعلى تقييماً بنجاح'
      };
    } catch (error) {
      console.error('Error fetching top rated providers:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'خطأ في تحميل مزودي الخدمة الأعلى تقييماً',
        data: []
      };
    }
  }
}

export default new RatingService();

