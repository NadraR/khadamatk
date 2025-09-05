import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ApiService } from "../services/ApiService";
import "./AdminDashboard.css";

const ReviewDetails = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const [review, setReview] = useState(null);
  const apiService = new ApiService();

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const res = await apiService.get(`/admin/reviews/${id}/`);
        setReview(res.data);
      } catch (err) {
        console.error("Error fetching review:", err);
      }
    };
    fetchReview();
  }, [id, token]);

  if (!review) return <p className="loading-text">{t("loading")}</p>;

  return (
    <div className="dashboard-container" dir="rtl">
      <h1 className="dashboard-header">📝 {t("reviewDetails")}</h1>
      <div className="stats-column">
        <div className="stat-card"><strong>ID:</strong> {review.id}</div>
        <div className="stat-card"><strong>{t("user")}:</strong> {review.user_name}</div>
        <div className="stat-card"><strong>{t("text")}:</strong> {review.text}</div>
        <div className="stat-card"><strong>{t("date")}:</strong> {new Date(review.created_at).toLocaleDateString()}</div>
      </div>
    </div>
  );
};

export default ReviewDetails;
