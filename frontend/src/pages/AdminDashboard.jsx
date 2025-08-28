// src/components/AdminDashboardNew.jsx
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { ACCESS_TOKEN } from "../constants";
import "./AdminDashboard.css";

/**
 * AdminDashboardNew
 * لوحة تحكم متكاملة (مع اعتماد نفس الـ API endpoints الموجودين عندك)
 * - يحافظ على نفس أسلوب الجلب في كودك الأصلي (baseURL, headers)
 * - يدعم RTL (dir="rtl")
 */

const AdminDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // token و headers (نفس طريقة كودك)
  const token = localStorage.getItem(ACCESS_TOKEN);
  const baseURL = import.meta.env.VITE_API_URL;
  const headers = { Authorization: `Bearer ${token}` };

  // states
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // جلب البيانات
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          usersRes,
          servicesRes,
          ordersRes,
          reviewsRes,
          ratingsRes,
          invoicesRes,
        ] = await Promise.all([
          api.get(`${baseURL}/admin/users/`, { headers }),
          api.get(`${baseURL}/admin/services/`, { headers }),
          api.get(`${baseURL}/admin/orders/`, { headers }),
          api.get(`${baseURL}/admin/reviews/`, { headers }),
          api.get(`${baseURL}/admin/ratings/`, { headers }),
          api.get(`${baseURL}/admin/invoices/`, { headers }),
        ]);

        setUsers(usersRes.data || []);
        setServices(servicesRes.data || []);
        setOrders(ordersRes.data || []);
        setReviews(reviewsRes.data || []);
        setRatings(ratingsRes.data || []);
        setInvoices(invoicesRes.data || []);
      } catch (err) {
        console.error("Error fetching admin data:", err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="adn-loading" dir="rtl">
        <p>{t ? t("loading") : "جارٍ التحميل..."}</p>
      </div>
    );
  }

  // Derived stats
  const totalUsers = users.length;
  const totalServices = services.length;
  const totalOrders = orders.length;
  const totalInvoices = invoices.length;
  const totalRevenue = invoices.reduce((s, inv) => s + (Number(inv.amount) || 0), 0);

  // Notifications example (من البيانات المتاحة)
  const notifications = [
    ...reviews
      .filter((r) => r.score && Number(r.score) <= 2)
      .slice(-3)
      .map((r) => ({
        id: `rev-${r.id}`,
        title: "تقييم منخفض يحتاج مراجعة",
        desc: r.text ? r.text.substring(0, 80) : "تقييم منخفض من عميل",
        time: "منذ قليل",
        type: "warning",
      })),
    ...orders
      .filter((o) => o.status && o.status.toLowerCase().includes("pending"))
      .slice(-3)
      .map((o) => ({
        id: `ord-${o.id}`,
        title: "طلب في حالة انتظار",
        desc: `الطلب #${o.id} بحالة ${o.status}`,
        time: "ساعة",
        type: "info",
      })),
  ].slice(0, 5);

  // quick stats percentages (حسابات تقريبية)
  const completedRate = orders.length
    ? Math.round((orders.filter((o) => o.status === "completed").length / orders.length) * 100)
    : 0;
  const avgRating =
    ratings.length > 0 ? (ratings.reduce((s, r) => s + (Number(r.value || r.score) || 0), 0) / ratings.length).toFixed(1) : "0.0";
  const uptime = 99.9; // مثال ثابت

  const newestUsers = users.slice(-4).reverse();

  return (
    <div className="adn-root" dir="rtl">
      <Sidebar navigate={navigate} t={t} />
      <div className="adn-main">
        <Header t={t} />
        <div className="adn-content">
          <Hero name={users[0]?.username || "مدير النظام"} t={t} />

          {/* stats cards */}
          <div className="adn-cards">
  <StatCard
    icon="👤"
    title={t ? t("users") : "المستخدمين"}
    value={totalUsers}
    hint="مزودو الخدمة النشطون"
    onClick={() => navigate("/users")}
  />
  <StatCard
    icon="💰"
    title={t ? t("revenue") : "الإيرادات"}
    value={`${totalRevenue} رس`}
    hint="الإيرادات الشهرية"
    onClick={() => navigate("/invoices")}
  />
  <StatCard
    icon="📦"
    title={t ? t("orders") : "الحجوزات"}
    value={totalOrders}
    hint="إجمالي الحجوزات"
    onClick={() => navigate("/orders")}
  />
  <StatCard
    icon="⭐"
    title={t ? t("ratings") : "التقييمات"}
    value={ratings.length}
    hint="إجمالي التقييمات"
    onClick={() => navigate("/ratings")}
  />
</div>


          <div className="adn-grid">
            {/* left column (notifications, quick stats) */}
            <div className="adn-col adn-col-left">
              <Card title="تنبيهات النظام">
                {notifications.length === 0 && <p className="muted">لا توجد تنبيهات الآن</p>}
                {notifications.map((n) => (
                  <div key={n.id} className={`adn-notif ${n.type}`}>
                    <div className="left">
                      <div className="notif-title">{n.title}</div>
                      <div className="notif-desc">{n.desc}</div>
                    </div>
                    <div className="right">
                      <div className="notif-time">{n.time}</div>
                      <button className="btn-action">إجراء</button>
                    </div>
                  </div>
                ))}
              </Card>

              <Card title="إحصائيات سريعة">
                <div className="quick-stat">
                  <div className="qs-row">
                    <div className="qs-label">معدل الحجوزات المكتملة</div>
                    <div className="qs-value">{completedRate}%</div>
                  </div>
                  <div className="progress"><div className="progress-bar" style={{ width: `${completedRate}%` }} /></div>

                  <div className="qs-row">
                    <div className="qs-label">رضا العملاء</div>
                    <div className="qs-value">{avgRating}/5</div>
                  </div>
                  <div className="progress"><div className="progress-bar" style={{ width: `${Math.min((avgRating/5)*100,100)}%` }} /></div>

                  <div className="qs-row">
                    <div className="qs-label">استقرار النظام</div>
                    <div className="qs-value">{uptime}%</div>
                  </div>
                  <div className="progress"><div className="progress-bar" style={{ width: `${uptime}%` }} /></div>
                </div>
              </Card>
            </div>

            {/* right column (new users + quick table) */}
            <div className="adn-col adn-col-right">
              <Card title="المستخدمون الجدد">
                <ul className="new-users">
                  {newestUsers.length === 0 && <li className="muted">لا يوجد مستخدمين جدد</li>}
                  {newestUsers.map((u) => (
                    <li key={u.id} className="nu-item">
                      <div className="nu-avatar">{(u.username || "U").charAt(0).toUpperCase()}</div>
                      <div className="nu-info">
                        <div className="nu-name">{u.username || u.email || `user${u.id}`}</div>
                        <div className="nu-role">{u.role || "مستخدم"}</div>
                      </div>
                      <div className="nu-action">
                        <button onClick={() => navigate(`/users/${u.id}`)}>عرض</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card title="موجز النظام">
                <div className="summary-grid">
                  <div className="sum-item">
                    <div className="sum-label">إجمالي الفواتير</div>
                    <div className="sum-value">{totalInvoices}</div>
                  </div>
                  <div className="sum-item">
                    <div className="sum-label">إجمالي الخدمات</div>
                    <div className="sum-value">{totalServices}</div>
                  </div>
                  <div className="sum-item">
                    <div className="sum-label">إجمالي المستخدمين</div>
                    <div className="sum-value">{totalUsers}</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* bottom area: quick tables (عرض مختصر للبيانات) */}
          <div className="adn-bottom">
            <Card title="أحدث الحجوزات">
              <table className="mini-table">
                <thead>
                  <tr><th>#</th><th>العميل</th><th>الخدمة</th><th>الحالة</th></tr>
                </thead>
                <tbody>
                  {orders.slice(-6).reverse().map((o) => (
                    <tr key={o.id} onClick={() => navigate(`/orders/${o.id}`)} className="clickable">
                      <td>{o.id}</td>
                      <td>{o.customer_name || o.customer || (o.user && o.user.username) || "—"}</td>
                      <td>{o.service_title || o.service || "—"}</td>
                      <td>{o.status || "—"}</td>
                    </tr>
                  ))}
                  {orders.length === 0 && <tr><td colSpan="4" className="muted">لا توجد حجوزات</td></tr>}
                </tbody>
              </table>
            </Card>

            <Card title="أحدث الفواتير">
              <table className="mini-table">
                <thead><tr><th>#</th><th>الأمر</th><th>المبلغ</th></tr></thead>
                <tbody>
                  {invoices.slice(-6).reverse().map((inv) => (
                    <tr key={inv.id} onClick={() => navigate(`/invoices/${inv.id}`)} className="clickable">
                      <td>{inv.id}</td>
                      <td>#{inv.booking || inv.order || "—"}</td>
                      <td>{inv.amount || "0"}</td>
                    </tr>
                  ))}
                  {invoices.length === 0 && <tr><td colSpan="3" className="muted">لا توجد فواتير</td></tr>}
                </tbody>
              </table>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------------------- Subcomponents ---------------------- */

const Header = ({ t }) => (
  <header className="adn-header">
    <div className="header-left">
      <button className="btn-ghost">☰</button>
      <div className="search-wrapper">
        <input placeholder={t ? t("searchPlaceholder") : "البحث في النظام..."} />
      </div>
    </div>

    <div className="header-right">
      <div className="lang-switch">English</div>
      <button className="notif-btn">🔔<span className="badge">2</span></button>
      <div className="profile">
        <div className="profile-avatar">R</div>
        <div className="profile-info">
          <div className="p-name">rewan</div>
          <div className="p-role">مشرف النظام</div>
        </div>
      </div>
    </div>
  </header>
);

const Sidebar = ({ navigate, t }) => (
  <aside className="adn-sidebar">
    <div className="brand">
      <div className="brand-circle">R</div>
      <div className="brand-text">إدارة النظام</div>
    </div>
    <nav className="side-nav">
      <button
        onClick={() => navigate("/admin")}
        className="side-item clickable"
      >
        🏠 لوحة التحكم
      </button>
      <button
        onClick={() => navigate("/users")}
        className="side-item clickable"
      >
        👤 إدارة المستخدمين
      </button>
      <button
        onClick={() => navigate("/orders")}
        className="side-item clickable"
      >
        📦 إدارة الحجوزات
      </button>
      <button
        onClick={() => navigate("/services")}
        className="side-item clickable"
      >
        🛠️ إدارة الخدمات
      </button>
      <button
        onClick={() => navigate("/reports")}
        className="side-item clickable"
      >
        📊 التقارير
      </button>
      <button
        onClick={() => navigate("/settings")}
        className="side-item clickable"
      >
        ⚙️ إعدادات النظام
      </button>
    </nav>
    <div className="sidebar-footer">© {new Date().getFullYear()} خدماتك</div>
  </aside>
);


const Hero = ({ name, t }) => (
  <div className="adn-hero">
    <div className="hero-left">
      <h1>مرحبًا، <span>{name}</span></h1>
      <p>لوحة تحكم النظام والإحصائيات العامة</p>
    </div>
    <div className="hero-right">
      <button className="btn-primary">إدارة النظام</button>
    </div>
  </div>
);

const StatCard = ({ icon, title, value, hint, onClick }) => (
  <div className="stat-card clickable" onClick={onClick}>
    <div className="sc-icon">{icon}</div>
    <div className="sc-body">
      <div className="sc-title">{title}</div>
      <div className="sc-value">{value}</div>
      <div className="sc-hint">{hint}</div>
    </div>
  </div>
);


const Card = ({ title, children }) => (
  <div className="adn-card">
    <div className="adn-card-header">
      <h3>{title}</h3>
    </div>
    <div className="adn-card-body">{children}</div>
  </div>
);

export default AdminDashboard;

