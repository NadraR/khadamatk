import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Paper,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import {
  People as PeopleIcon,
  Build as ServicesIcon,
  ShoppingCart as OrdersIcon,
  RateReview as ReviewsIcon,
  Assignment as AssignmentIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CancelIcon from "@mui/icons-material/Cancel";
import { adminApiService } from "../../services/adminApiService";

// إعداد الكروت
const statsConfig = [
  { key: "users_count", title: "المستخدمين", icon: <PeopleIcon sx={{ fontSize: 28 }} />, color: "#3B82F6" },
  { key: "services_count", title: "الخدمات", icon: <ServicesIcon sx={{ fontSize: 28 }} />, color: "#06B6D4" },
  { key: "orders_count", title: "الطلبات", icon: <OrdersIcon sx={{ fontSize: 28 }} />, color: "#10B981" },
  { key: "bookings_count", title: "الحجوزات", icon: <AssignmentIcon sx={{ fontSize: 28 }} />, color: "#e67e22" },
  { key: "reviews_count", title: "المراجعات", icon: <ReviewsIcon sx={{ fontSize: 28 }} />, color: "#F59E0B" },
  { key: "invoices_count", title: "الفواتير", icon: <ReceiptIcon sx={{ fontSize: 28 }} />, color: "#c0392b" },
  { key: "avg_rating", title: "متوسط التقييم", icon: <TrendingUpIcon sx={{ fontSize: 28 }} />, color: "#2980b9", suffix: "⭐" },
];

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { stats, trend, recent } = await adminApiService.getDashboardData();
        setStats(stats || {});
        setChartData(trend || []);
        setRecentOrders(recent || []);
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 4, backgroundColor: "#f3f4f6" }}>
      {/* Cards */}
      <Grid container spacing={3} mb={5}>
        {statsConfig.map((item) => (
          <Grid xs={12} sm={6} md={4} lg={2.4} key={item.key}>
            <Card
              sx={{
                borderRadius: 4,
                overflow: "visible",
                backgroundColor: "#fff",
                boxShadow: "0 8px 30px rgba(0,0,0,0.07)",
                transition: "0.4s",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
                },
              }}
            >
              {/* Gradient Top */}
              <Box sx={{ height: 8, background: `linear-gradient(90deg, ${item.color} 0%, ${item.color}80 100%)` }} />
              <CardContent sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: `radial-gradient(circle at 30% 30%, ${item.color}40, ${item.color}10)`,
                    boxShadow: `0 0 20px ${item.color}55, 0 4px 10px ${item.color}33 inset`,
                    color: "#fff",
                    fontSize: 28,
                  }}
                >
                  {item.icon}
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#374151" }}>{item.title}</Typography>
                  {loading ? (
                    <CircularProgress size={18} sx={{ mt: 1 }} />
                  ) : (
                    <Typography variant="h5" sx={{ fontWeight: 800, color: "#111827", mt: 0.5 }}>
                      {stats[item.key] ?? 0} {item.suffix || ""}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Chart */}
      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 5, borderRadius: 4, boxShadow: "0 12px 36px rgba(0,0,0,0.06)", background: "#fff", overflow: "visible" }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>إحصائيات الطلبات والخدمات</Typography>
        <Divider sx={{ mb: 2 }} />
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : chartData.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6, color: "#6b7280" }}>
            <Typography variant="body1">لا توجد بيانات للعرض حالياً 📊</Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(300, chartData.length * 50)}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="4 4" stroke="#e0e0e0" />
              <XAxis dataKey="name" tick={{ fill: "#374151", fontWeight: 600 }} />
              <YAxis tick={{ fill: "#374151", fontWeight: 600 }} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
              <Line type="monotone" dataKey="orders" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="services" stroke="#06B6D4" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Paper>

      {/* Recent Orders */}
      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 5, borderRadius: 4, boxShadow: "0 12px 36px rgba(0,0,0,0.06)", background: "#fff", overflow: "visible" }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>آخر الطلبات</Typography>
        <Divider sx={{ mb: 2 }} />
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table size="small" sx={{ borderRadius: 2, overflow: "visible" }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                <TableCell sx={{ fontWeight: 700 }}>المستخدم</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>الخدمة</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">الحالة</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentOrders.map((order, index) => (
                <TableRow key={order.id} sx={{ backgroundColor: index % 2 === 0 ? "#fafafa" : "white", "&:hover": { backgroundColor: "#f3f4f6" } }}>
                  <TableCell>{order.user}</TableCell>
                  <TableCell>{order.service}</TableCell>
                  <TableCell align="right">
                    <Chip
                      icon={order.status === "مكتمل" ? <CheckCircleIcon fontSize="small" /> : order.status === "قيد التنفيذ" ? <HourglassEmptyIcon fontSize="small" /> : <CancelIcon fontSize="small" />}
                      label={order.status}
                      color={order.status === "مكتمل" ? "success" : order.status === "قيد التنفيذ" ? "warning" : "error"}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
};

export default AdminDashboard;
