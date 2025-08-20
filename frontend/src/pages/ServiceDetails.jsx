import React from "react";
// import "./ServiceDetails.css";

const ServiceDetails = () => {
  return (
    <div className="service-details" dir="rtl">
      <h2>تفاصيل الخدمة</h2>
      
      <div className="service-card">
        <h3>سباكة متقدمة</h3>
        <p>مزود الخدمة: محمد أحمد</p>
        <p>التقييم: ⭐⭐⭐⭐ (20 تقييم)</p>
        <p>الوصف: خدمة سباكة شاملة لجميع أعمال المنزل.</p>
        <p>السعر: 500 جنيه</p>
        <button className="book-btn">حجز الخدمة</button>
      </div>
    </div>
  );
};

export default ServiceDetails;
