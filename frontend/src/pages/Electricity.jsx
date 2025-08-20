import React from "react";
import "./Electricity.css";
import { useTranslation } from "react-i18next";

const Electricity = () => {
  const { t } = useTranslation();

  const services = [
    { id: 1, name: t("electricityServices.repair"), price: "250 ج.م" },
    { id: 2, name: t("electricityServices.installation"), price: "400 ج.م" },
    { id: 3, name: t("electricityServices.lighting"), price: "150 ج.م" },
  ];

  return (
    <div className="category-page">
      <h1>{t("electricity.title")} ⚡</h1>
      <p>{t("electricity.description")}</p>
      <table>
        <thead>
          <tr>
            <th>{t("tableHeaders.id")}</th>
            <th>{t("tableHeaders.service")}</th>
            <th>{t("tableHeaders.price")}</th>
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
