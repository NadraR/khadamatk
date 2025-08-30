import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import { ACCESS_TOKEN } from "../constants";
import { FaUser, FaEnvelope, FaCheckCircle, FaTimesCircle, FaIdBadge, FaShieldAlt } from "react-icons/fa";

const UserDetails = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const token = localStorage.getItem(ACCESS_TOKEN);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(`/admin/users/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, [id, token]);

  if (!user)
    return (
      <p style={{ textAlign: "center", marginTop: "50px" }}>Loading...</p>
    );

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
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
    },
    stats: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
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
      gap: "8px",
    },
    strong: {
      marginRight: "10px",
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>
        <FaUser /> تفاصيل المستخدم
      </h1>

      <div style={styles.stats}>
        <div style={styles.card}>
          <FaIdBadge />
          <strong style={styles.strong}>ID:</strong> {user.id}
        </div>
        <div style={styles.card}>
          <FaUser />
          <strong style={styles.strong}>اسم المستخدم:</strong> {user.username}
        </div>
        <div style={styles.card}>
          <FaEnvelope />
          <strong style={styles.strong}>البريد:</strong> {user.email}
        </div>
        <div style={styles.card}>
          <FaShieldAlt />
          <strong style={styles.strong}>الحالة:</strong>{" "}
          {user.is_active ? (
            <>
              <FaCheckCircle style={{ color: "green" }} /> نشط
            </>
          ) : (
            <>
              <FaTimesCircle style={{ color: "red" }} /> غير نشط
            </>
          )}
        </div>
        <div style={styles.card}>
          <FaShieldAlt />
          <strong style={styles.strong}>الدور:</strong> {user.role || "غير محدد"}
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
