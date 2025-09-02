import React, { useEffect, useState } from "react";
import api from "../api";
import { ACCESS_TOKEN } from "../constants";
import "./Ratings.css";

const Ratings = ({ serviceId = 1 }) => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem(ACCESS_TOKEN);
  // لو الـ endpoint الأساسي بتاع الـ ratings هو /ratings/ جرب كده:
  const baseURL = `${import.meta.env.VITE_API_URL}/ratings/`;

  const fetchRatings = async () => {
    setLoading(true);
    try {
      const response = await api.get(baseURL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { service: serviceId }, // ✨ كده بنبعت serviceId كـ query parameter
      });

      if (Array.isArray(response.data)) {
        setRatings(response.data);
      } else if (
        response.data &&
        typeof response.data === "object" &&
        Array.isArray(response.data.results)
      ) {
        setRatings(response.data.results);
      } else {
        setRatings([]);
      }
    } catch (err) {
      console.error("❌ Error fetching ratings:", err.response?.data || err);
      setRatings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, [serviceId]);

  if (loading) return <p className="loading-text">جاري تحميل التقييمات...</p>;

  return (
    <div className="ratings-container" dir="rtl">
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
          {Array.isArray(ratings) && ratings.length > 0 ? (
            ratings.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.score} ⭐</td>
                <td>{r.created_at}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">لا توجد تقييمات بعد</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Ratings;
