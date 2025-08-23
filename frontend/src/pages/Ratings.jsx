import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Ratings.css";

const Ratings = ({ serviceId = 1 }) => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`http://127.0.0.1:8000/api/ratings/service/${serviceId}/`)
      .then((res) => {
        setRatings(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching ratings:", err);
        setLoading(false);
      });
  }, [serviceId]);

  if (loading) return <p>جاري تحميل التقييمات...</p>;

  return (
    <div className="ratings-container">
      <h1 className="ratings-title">تقييمات الخدمة</h1>

      <button className="add-rating-btn">+ إضافة تقييم</button>

      <table className="ratings-table">
        <thead>
          <tr>
            <th>رقم</th>
            <th>التقييم</th>
            <th>التاريخ</th>
          </tr>
        </thead>
        <tbody>
          {ratings.map((rating) => (
            <tr key={rating.id}>
              <td>{rating.id}</td>
              <td>{rating.score} ⭐</td>
              <td>{rating.created_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Ratings;
