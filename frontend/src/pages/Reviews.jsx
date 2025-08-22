import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Reviews.css";

const Reviews = ({ serviceId = 1 }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`http://127.0.0.1:8000/api/reviews/service/${serviceId}/`)
      .then((res) => {
        setReviews(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching reviews:", err);
        setLoading(false);
      });
  }, [serviceId]);

  if (loading) return <p>جاري تحميل التقييمات...</p>;

  return (
    <div className="reviews-container">
      <h1 className="reviews-title">آراء العملاء</h1>

      <button className="add-review-btn">+ إضافة رأي</button>

      <table className="reviews-table">
        <thead>
          <tr>
            <th>رقم</th>
            <th>التعليق</th>
            <th>التاريخ</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((review) => (
            <tr key={review.id}>
              <td>{review.id}</td>
              <td>{review.comment}</td>
              <td>{review.created_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Reviews;
