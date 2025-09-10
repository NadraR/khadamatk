import React, { useState, useEffect } from 'react';
import { FaStar, FaTimes, FaSpinner } from 'react-icons/fa';
import RatingStars from './RatingStars';

const ReviewModal = ({ 
  show, 
  onHide, 
  service = null, 
  order = null,
  existingReview = null,
  onSubmit,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    score: 5,
    comment: ''
  });

  // Load existing review data when editing
  useEffect(() => {
    if (existingReview) {
      setFormData({
        score: existingReview.score || 5,
        comment: existingReview.comment || ''
      });
    } else {
      setFormData({
        score: 5,
        comment: ''
      });
    }
  }, [existingReview, show]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      // استخدام service_id من الطلب إذا لم يكن service object موجود
      const serviceId = service?.id || order?.service_id;
      
      console.log('[DEBUG] ReviewModal submit:', {
        service_id: serviceId,
        order_id: order?.id,
        score: formData.score,
        comment: formData.comment,
        service: service,
        order: order
      });
      
      onSubmit({
        ...formData,
        service_id: serviceId,
        order_id: order?.id
      });
    }
  };

  const handleRatingChange = (newRating) => {
    setFormData(prev => ({ ...prev, score: newRating }));
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">
              <FaStar className="me-2" />
              {existingReview ? 'تعديل المراجعة' : 'إضافة مراجعة'}
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={onHide}
              disabled={loading}
            ></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {/* Service Info */}
              {(service || order) && (
                <div className="service-info mb-4 p-3 bg-light rounded">
                  <h6 className="mb-1">
                    {service?.title || service?.name || order?.service_name || 'خدمة غير محددة'}
                  </h6>
                  {service?.provider && (
                    <small className="text-muted">
                      مقدم الخدمة: {service.provider.first_name} {service.provider.last_name}
                    </small>
                  )}
                  {order && (
                    <small className="text-muted d-block">
                      رقم الطلب: #{order.id}
                    </small>
                  )}
                </div>
              )}

              {/* Rating Selection */}
              <div className="mb-4">
                <label className="form-label fw-bold">التقييم:</label>
                <div className="d-flex align-items-center gap-3">
                  <RatingStars 
                    rating={formData.score}
                    interactive={true}
                    onRatingChange={handleRatingChange}
                    size={24}
                  />
                  <span className="badge bg-primary">{formData.score} من 5</span>
                </div>
              </div>

              {/* Comment */}
              <div className="mb-3">
                <label className="form-label fw-bold">التعليق:</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="اكتب تعليقك حول الخدمة (اختياري)..."
                  value={formData.comment}
                  onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                  disabled={loading}
                  style={{ resize: 'vertical' }}
                />
                <div className="form-text">
                  شارك تجربتك مع الآخرين لمساعدتهم في اتخاذ القرار المناسب
                </div>
              </div>

              {/* Guidelines */}
              <div className="alert alert-info">
                <small>
                  <strong>إرشادات المراجعة:</strong>
                  <ul className="mb-0 mt-2">
                    <li>كن صادقاً ومنصفاً في تقييمك</li>
                    <li>ركز على جودة الخدمة والالتزام بالمواعيد</li>
                    <li>تجنب استخدام لغة غير لائقة</li>
                  </ul>
                </small>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={onHide}
                disabled={loading}
              >
                إلغاء
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FaSpinner className="me-2 spinner-border spinner-border-sm" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <FaStar className="me-2" />
                    {existingReview ? 'تحديث المراجعة' : 'إرسال المراجعة'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;