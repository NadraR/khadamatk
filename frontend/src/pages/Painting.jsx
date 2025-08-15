import React from "react";
import "./Painting.css";

const Painting = () => {
  const services = [
    { id: 1, name: "دهان حوائط", price: "200 ج.م" },
    { id: 2, name: "دهان أبواب", price: "150 ج.م" },
    { id: 3, name: "دهان نوافذ", price: "100 ج.م" },
  ];

  return (
    <div className="category-page">
      <h1>خدمات الدهان 🎨</h1>
      <p>هنا هتلاقي كل خدمات الدهان اللي ممكن تحتاجها.</p>
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

export default Painting;
