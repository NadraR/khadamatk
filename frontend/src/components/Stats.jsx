import React from 'react';
import { FaTools, FaClock, FaStar, FaUsers } from 'react-icons/fa';
import './Stats.css';

const Stats = () => {
  return (
    <div className="stats">
      <div className="stat-item">
        <FaTools size={25} color="#ff9800" />
        <p>+500</p>
        <span>مزود خدمة</span>
      </div>
      <div className="stat-item">
        <FaClock size={25} color="#03a9f4" />
        <p>24/7</p>
        <span>خدمة متاحة</span>
      </div>
      <div className="stat-item">
        <FaStar size={25} color="#ffc107" />
        <p>4.9</p>
        <span>متوسط التقييم</span>
      </div>
      <div className="stat-item">
        <FaUsers size={25} color="#4caf50" />
        <p>+10,000</p>
        <span>عميل راضي</span>
      </div>
    </div>
  );
};

export default Stats;
