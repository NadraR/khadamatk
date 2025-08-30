import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../api";
import { ACCESS_TOKEN } from "../constants";
import { FaUsers, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const Users = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const token = localStorage.getItem(ACCESS_TOKEN);
  const headers = { Authorization: `Bearer ${token}` };

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/admin/users/", { headers });
        setUsers(res.data || []);
      } catch (err) {
        console.error("Error fetching users:", err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [token]);

  if (loading) {
    return (
      <p style={{ textAlign: "center", marginTop: "50px" }}>
        {t("loading") || "جارٍ التحميل..."}
      </p>
    );
  }

  const styles = {
    container: {
      minHeight: "100vh",
      padding: "30px 20px",
      background: "#f5f5f5",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      direction: "rtl",
    },
    box: {
      width: "100%",
      maxWidth: "900px",
      background: "#fff",
      borderRadius: "16px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
      padding: "30px",
    },
    header: {
      textAlign: "center",
      marginBottom: "25px",
      color: "#222",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
    },
    slogan: {
      color: "#555",
      fontSize: "1rem",
      marginTop: "5px",
    },
    tableWrapper: {
      overflowX: "auto",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: "0.95rem",
    },
    th: {
      padding: "12px",
      background: "#eee",
      textAlign: "center",
      fontWeight: "600",
      borderBottom: "2px solid #ddd",
    },
    td: {
      padding: "12px",
      textAlign: "center",
      borderBottom: "1px solid #ddd",
    },
    rowHover: {
      transition: "background 0.2s",
    },
    button: {
      padding: "6px 14px",
      fontSize: "0.9rem",
      backgroundColor: "#333",
      color: "#fff",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      transition: "all 0.2s",
    },
    buttonHover: {
      backgroundColor: "#555",
      transform: "scale(1.05)",
      cursor: "pointer",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <div style={styles.header}>
          <FaUsers style={{fontSize:"35px"}} />
          <h1>{t("users") || "المستخدمين"}</h1>
        </div>
        <p style={styles.slogan}>عرض وإدارة جميع المستخدمين</p>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>الاسم</th>
                <th style={styles.th}>البريد</th>
                <th style={styles.th}>الحالة</th>
                <th style={styles.th}>الدور</th>
                <th style={styles.th}>إجراء</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ ...styles.td, color: "#777" }}>
                    لا يوجد مستخدمين
                  </td>
                </tr>
              )}
              {users.map((u) => (
                <tr
                  key={u.id}
                  style={styles.rowHover}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f9f9f9")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td style={styles.td}>{u.id}</td>
                  <td style={styles.td}>{u.username || "—"}</td>
                  <td style={styles.td}>{u.email || "—"}</td>
                  <td style={styles.td}>
                    {u.is_active ? (
                      <>
                        <FaCheckCircle style={{ color: "green" }} /> نشط
                      </>
                    ) : (
                      <>
                        <FaTimesCircle style={{ color: "red" }} /> غير نشط
                      </>
                    )}
                  </td>
                  <td style={styles.td}>{u.role || "غير محدد"}</td>
                  <td style={styles.td}>
                    <button
                      style={{ ...styles.button, ...styles.buttonHover }}
                      onClick={() => navigate(`/users/${u.id}`)}
                    >
                      عرض
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;
