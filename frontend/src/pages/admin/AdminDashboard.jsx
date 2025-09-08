import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  LinearProgress
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
  const [loading, setLoading] = useState(true);

  const mockStats = {
    averageRating: 4.7,
    monthlyRevenue: 15600,
    totalBookings: 3450,
    totalClients: 794,
    totalProviders: 456,
    totalUsers: 1250,
    activeServices: 8,
    pendingBookings: 23,
    growthRate: 15
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoading(false);
    };

    fetchDashboardData();
  }, []);


  const getStatusChip = (status) => {
    const statusConfig = {
      pending: { 
        color: '#FF9800', 
        backgroundColor: '#FFF3E0', 
        label: 'قيد الانتظار' 
      },
      confirmed: { 
        color: '#1976D2', 
        backgroundColor: '#E3F2FD', 
        label: 'مؤكد' 
      },
      completed: { 
        color: '#4CAF50', 
        backgroundColor: '#E8F5E8', 
        label: 'مكتمل' 
      }
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
          '& .MuiChip-label': {
            px: 1.5
          }
        }}
      />
    );
  };

  const StatCard = ({ title, value, icon, iconColor, subtitle }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
       <Card sx={{ 
         height: '100%',
         borderRadius: '12px',
         boxShadow: '0 2px 8px rgba(0,123,255,0.08)',
         border: '1px solid rgba(0,123,255,0.1)',
         background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(249,251,255,0.9) 100%)',
         backdropFilter: 'blur(10px)'
       }}>
        <CardContent sx={{ p: 2, textAlign: 'center' }}>
          <Box sx={{ mb: 1, display: 'flex', justifyContent: 'center' }}>
            {React.cloneElement(icon, { 
              size: 20, 
              color: iconColor,
              className: 'mx-auto mb-1'
            })}
          </Box>
          <Typography variant="h4" component="div" sx={{ 
            fontWeight: 500,
            color: '#333',
            fontSize: '1.2rem',
            mb: 0.5
          }}>
            {value}
          </Typography>
          <Typography variant="body2" sx={{ 
            color: '#666',
            fontSize: '0.9rem',
            fontWeight: 500
          }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ 
              color: '#999',
              fontSize: '0.8rem'
            }}>
              {subtitle}
            </Typography>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  if (loading) {
      return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Box sx={{ width: '100%' }}>
          <LinearProgress />
          <Typography variant="h6" sx={{ textAlign: 'center', mt: 2 }}>
            جاري تحميل البيانات...
          </Typography>
        </Box>
      </Box>
      );
    }

  return (
      <Box className="admin-dashboard-container" sx={{ 
        minHeight: '100vh', 
        maxHeight: '100vh',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #f9fbff 0%, #ffffff 100%)',
        direction: 'rtl'
      }}>

      {/* Main Content */}
      <Box sx={{ 
        p: { xs: 1, sm: 1.5, md: 2 },
        maxWidth: '100%',
        width: '100%',
        height: '100%',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}>

        {/* Action Buttons */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          justifyContent: 'center',
          width: '100%',
          flexShrink: 0
        }}>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
                sx={{
              borderRadius: '8px',
              borderColor: '#E0E0E0',
              color: '#333',
              textTransform: 'none',
              fontWeight: 500,
              px: 3,
              py: 1
            }}
          >
            الإعدادات
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
                  sx={{
              borderRadius: '8px',
              borderColor: '#E0E0E0',
              color: '#333',
              textTransform: 'none',
              fontWeight: 500,
              px: 3,
              py: 1
            }}
          >
            تصدير التقرير
          </Button>
                </Box>

        {/* Statistics Cards */}
        <Grid container spacing={1} sx={{ justifyContent: 'center', maxWidth: '100%', mx: 'auto', flexShrink: 0 }}>
          <Grid item xs={12} sm={6} md={2}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <StatCard
                className='stat-card'
                title="متوسط التقييم"
                value={mockStats.averageRating}
                 icon={<StarIcon />}
                 iconColor="#f97316"
              />
            </motion.div>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <StatCard
                className='stat-card'
                title="الإيرادات الشهرية"
                value={mockStats.monthlyRevenue.toLocaleString()}
                 icon={<DollarIcon />}
                 iconColor="#ef4444"
              />
            </motion.div>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <StatCard
                className='stat-card'
                title="إجمالي الحجوزات"
                value={mockStats.totalBookings.toLocaleString()}
                 icon={<CalendarIcon />}
                 iconColor="#f59e0b"
              />
            </motion.div>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <StatCard
                className='stat-card'
                title="العملاء"
                value={mockStats.totalClients}
                 icon={<HomeIcon />}
                 iconColor="#10b981"
              />
            </motion.div>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <StatCard
                className='stat-card'
                title="مزودو الخدمات"
                value={mockStats.totalProviders}
                 icon={<BuildIcon />}
                 iconColor="#3b82f6"
              />
            </motion.div>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <StatCard
                className='stat-card'
                title="إجمالي المستخدمين"
                value={mockStats.totalUsers.toLocaleString()}
                 icon={<UsersIcon />}
                 iconColor="#0077ff"
              />
            </motion.div>
            </Grid>
        </Grid>

         {/* System Status */}
         <Card sx={{ width: '100%', p: 1.5 }}>
  <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600 }}>
    حالة النظام
  </Typography>
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, border: '1px solid #ddd', borderRadius: '8px' }}>
      <Typography sx={{ fontWeight: 600 }}>الخدمات النشطة</Typography>
      <Typography sx={{ fontWeight: 600 }}>{mockStats.activeServices}</Typography>
    </Box>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, border: '1px solid #ddd', borderRadius: '8px' }}>
      <Typography sx={{ fontWeight: 600 }}>الحجوزات المعلقة</Typography>
      <Typography sx={{ fontWeight: 600 }}>{mockStats.pendingBookings}</Typography>
    </Box>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, border: '1px solid #ddd', borderRadius: '8px' }}>
      <Typography sx={{ fontWeight: 600 }}>معدل النمو</Typography>
      <Typography sx={{ fontWeight: 600 }}>+{mockStats.growthRate}%</Typography>
    </Box>
  </Box>
</Card>


        {/* Recent Bookings */}
{/* Recent Bookings */}
<Card sx={{ width: '100%', p: 1.5 }}>
  <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600 }}>
    الحجوزات الأخيرة
  </Typography>
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
    {mockBookings.map((booking) => (
      <Box
        key={booking.id}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          // gap: "3px",
          alignItems: 'center',
          p: 1.5,
          border: '1px solid #ddd',
          borderRadius: '8px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20vw' }}>
        {/* الخدمة + اسم العميل */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5}}>
          <Typography sx={{ fontWeight: 600 }}>{booking.service}</Typography>
          <Typography sx={{ fontSize: '0.9rem', color: '#666' }}>
            {booking.clientName}
          </Typography>
        </Box>

        {/* الحالة + السعر */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography sx={{ fontWeight: 600 }}>{booking.price} ريال</Typography>
          {getStatusChip(booking.status)}
        </Box>
        </div>
      </Box>
      
    ))}
  </Box>
</Card>



      </Box>
    </Box>    
    
  );
}