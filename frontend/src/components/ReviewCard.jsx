import React from 'react';
import { FaUser, FaCalendarAlt, FaEdit, FaTrash } from 'react-icons/fa';
import RatingStars from './RatingStars';

const ReviewCard = ({ 
  review, 
  showActions = false, 
  onEdit = null, 
  onDelete = null,
  className = ''
}) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={`review-card bg-white rounded-3 shadow-sm p-4 mb-3 ${className}`}>
      {/* Review Header */}
      <div className="review-header d-flex justify-content-between align-items-start mb-3">
        <div className="reviewer-info d-flex align-items-center">
          <div className="reviewer-avatar bg-primary rounded-circle d-flex align-items-center justify-content-center me-3"
               style={{ width: '40px', height: '40px' }}>
            <FaUser className="text-white" size={16} />
          </div>
          <div>
            <h6 className="mb-1 fw-bold">
              {review.customer?.first_name && review.customer?.last_name 
                ? `${review.customer.first_name} ${review.customer.last_name}`
                : review.customer?.username || 'عميل'}
            </h6>
            <div className="d-flex align-items-center text-muted">
              <FaCalendarAlt size={12} className="me-1" />
              <small>{formatDate(review.created_at)}</small>
            </div>
          </div>
        </div>
        
        <div className="review-rating">
          <RatingStars rating={review.score} size={18} />
        </div>
      </div>

      {/* Review Content */}
      <div className="review-content">
        {review.comment && (
          <p className="review-text mb-2" style={{ lineHeight: '1.6' }}>
            {review.comment}
          </p>
        )}
        
        {review.service && (
          <div className="service-info">
            <small className="text-muted">
              <strong>الخدمة:</strong> {review.service.title || review.service_name}
            </small>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {showActions && (onEdit || onDelete) && (
        <div className="review-actions mt-3 pt-3 border-top">
          <div className="d-flex gap-2">
            {onEdit && (
              <button 
                className="btn btn-sm btn-outline-primary"
                onClick={() => onEdit(review)}
              >
                <FaEdit className="me-1" size={12} />
                تعديل
              </button>
            )}
            {onDelete && (
              <button 
                className="btn btn-sm btn-outline-danger"
                onClick={() => onDelete(review)}
              >
                <FaTrash className="me-1" size={12} />
                حذف
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;

