import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ApiService } from "../services/ApiService";
import "./AdminDashboard.css";

const RatingDetails = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const [rating, setRating] = useState(null);
  const apiService = new ApiService();

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const res = await apiService.get(`/admin/ratings/${id}/`);
        setRating(res.data);
      } catch (err) {
        console.error("Error fetching rating:", err);
      }
    };
    fetchRating();
  }, [id, token]);

  if (!rating) return <p className="loading-text">{t("loading")}</p>;

  return (
    <div className="dashboard-container" dir="rtl">
      <h1 className="dashboard-header">⭐ {t("ratingDetails")}</h1>
      <div className="stats-column">
        <div className="stat-card"><strong>ID:</strong> {rating.id}</div>
        <div className="stat-card"><strong>{t("user")}:</strong> {rating.user_name}</div>
        <div className="stat-card"><strong>{t("value")}:</strong> {rating.value}</div>
      </div>
    </div>
  );
};

export default RatingDetails;
