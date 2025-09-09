import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const RatingStars = ({ 
  rating = 0, 
  totalStars = 5, 
  size = 16, 
  color = '#ffc107',
  interactive = false,
  onRatingChange = null,
  className = ''
}) => {
  const handleStarClick = (starIndex) => {
    if (interactive && onRatingChange) {
      onRatingChange(starIndex + 1);
    }
  };

  const renderStar = (index) => {
    const starValue = index + 1;
    const isFilled = rating >= starValue;
    const isHalfFilled = rating >= starValue - 0.5 && rating < starValue;

    let StarIcon = FaRegStar;
    if (isFilled) {
      StarIcon = FaStar;
    } else if (isHalfFilled) {
      StarIcon = FaStarHalfAlt;
    }

    return (
      <StarIcon
        key={index}
        size={size}
        color={isFilled || isHalfFilled ? color : '#ddd'}
        style={{
          cursor: interactive ? 'pointer' : 'default',
          marginRight: '2px',
          transition: 'color 0.2s ease'
        }}
        onClick={() => handleStarClick(index)}
        onMouseEnter={interactive ? (e) => {
          e.target.style.transform = 'scale(1.1)';
        } : undefined}
        onMouseLeave={interactive ? (e) => {
          e.target.style.transform = 'scale(1)';
        } : undefined}
      />
    );
  };

  return (
    <div className={`rating-stars d-inline-flex align-items-center ${className}`}>
      {Array.from({ length: totalStars }, (_, index) => renderStar(index))}
      {rating > 0 && (
        <span className="ms-2 text-muted" style={{ fontSize: size - 2 }}>
          ({rating.toFixed(1)})
        </span>
      )}
    </div>
  );
};

export default RatingStars;

