import React from 'react';
import { useTranslation } from 'react-i18next';

const AdminDashboard = () => {
  const { t } = useTranslation();

  return (
    <div className='dashboard' style={{ padding: '20px' }}>
      <h1>{t("admin")} Dashboard</h1>
      
      {/* إحصائيات سريعة */}
      <div className="stats-cards" style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <div className="card" style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
          <h3>{t("users")}</h3>
          <p>120</p>
        </div>
        <div className="card" style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
          <h3>{t("services")}</h3>
          <p>45</p>
        </div>
        <div className="card" style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
          <h3>{t("orders")}</h3>
          <p>78</p>
        </div>
        <div className="card" style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
          <h3>{t("monthlyRevenue")}</h3>
          <p>$5600</p>
        </div>
      </div>

      {/* جدول CRUD للمستخدمين (كمثال) */}
      <div style={{ marginTop: '40px' }}>
        <h2>{t("manageUsers")}</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>{t("name")}</th>
              <th>{t("email")}</th>
              <th>{t("role")}</th>
              <th>{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>أحمد</td>
              <td>ahmed@mail.com</td>
              <td>{t("client")}</td>
              <td>
                <button>{t("edit")}</button>
                <button>{t("delete")}</button>
              </td>
            </tr>
            <tr>
              <td>محمد</td>
              <td>mohamed@mail.com</td>
              <td>{t("provider")}</td>
              <td>
                <button>{t("edit")}</button>
                <button>{t("delete")}</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
