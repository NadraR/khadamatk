import React from "react";

const Electricians = () => {
  const services = [
    { id: 1, name: "تركيب لمبات", desc: "تركيب جميع أنواع اللمبات والكشافات", status: "متاح" },
    { id: 2, name: "تركيب تكييفات", desc: "خدمة تركيب وصيانة التكييفات", status: "متاح" },
    { id: 3, name: "صيانة كهرباء", desc: "إصلاح وصيانة اللوحات الكهربائية", status: "غير متاح" },
  ];

  const styles = {
    container: {
      minHeight: "100vh",
      padding: "30px 20px",
      background: "#f5f5f5",
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
    header: { textAlign: "center", marginBottom: "25px", color: "#222" },
    tableWrapper: { overflowX: "auto" },
    table: { width: "100%", borderCollapse: "collapse", fontSize: "0.95rem" },
    th: {
      padding: "12px",
      background: "#eee",
      textAlign: "center",
      fontWeight: "600",
      borderBottom: "2px solid #ddd",
    },
    td: { padding: "12px", textAlign: "center", borderBottom: "1px solid #ddd" },
    rowHover: { transition: "background 0.2s" },
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
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <div style={styles.header}>
          <h1>⚡ خدمات الكهربائيين</h1>
          <p>قائمة بالخدمات المتاحة</p>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>الخدمة</th>
                <th style={styles.th}>الوصف</th>
                <th style={styles.th}>الحالة</th>
                <th style={styles.th}>إجراء</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr
                  key={s.id}
                  style={styles.rowHover}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f9f9f9")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={styles.td}>{s.id}</td>
                  <td style={styles.td}>{s.name}</td>
                  <td style={styles.td}>{s.desc}</td>
                  <td style={styles.td}>{s.status === "متاح" ? "✅" : "❌"}</td>
                  <td style={styles.td}>
                    <button style={styles.button}>طلب الخدمة</button>
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

export default Electricians;
