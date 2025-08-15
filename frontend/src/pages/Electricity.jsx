import React from "react";
import "./Electricity.css";

const Electricity = () => {
  const services = [
    { id: 1, name: "تصليح أعطال", price: "250 ج.م" },
    { id: 2, name: "تمديد كهرباء", price: "400 ج.م" },
    { id: 3, name: "تركيب إنارة", price: "150 ج.م" },
  ];

  return (
    <div className="category-page">
      <h1>خدمات الكهرباء ⚡</h1>
      <p>جميع أعمال الكهرباء من صيانة وتركيب.</p>
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

export default Electricity;
