import apiService from './ApiService';

class ReviewService {
  constructor() {
    this.baseEndpoint = '/api/reviews';
  }

  // Get reviews for a specific service
  async getServiceReviews(serviceId) {
    try {
      const response = await apiService.get(`${this.baseEndpoint}/service/${serviceId}/`);
      return {
        success: true,
        data: response || [],
        message: 'تم تحميل المراجعات بنجاح'
      };
    } catch (error) {
      console.error('Error fetching service reviews:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'خطأ في تحميل المراجعات',
        data: []
      };
    }
  }

  // Get all reviews by current user
  async getMyReviews() {
    try {
      const response = await apiService.get(`${this.baseEndpoint}/my-reviews/`);
      return {
        success: true,
        data: response || [],
        message: 'تم تحميل مراجعاتك بنجاح'
      };
    } catch (error) {
      console.error('Error fetching my reviews:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'خطأ في تحميل مراجعاتك',
        data: []
      };
    }
  }

  // Create a new review
  async createReview(reviewData) {
    try {
      const response = await apiService.post(`${this.baseEndpoint}/create/`, reviewData);
      return {
        success: true,
        data: response.review || response,
        message: response.message || 'تم إرسال المراجعة بنجاح'
      };
    } catch (error) {
      console.error('Error creating review:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'خطأ في إرسال المراجعة'
      };
    }
  }

  // Create review for a specific order
  async createOrderReview(orderId, reviewData) {
    try {
      const response = await apiService.post(`${this.baseEndpoint}/create/${orderId}/`, reviewData);
      return {
        success: true,
        data: response.review || response,
        message: response.message || 'تم إرسال المراجعة بنجاح'
      };
    } catch (error) {
      console.error('Error creating order review:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'خطأ في إرسال المراجعة'
      };
    }
  }

  // Update an existing review
  async updateReview(reviewId, reviewData) {
    try {
      const response = await apiService.put(`${this.baseEndpoint}/${reviewId}/`, reviewData);
      return {
        success: true,
        data: response,
        message: 'تم تحديث المراجعة بنجاح'
      };
    } catch (error) {
      console.error('Error updating review:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'خطأ في تحديث المراجعة'
      };
    }
  }

  // Delete a review
  async deleteReview(reviewId) {
    try {
      await apiService.delete(`${this.baseEndpoint}/${reviewId}/`);
      return {
        success: true,
        message: 'تم حذف المراجعة بنجاح'
      };
    } catch (error) {
      console.error('Error deleting review:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'خطأ في حذف المراجعة'
      };
    }
  }

  // Get a specific review details
  async getReviewDetails(reviewId) {
    try {
      const response = await apiService.get(`${this.baseEndpoint}/${reviewId}/`);
      return {
        success: true,
        data: response,
        message: 'تم تحميل تفاصيل المراجعة بنجاح'
      };
    } catch (error) {
      console.error('Error fetching review details:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'خطأ في تحميل تفاصيل المراجعة'
      };
    }
  }

  // Get reviews for a specific provider/worker
  async getProviderReviews(providerId) {
    try {
      const response = await apiService.get(`${this.baseEndpoint}/provider/${providerId}/`);
      return {
        success: true,
        data: response || [],
        message: 'تم تحميل مراجعات مزود الخدمة بنجاح'
      };
    } catch (error) {
      console.error('Error fetching provider reviews:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'خطأ في تحميل مراجعات مزود الخدمة',
        data: []
      };
    }
  }
}

export default new ReviewService();

