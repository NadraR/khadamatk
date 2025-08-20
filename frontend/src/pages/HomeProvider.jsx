import React from "react";
import { useTranslation } from "react-i18next";

const HomeProvider = () => {
  const { t } = useTranslation();

  return (
    <div className="provider-dashboard dashboard" dir="rtl">
      <h2>{t("providerDashboardTitle")}</h2>
      
      {/* إحصائيات سريعة */}
      <div className="stats">
        <div className="stat-box">
          <h3>12</h3>
          <p>{t("currentOrders")}</p>
        </div>
        <div className="stat-box">
          <h3>5</h3>
          <p>{t("completedOrders")}</p>
        </div>
        <div className="stat-box">
          <h3>3</h3>
          <p>{t("pendingOrders")}</p>
        </div>
      </div>

      {/* قائمة الطلبات */}
      <div className="orders">
        <h3>{t("ordersList")}</h3>
        <table className="orders-table">
          <thead>
            <tr>
              <th>{t("client")}</th>
              <th>{t("service")}</th>
              <th>{t("date")}</th>
              <th>{t("status")}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>محمد أحمد</td>
              <td>{t("plumbing")}</td>
              <td>2025-08-20</td>
              <td>{t("pending")}</td>
            </tr>
            <tr>
              <td>سارة علي</td>
              <td>{t("electricity")}</td>
              <td>2025-08-19</td>
              <td>{t("completed")}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HomeProvider;
