import React from 'react';
import { FaTools, FaClock, FaStar, FaUsers } from 'react-icons/fa';
import './Stats.css';
import { useTranslation } from "react-i18next";

const Stats = () => {
  const { t } = useTranslation();

  return (
    <div className="stats">
      <div className="stat-item">
        <FaTools size={25} color="#ff9800" />
        <p>+500</p>
        <span>{t("stats.providers")}</span>
      </div>
      <div className="stat-item">
        <FaClock size={25} color="#03a9f4" />
        <p>24/7</p>
        <span>{t("stats.available")}</span>
      </div>
      <div className="stat-item">
        <FaStar size={25} color="#ffc107" />
        <p>4.9</p>
        <span>{t("stats.rating")}</span>
      </div>
      <div className="stat-item">
        <FaUsers size={25} color="#4caf50" />
        <p>+10,000</p>
        <span>{t("stats.clients")}</span>
      </div>
    </div>
  );
};

export default Stats;
