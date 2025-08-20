import React from "react";
import "./Plumbing.css";
import { useTranslation } from "react-i18next";

const Plumbing = () => {
  const { t } = useTranslation();

  const services = [
    { id: 1, name: t("plumbingServices.pipes"), price: "200 ج.م" },
    { id: 2, name: t("plumbingServices.mixers"), price: "150 ج.م" },
    { id: 3, name: t("plumbingServices.leak"), price: "300 ج.م" },
  ];

  return (
    <div className="category-page">
      <h1>{t("plumbing.title")} 🔧</h1>
      <p>{t("plumbing.description")}</p>
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

export default Plumbing;
