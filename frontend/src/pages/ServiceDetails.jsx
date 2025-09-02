import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import { ACCESS_TOKEN } from "../constants";
import "./AdminDashboard.css"; 

const ServiceDetails = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const token = localStorage.getItem(ACCESS_TOKEN);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await api.get(`/admin/services/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setService(res.data);
      } catch (err) {
        console.error("Error fetching service:", err);
      }
    };
    fetchService();
  }, [id, token]);

  if (!service) return <p className="loading-text">Loading...</p>;

  return (
    <div className="dashboard-container" dir="rtl">
      <h1 className="dashboard-header">🛠 تفاصيل الخدمة</h1>

      <div className="stats-column">
        <div className="stat-card">
          <strong>ID:</strong> {service.id}
        </div>
        <div className="stat-card">
          <strong>🛠 العنوان:</strong> {service.title}
        </div>
        <div className="stat-card">
          <strong>📖 الوصف:</strong> {service.description || "لا يوجد"}
        </div>
        <div className="stat-card">
          <strong>💰 السعر:</strong> {service.price} جنيه
        </div>
        <div className="stat-card">
          <strong>📍 المدينة:</strong> {service.city || "غير محدد"}
        </div>
        <div className="stat-card">
          <strong>👤 مزود الخدمة:</strong>{" "}
          {service.provider_name || service.user || "غير معروف"}
        </div>
        <div className="stat-card">
          <strong>⭐ التقييم:</strong>{" "}
          {service.rating ? `${service.rating} / 5` : "لم يقيم بعد"}
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;
