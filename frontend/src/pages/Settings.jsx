import React, { useState } from "react";
import { FaCog, FaSave } from "react-icons/fa";

// --- Internal Styles ---
const styles = {
  container: {
    padding: "30px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    background: "linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)",
    minHeight: "100vh",
  },
  pageTitle: {
    marginBottom: "25px",
    fontSize: "2rem",
    fontWeight: "700",
    color: "#222",
    textShadow: "2px 2px 4px rgba(0,0,0,0.05)",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "25px",
  },
  card: {
    background: "rgba(255,255,255,0.95)",
    borderRadius: "14px",
    padding: "20px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  },
  cardHover: {
    transform: "translateY(-5px)",
    boxShadow: "0 12px 25px rgba(0,0,0,0.15)",
  },
  cardTitle: {
    fontWeight: "600",
    marginBottom: "15px",
    color: "#111",
  },
  field: {
    marginBottom: "15px",
    display: "flex",
    flexDirection: "column",
  },
  label: {
    marginBottom: "5px",
    fontWeight: "500",
    color: "#333",
  },
  input: {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "0.95rem",
    outline: "none",
    transition: "border 0.2s ease",
  },
  inputFocus: {
    border: "1px solid #666",
  },
  select: {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "0.95rem",
  },
  button: {
    marginTop: "20px",
    padding: "12px 20px",
    border: "none",
    borderRadius: "10px",
    background: "#333",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
    transition: "background 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  buttonHover: {
    background: "#000",
  },
};

// --- Component ---
const Settings = () => {
  const [form, setForm] = useState({
    systemName: "خدماتك",
    email: "admin@example.com",
    password: "",
    language: "ar",
    theme: "light",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    alert("✅ تم حفظ الإعدادات بنجاح!");
    console.log(form);
  };

  return (
    <div style={styles.container} dir="rtl">
      <h1 style={styles.pageTitle}>
        <FaCog /> إعدادات النظام
      </h1>

      <form onSubmit={handleSave}>
        <div style={styles.grid}>
          {/* بطاقة المعلومات العامة */}
          <div
            style={styles.card}
            onMouseEnter={(e) =>
              Object.assign(e.currentTarget.style, styles.cardHover)
            }
            onMouseLeave={(e) =>
              Object.assign(e.currentTarget.style, styles.card)
            }
          >
            <h3 style={styles.cardTitle}>المعلومات العامة</h3>
            <div style={styles.field}>
              <label style={styles.label}>اسم النظام</label>
              <input
                style={styles.input}
                name="systemName"
                value={form.systemName}
                onChange={handleChange}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>البريد الإلكتروني</label>
              <input
                type="email"
                style={styles.input}
                name="email"
                value={form.email}
                onChange={handleChange}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>كلمة المرور</label>
              <input
                type="password"
                style={styles.input}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* بطاقة إعدادات الواجهة */}
          <div
            style={styles.card}
            onMouseEnter={(e) =>
              Object.assign(e.currentTarget.style, styles.cardHover)
            }
            onMouseLeave={(e) =>
              Object.assign(e.currentTarget.style, styles.card)
            }
          >
            <h3 style={styles.cardTitle}>إعدادات الواجهة</h3>
            <div style={styles.field}>
              <label style={styles.label}>اللغة</label>
              <select
                style={styles.select}
                name="language"
                value={form.language}
                onChange={handleChange}
              >
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>الثيم</label>
              <select
                style={styles.select}
                name="theme"
                value={form.theme}
                onChange={handleChange}
              >
                <option value="light">فاتح</option>
                <option value="dark">غامق</option>
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          style={styles.button}
          onMouseEnter={(e) =>
            Object.assign(e.currentTarget.style, styles.buttonHover)
          }
          onMouseLeave={(e) =>
            Object.assign(e.currentTarget.style, styles.button)
          }
        >
          <FaSave /> حفظ التغييرات
        </button>
      </form>
    </div>
  );
};

export default Settings;
