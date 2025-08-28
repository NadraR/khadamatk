import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../api";
import { ACCESS_TOKEN } from "../constants";
import "./AdminDashboard.css";

const InvoiceDetails = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const [invoice, setInvoice] = useState(null);
  const token = localStorage.getItem(ACCESS_TOKEN);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await api.get(`/admin/invoices/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInvoice(res.data);
      } catch (err) {
        console.error("Error fetching invoice:", err);
      }
    };
    fetchInvoice();
  }, [id, token]);

  if (!invoice) return <p className="loading-text">{t("loading")}</p>;

  return (
    <div className="dashboard-container" dir="rtl">
      <h1 className="dashboard-header">💰 {t("invoiceDetails")}</h1>
      <div className="stats-column">
        <div className="stat-card"><strong>ID:</strong> {invoice.id}</div>
        <div className="stat-card"><strong>{t("order")}:</strong> {invoice.order_id}</div>
        <div className="stat-card"><strong>{t("amount")}:</strong> {invoice.amount}</div>
        <div className="stat-card"><strong>{t("date")}:</strong> {new Date(invoice.created_at).toLocaleDateString()}</div>
      </div>
    </div>
  );
};

export default InvoiceDetails;
