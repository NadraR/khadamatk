import React from "react";
import './Services.css';

const Services = () => {
  const services = [
    { id: 1, name: "دهان", price: "200 ج.م" },
    { id: 2, name: "سباكة", price: "150 ج.م" },
    { id: 3, name: "كهرباء", price: "250 ج.م" },
  ];

  return (
    <div className="services-container">
      <h1 className="services-title">الخدمات</h1>

      <button className="add-service-btn">+ إضافة خدمة</button>

      <table className="services-table">
        <thead>
          <tr>
            <th>رقم</th>
            <th>اسم الخدمة</th>
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

export default Services;
