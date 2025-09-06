import React, { useEffect, useState } from "react";
import { ApiService } from "../services/ApiService";

const styles = {
  container: {
    padding: "30px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    background: "linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)",
    minHeight: "100vh",
    position: "relative",
    overflow: "hidden",
  },
  pageTitle: {
    marginBottom: "25px",
    fontSize: "2rem",
    fontWeight: "700",
    color: "#222",
    textShadow: "2px 2px 4px rgba(0,0,0,0.05)",
    animation: "fadeInUp 0.8s ease-out",
  },
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    marginBottom: "40px",
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
  cardValue: {
    fontSize: "22px",
    fontWeight: "bold",
    marginTop: "10px",
    color: "#333",
  },
  tablesWrapper: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "25px",
  },
  tableCard: {
    background: "rgba(255,255,255,0.95)",
    borderRadius: "14px",
    padding: "20px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  },
  tableTitle: {
    marginBottom: "15px",
    fontWeight: "600",
    color: "#222",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    borderRadius: "10px",
    overflow: "hidden",
  },
  th: {
    background: "#f0f0f0",
    padding: "12px",
    textAlign: "center",
    fontWeight: "600",
    fontSize: "0.95rem",
    color: "#333",
  },
  td: {
    padding: "10px",
    borderBottom: "1px solid #e0e0e0",
    textAlign: "center",
    color: "#444",
  },
  empty: {
    textAlign: "center",
    padding: "20px",
    color: "#888",
    fontSize: "0.95rem",
  },
  loading: {
    textAlign: "center",
    padding: "60px",
    fontSize: "18px",
    color: "#555",
  },
};

// --- Main Component ---
const Reports = () => {
  const apiService = new ApiService();
  const baseURL = import.meta.env.VITE_API_URL;

  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [ordersRes, invoicesRes, servicesRes] = await Promise.all([
          apiService.get(`/api/admin/orders/`),
          apiService.get(`/api/admin/invoices/`),
          apiService.get(`/api/admin/services/`),
        ]);

        setOrders(ordersRes.data || []);
        setInvoices(invoicesRes.data || []);
        setServices(servicesRes.data || []);
      } catch (err) {
        console.error("Error fetching reports:", err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) return <div style={styles.loading}>⏳ جاري تحميل التقارير...</div>;

  const totalRevenue = invoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
  const completedOrders = orders.filter((o) => o.status === "completed").length;

  return (
    <div style={styles.container} dir="rtl">
      <h1 style={styles.pageTitle}>📊 تقارير النظام</h1>

      <div style={styles.cards}>
        <StatCard title="إجمالي الطلبات" value={orders.length} />
        <StatCard title="الحجوزات المكتملة" value={completedOrders} />
        <StatCard title="إجمالي الإيرادات" value={`${totalRevenue} رس`} />
        <StatCard title="عدد الخدمات" value={services.length} />
      </div>

      <div style={styles.tablesWrapper}>
        <ReportTable
          title="أحدث الطلبات"
          headers={["#", "العميل", "الخدمة", "الحالة"]}
          rows={orders.slice(-5).reverse().map((o) => [
            o.id,
            o.customer_name || "—",
            o.service_title || "—",
            o.status || "—",
          ])}
        />

        <ReportTable
          title="أحدث الفواتير"
          headers={["#", "الطلب", "المبلغ"]}
          rows={invoices.slice(-5).reverse().map((inv) => [
            inv.id,
            inv.order || inv.booking || "—",
            `${inv.amount || 0} رس`,
          ])}
        />
      </div>
    </div>
  );
};

// --- Components ---
const StatCard = ({ title, value }) => (
  <div
    style={styles.card}
    onMouseEnter={(e) => {
      Object.assign(e.currentTarget.style, styles.cardHover);
    }}
    onMouseLeave={(e) => {
      Object.assign(e.currentTarget.style, styles.card);
    }}
  >
    <h3 style={{ margin: 0, color: "#111" }}>{title}</h3>
    <p style={styles.cardValue}>{value}</p>
  </div>
);

const ReportTable = ({ title, headers, rows }) => (
  <div style={styles.tableCard}>
    <h3 style={styles.tableTitle}>{title}</h3>
    <table style={styles.table}>
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th key={i} style={styles.th}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={headers.length} style={styles.empty}>لا توجد بيانات</td>
          </tr>
        ) : (
          rows.map((row, i) => (
            <tr key={i}>
              {row.map((col, j) => (
                <td key={j} style={styles.td}>{col}</td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export default Reports;
