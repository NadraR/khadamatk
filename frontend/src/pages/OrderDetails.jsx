import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../api";
import { ACCESS_TOKEN } from "../constants";

const OrderDetails = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const [order, setOrder] = useState(null);
  const token = localStorage.getItem(ACCESS_TOKEN);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrder(res.data);
      } catch (err) {
        console.error("Error fetching order:", err);
      }
    };
    fetchOrder();
  }, [id, token]);

  if (!order)
    return <p style={{ textAlign: "center", marginTop: "50px" }}>{t("loading")}</p>;

  // --- استايلات CSS-in-JS ---
  const styles = {
    container: {
      maxWidth: "800px",
      margin: "30px auto",
      padding: "20px",
      background: "#f7f7f7",
      borderRadius: "12px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      fontFamily: "Arial, sans-serif",
      direction: "rtl",
    },
    header: {
      fontSize: "28px",
      marginBottom: "25px",
      textAlign: "center",
      color: "#333",
    },
    stats: {
      display: "flex",
      flexDirection: "column",
      gap: "15px",
    },
    card: {
      background: "#fff",
      padding: "15px 20px",
      borderRadius: "10px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
      fontSize: "18px",
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "center",
    },
    strong: {
      marginRight: "10px",
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>📦 {t("orderDetails")}</h1>

      <div style={styles.stats}>
        <div style={styles.card}>
          <strong style={styles.strong}> ID: </strong> {order.id}
        </div>
        <div style={styles.card}>
          <strong style={styles.strong}>👤 {t("customer")}:</strong> {order.customer_name}
        </div>
        <div style={styles.card}>
          <strong style={styles.strong}>🛠️ {t("service")}:</strong> {order.service_name}
        </div>
        <div style={styles.card}>
          <strong style={styles.strong}>📌 {t("status")}:</strong> {order.status}
        </div>
        <div style={styles.card}>
          <strong style={styles.strong}>📅 {t("date")}:</strong>{" "}
          {new Date(order.created_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
