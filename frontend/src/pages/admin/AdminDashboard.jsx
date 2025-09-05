// src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Container,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  Star as StarIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { adminApiService } from '../../services/adminApiService';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await adminApiService.getStats();
      setStats(data);
    } catch (err) {
      setError('فشل في تحميل الإحصائيات');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          جاري تحميل البيانات...
        </Typography>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Typography variant="h4" gutterBottom>
          لوحة التحكم
        </Typography>
        <Typography variant="body1">
          مرحباً بك في لوحة التحكم الإدارية. يبدو أن هناك مشكلة في الاتصال بالخادم.
        </Typography>
      </Container>
    );
  } 

  const statCards = [
    {
      title: 'المستخدمين',
      value: stats?.users_count || 0,
      icon: <PeopleIcon />,
      color: '#1976d2',
      bg: 'linear-gradient(120deg, #e3f2fd 60%, #bbdefb 100%)'
    },
    {
      title: 'الخدمات',
      value: stats?.services_count || 0,
      icon: <BusinessIcon />,
      color: '#388e3c',
      bg: 'linear-gradient(120deg, #e8f5e9 60%, #c8e6c9 100%)'
    },
    {
      title: 'الطلبات',
      value: stats?.orders_count || 0,
      icon: <AssignmentIcon />,
      color: '#f57c00',
      bg: 'linear-gradient(120deg, #fff3e0 60%, #ffe0b2 100%)'
    },
    {
      title: 'التقييمات',
      value: stats?.ratings_count || 0,
      icon: <StarIcon />,
      color: '#7b1fa2',
      bg: 'linear-gradient(120deg, #f3e5f5 60%, #ce93d8 100%)'
    },
    {
      title: 'الفواتير',
      value: stats?.invoices_count || 0,
      icon: <ReceiptIcon />,
      color: '#d32f2f',
      bg: 'linear-gradient(120deg, #ffebee 60%, #ffcdd2 100%)'
    },
    {
      title: 'متوسط التقييم',
      value: stats?.avg_rating?.toFixed(1) || '0.0',
      icon: <TrendingUpIcon />,
      color: '#0288d1',
      bg: 'linear-gradient(120deg, #e1f5fe 60%, #b3e5fc 100%)'
    }
  ];

  // تجهيز بيانات الرسم البياني من الـ API
  const ordersChartData = [
    { name: 'معلق', value: stats?.orders_status?.pending || 0 },
    { name: 'مقبول', value: stats?.orders_status?.accepted || 0 },
    { name: 'مكتمل', value: stats?.orders_status?.completed || 0 },
    { name: 'ملغي', value: stats?.orders_status?.cancelled || 0 }
  ];

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', background: 'linear-gradient(120deg, #f8fafc 60%, #e3f2fd 100%)', py: { xs: 1, md: 2 }, direction: 'rtl' }}>
      <Container maxWidth="xl" sx={{ p: { xs: 0.5, md: 1.5 }, direction: 'rtl' }}>
        {/* الكروت الرئيسية */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #e3f2fd 0%, #fce4ec 100%)',
            borderRadius: 5,
            boxShadow: 6,
            p: { xs: 1.5, md: 3 },
            mb: 2,
            direction: 'rtl',
            minHeight: 140,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2', mb: 0.5, textAlign: 'right', width: '100%' }}>
            لوحة التحكم
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#555', mb: 2, fontSize: 18, textAlign: 'right', width: '100%' }}>
            مرحباً بك في لوحة التحكم الإدارية، يمكنك متابعة الإحصائيات بشكل سريع واحترافي.
          </Typography>
          <Grid container spacing={2} sx={{ justifyContent: { md: 'flex-start', xs: 'center' }, mt: 0 }}>
            {statCards.map((card, index) => (
              <Grid item xs={12} sm={6} md={4} lg={2} key={index} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Card
                  sx={{
                    height: 140,
                    width: 170,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    transition: 'transform 0.22s, box-shadow 0.22s',
                    boxShadow: 6,
                    borderRadius: 4,
                    '&:hover': {
                      transform: 'scale(1.06) rotate(-1deg)',
                      boxShadow: 16,
                    },
                    background: card.bg,
                    border: `2px solid ${card.color}33`,
                    px: 2,
                    cursor: 'pointer',
                  }}
                  elevation={0}
                >
                  <CardContent sx={{ p: 1, '&:last-child': { pb: 1 }, width: '100%' }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                      <Box>
                        <Typography color="textSecondary" gutterBottom sx={{ fontWeight: 700, fontSize: 16, textAlign: 'right' }}>
                          {card.title}
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: card.color, fontSize: 30, textAlign: 'right' }}>
                          {card.value}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          color: '#fff',
                          background: card.color,
                          borderRadius: '50%',
                          p: 1.7,
                          boxShadow: 4,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: `2.5px solid #fff`,
                          transition: '0.2s',
                          animation: 'pulse 1.5s infinite',
                        }}
                      >
                        {React.cloneElement(card.icon, { sx: { fontSize: 32, animation: 'bounce 1.2s infinite alternate' } })}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* الرسم البياني + الملخص */}
        <Grid container spacing={2} alignItems="stretch" sx={{ mt: 1 }}>
          <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
            <Paper sx={{
              p: { xs: 2, md: 4 },
              boxShadow: 6,
              borderRadius: 4,
              flex: 1,
              minHeight: 340,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              background: 'linear-gradient(120deg, #e3f2fd 80%, #fff 100%)',
              width: '100%',
              height: '100%',
              alignItems: 'flex-start',
            }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2', mb: 2, textAlign: 'right', width: '100%' }}>
                إحصائيات الطلبات
              </Typography>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={ordersChartData} barCategoryGap={30}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 15, fontWeight: 600 }} />
                  <YAxis tick={{ fontSize: 15, fontWeight: 600 }} />
                  <Tooltip wrapperStyle={{ direction: 'rtl', fontSize: 16 }} />
                  <Bar dataKey="value" fill="#1976d2" radius={[10, 10, 0, 0]}>
                    {/* ألوان مميزة لكل عمود */}
                    {ordersChartData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={['#1976d2', '#388e3c', '#f57c00', '#d32f2f'][idx % 4]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
            <Paper sx={{
              p: { xs: 2, md: 4 },
              boxShadow: 6,
              borderRadius: 4,
              background: 'linear-gradient(120deg, #e3f2fd 80%, #fff 100%)',
              flex: 1,
              minHeight: 340,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              alignItems: 'flex-start',
            }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#388e3c', mb: 2, textAlign: 'right', width: '100%' }}>
                ملخص سريع
              </Typography>
              <Box>
                <Typography variant="body1" color="textSecondary" sx={{ mb: 1, fontSize: 18, textAlign: 'right' }}>
                  إجمالي المستخدمين: <b>{stats?.users_count || 0}</b>
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ mb: 1, fontSize: 18, textAlign: 'right' }}>
                  الخدمات النشطة: <b>{stats?.services_count || 0}</b>
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ mb: 1, fontSize: 18, textAlign: 'right' }}>
                  الطلبات المعلقة: <b>{stats?.orders_status?.pending || 0}</b>
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ mb: 1, fontSize: 18, textAlign: 'right' }}>
                  متوسط التقييم: <b>{stats?.avg_rating?.toFixed(1) || '0.0'} ⭐</b>
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
      {/* أنيميشن CSS للكروت */}
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.2); }
          70% { box-shadow: 0 0 0 10px rgba(25, 118, 210, 0.05); }
          100% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.0); }
        }
        @keyframes bounce {
          0% { transform: translateY(0); }
          100% { transform: translateY(-8px); }
        }
      `}</style>
    </Box>
  );
};

export default AdminDashboard;
