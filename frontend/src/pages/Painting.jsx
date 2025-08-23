import React from "react";
import "./Painting.css";
import { useTranslation } from "react-i18next";

const Painting = () => {
  const { t } = useTranslation();

  const services = [
    { id: 1, name: t("paintingServices.walls"), price: "200 ج.م" },
    { id: 2, name: t("paintingServices.doors"), price: "150 ج.م" },
    { id: 3, name: t("paintingServices.windows"), price: "100 ج.م" },
  ];

  return (
    <div className="category-page">
      <h1>{t("painting.title")} 🎨</h1>
      <p>{t("painting.description")}</p>
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

export default Painting;
