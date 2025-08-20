import React from "react";
import { useTranslation } from "react-i18next";
import "./Services.css";

const Services = () => {
  const { t } = useTranslation();

  const services = [
    { id: 1, name: t("painting"), price: "200 ج.م" },
    { id: 2, name: t("plumbing"), price: "150 ج.م" },
    { id: 3, name: t("electricity"), price: "250 ج.م" },
  ];

  return (
    <div className="services-container" dir="rtl">
      <h1 className="services-title">{t("services")}</h1>

      <button className="add-service-btn">+ {t("addService")}</button>

      <table className="services-table">
        <thead>
          <tr>
            <th>{t("number")}</th>
            <th>{t("serviceName")}</th>
            <th>{t("price")}</th>
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
