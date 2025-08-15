import React from "react";
import "./Plumbing.css";

const Plumbing = () => {
  const services = [
    { id: 1, name: "تصليح مواسير", price: "200 ج.م" },
    { id: 2, name: "تركيب خلاطات", price: "150 ج.م" },
    { id: 3, name: "كشف تسريب", price: "300 ج.م" },
  ];

  return (
    <div className="category-page">
      <h1>خدمات السباكة 🔧</h1>
      <p>حل جميع مشاكل السباكة بسرعة وكفاءة.</p>
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

export default Plumbing;
