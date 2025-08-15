import React from "react";
import "./Carpentry.css";

const Carpentry = () => {
  const services = [
    { id: 1, name: "تصليح أثاث", price: "300 ج.م" },
    { id: 2, name: "تفصيل أبواب", price: "500 ج.م" },
    { id: 3, name: "تفصيل دواليب", price: "800 ج.م" },
  ];

  return (
    <div className="category-page">
      <h1>خدمات النجارة 🔨</h1>
      <p>نوفر لك كل خدمات النجارة بجودة عالية.</p>
      <table>
        <thead>
          <tr>
            <th>رقم</th>
            <th>الخدمة</th>
            <th>السعر</th>
          </tr>
        </thead>
        <tbody>
          {services.map(service => (
            <tr key={service.id}>
              <td>{service.id}</td>
              <td>{service.name}</td>
              <td>{service.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Carpentry;
