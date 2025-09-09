import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  LinearProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Download as DownloadIcon,
  Star as StarIcon,
  DollarSign as DollarIcon,
  Calendar as CalendarIcon,
  Home as HomeIcon,
  Wrench as BuildIcon,
  Users as UsersIcon,
  TrendingUp as TrendingUpIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { dashboardApi } from '../../services/adminApiService';
import GrowthChart from '../../components/admin/GrowthChart';
import FinancialStats from '../../components/admin/FinancialStats';
import './AdminDashboard.css';

// Mock data
const mockBookings = [
  {
    id: '1',
    clientName: 'أحمد محمد',
    service: 'إصلاح سباكة',
    status: 'completed',
    price: 150
  },
  {
    id: '2',
    clientName: 'سارة أحمد',
    service: 'تركيب كهرباء',
    status: 'pending',
    price: 200
  },
  {
    id: '3',
    clientName: 'فاطمة علي',
    service: 'إصلاح أثاث',
    status: 'confirmed',
    price: 120
  }
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const statsResponse = await dashboardApi.getStats();
        if (statsResponse.success) {
          setStats(statsResponse.data);
        } else {
          setError(statsResponse.error);
        }

        const ordersResponse = await dashboardApi.getRecentOrders();
        if (ordersResponse.success) {
          setRecentOrders(ordersResponse.data);
        } else {
          setError(ordersResponse.error);
        }
      } catch (err) {
        setError('خطأ في تحميل البيانات');
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const calculateGrowthRate = () => {
    if (!stats) return 0;
    return Math.round((stats.bookings_count / Math.max(stats.users_count, 1)) * 10);
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      pending: { color: 'black', backgroundColor: '#FFF3E0', label: 'قيد الانتظار' },
      confirmed: { color: 'black', backgroundColor: '#E3F2FD', label: 'مؤكد' },
      completed: { color: 'black', backgroundColor: '#E8F5E8', label: 'مكتمل' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Chip
        label={config.label}
        sx={{
          backgroundColor: config.backgroundColor,
          color: config.color,
          fontWeight: 500,
          fontSize: '0.75rem',
          height: '24px',
          '& .MuiChip-label': { px: 1.5 }
        }}
      />
    );
  };

  const handleExportReport = () => {
    const reportData = {
      stats: stats,
      recentOrders: recentOrders,
      generatedAt: new Date().toLocaleString('ar-SA')
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `admin-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setError('تم تصدير التقرير بنجاح');
    setSnackbarOpen(true);
  };

  const StatCard = ({ title, value, icon, iconColor, subtitle }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card
        sx={{
          height: '100%',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,123,255,0.08)',
          border: '1px solid rgba(0,123,255,0.1)',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(249,251,255,0.9) 100%)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <CardContent sx={{ p: 2, textAlign: 'center' }}>
          <Box sx={{ mb: 1, display: 'flex', justifyContent: 'center' }}>
            {React.cloneElement(icon, { size: 20, color: iconColor })}
          </Box>
          <Typography variant="h4" component="div" sx={{ fontWeight: 500, color: '#666666', fontSize: '1.2rem', mb: 0.5 }}>
            {value}
          </Typography>
          <Typography variant="body2" sx={{ color: '#666666', fontSize: '0.9rem', fontWeight: 500 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ color: '#666666', fontSize: '0.8rem' }}>
              {subtitle}
            </Typography>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f9fbff', direction: 'rtl' }}>
        <Box sx={{ width: '80%', maxWidth: 400 }}>
          <LinearProgress />
          <Typography variant="h6" sx={{ mt: 2, textAlign: 'center', color: '#666666', textTransform: 'none' }}>
            جاري تحميل البيانات...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f9fbff', direction: 'rtl' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => window.location.reload()} sx={{ textTransform: 'none' }}>
          إعادة المحاولة
        </Button>
      </Box>
    );
  }

  return (
    <>
      <Box
        className="admin-dashboard-container"
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(180deg, #f9fbff 0%, #ffffff 100%)',
          direction: 'rtl',
          overflowX: 'hidden',
          overflowY: 'auto',
          maxWidth: '1200px',
          width: '100%',
          px: { xs: 1, sm: 2 },
          py: { xs: 2, sm: 3, md: 4 },
          mx: 'auto',
          boxSizing: 'border-box',
          scrollBehavior: 'smooth',
          scrollbarWidth: 'none', // Firefox
          '&::-webkit-scrollbar': { display: 'none' } // Chrome & Safari
        }}
      >

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            maxWidth: '1200px',
            width: '100%',
            mb: 4,
            boxSizing: 'border-box'
          }}
        >
 {/* Statistics + Action Buttons */}
<Grid container spacing={2} sx={{ mt: 2 }}>
  <Grid item xs={12}>
    <Grid 
      container 
      spacing={2} 
      sx={{ 
        display: 'flex', 
        alignItems: 'stretch', 
        justifyContent: 'space-between', 
        flexWrap: 'wrap'  // يسمح بالانتقال للسطر التالي على الشاشات الصغيرة
      }}
    >
      {/* الزرارين */}
      <Grid item xs={12} sm={6} md={2}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => navigate('/admin/settings')}
            sx={{
              borderRadius: '8px',
              borderColor: '#E0E0E0',
              color: 'black',
              textTransform: 'none',
              fontWeight: 500,
              px: 2,
              py: 0.8,
              fontSize: '0.85rem',
              '&:hover': {
                borderColor: '#0077ff',
                color: '#0077ff',
                backgroundColor: 'rgba(0, 119, 255, 0.05)'
              }
            }}
          >
            الإعدادات
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportReport}
            sx={{
              borderRadius: '8px',
              borderColor: '#E0E0E0',
              color: 'black',
              textTransform: 'none',
              fontWeight: 500,
              px: 2,
              py: 0.8,
              fontSize: '0.85rem',
              '&:hover': {
                borderColor: '#10b981',
                color: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.05)'
              }
            }}
          >
            تصدير التقرير
          </Button>
        </Box>
      </Grid>

      {/* كروت الـ Stats */}
      <Grid item xs={12} sm={6} md={2}>
        <StatCard
          title="متوسط التقييم"
          value={stats?.avg_rating?.toFixed(1) || '0.0'}
          icon={<StarIcon />}
          iconColor="#f97316"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={2}>
        <StatCard
          title="إجمالي الفواتير"
          value={stats?.invoices_count?.toLocaleString() || '0'}
          icon={<DollarIcon />}
          iconColor="#ef4444"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={2}>
        <StatCard
          title="إجمالي الحجوزات"
          value={stats?.bookings_count?.toLocaleString() || '0'}
          icon={<CalendarIcon />}
          iconColor="#f59e0b"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={2}>
        <StatCard
          title="العملاء"
          value={stats?.users_count?.toLocaleString() || '0'}
          icon={<HomeIcon />}
          iconColor="#10b981"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={2}>
        <StatCard
          title="الخدمات"
          value={stats?.services_count?.toLocaleString() || '0'}
          icon={<BuildIcon />}
          iconColor="#3b82f6"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={2}>
        <StatCard
          title="الطلبات"
          value={stats?.orders_count?.toLocaleString() || '0'}
          icon={<UsersIcon />}
          iconColor="#0077ff"
        />
      </Grid>
    </Grid>
  </Grid>
</Grid>





          {/* Chart + System Status + Financial Stats */}
<Grid 
  container 
  spacing={4} 
  sx={{ 
    flexWrap: 'nowrap', // مهم: يمنع إنهم ينزلوا تحت
    overflowX: 'auto', // يسمح بتصغير العرض مع سكرول لو الشاشة صغيرة جداً
    '&::-webkit-scrollbar': { display: 'none' } // يخفي الاسكرول
  }}
>
  {/* Chart */}
  <Grid item xs={12} sm={8} md={8} sx={{ flexShrink: 0 }}>
    <GrowthChart />
  </Grid>

  {/* System Status + Growth + Financial Stats */}
  <Grid item xs={12} sm={4} md={4} sx={{ flexShrink: 1 }}>
    {/* حالة النظام */}
    {/* حالة النظام */}
<Card sx={{ p: 1.5, mb: 2 }}>
  <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600, color: '#666666' }}>
    حالة النظام
  </Typography>
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, alignItems: 'flex-start' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', p: 1.5, border: '1px solid #ddd', borderRadius: '8px' }}>
      <Typography sx={{ fontWeight: 600, color: '#666666' }}>الخدمات النشطة</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <Typography sx={{ fontWeight: 600, color: '#666666' }}>{stats?.services_count || 0}</Typography>
        <Typography sx={{ fontSize: '0.85rem', color: 'gray' }}>ر.س</Typography>
      </Box>
    </Box>

    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', p: 1.5, border: '1px solid #ddd', borderRadius: '8px' }}>
      <Typography sx={{ fontWeight: 600, color: '#666666' }}>الحجوزات المعلقة</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <Typography sx={{ fontWeight: 600, color: '#666666' }}>{stats?.bookings_status?.pending || 0}</Typography>
        <Typography sx={{ fontSize: '0.85rem', color: 'gray' }}>ر.س</Typography>
      </Box>
    </Box>
  </Box>
</Card>


    {/* معدل النمو + الاحصائيات المالية */}
    <Grid container spacing={2}>
      <Grid item xs={6}>
        {/* <Card sx={{ p: 1.5, height: '100%' }}>
          <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600 }}>
            معدل النمو
          </Typography>
          <Typography sx={{ fontWeight: 600, textAlign: 'center', fontSize: '1.2rem' }}>
            +{calculateGrowthRate()}%
          </Typography>
        </Card> */}
      </Grid>
      <Grid item xs={6}>
        <FinancialStats />
      </Grid>
    </Grid>
  </Grid>
</Grid>


          {/* Recent Bookings */}
<Card sx={{ width: '100%', p: 1.5 }}>
  <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600, color: '#666666' }}>
    الحجوزات الأخيرة
  </Typography>
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
    {recentOrders.length > 0 ? (
      recentOrders.map((order) => (
        <Box
          key={order.id}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 1.5,
            border: '1px solid #ddd',
            borderRadius: '8px',
            width: '100%'
          }}
        >
          {/* الخدمة + اسم العميل */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography sx={{ fontWeight: 600, color: '#666666' }}>{order.service || 'خدمة غير محددة'}</Typography>
            <Typography sx={{ fontSize: '0.9rem', color: '#666666' }}>{order.user || 'مستخدم غير محدد'}</Typography>
          </Box>
          {/* الحالة */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {getStatusChip(order.status)}
          </Box>
        </Box>
      ))
    ) : (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <Typography sx={{ color: '#666666' }}>لا توجد طلبات حديثة</Typography>
      </Box>
    )}
  </Box>
</Card>

</Box>
      </Box>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbarOpen(false)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
}