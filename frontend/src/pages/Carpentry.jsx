import React from "react";
import "./Carpentry.css";
import { useTranslation } from "react-i18next";

const Carpentry = () => {
  const { t } = useTranslation();

  const services = [
    { id: 1, name: t("carpentry.repair"), price: "300 ج.م" },
    { id: 2, name: t("carpentry.doors"), price: "500 ج.م" },
    { id: 3, name: t("carpentry.wardrobes"), price: "800 ج.م" },
  ];

  return (
    <div className="category-page">
      <h1>{t("carpentry.title")} 🔨</h1>
      <p>{t("carpentry.subtitle")}</p>
      <table>
        <thead>
          <tr>
            <th>{t("carpentry.id")}</th>
            <th>{t("carpentry.service")}</th>
            <th>{t("carpentry.price")}</th>
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
