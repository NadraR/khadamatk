import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Chip, Button, CircularProgress, Alert } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { adminApiService } from '../../services/adminApiService';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminApiService.getNotifications()
      .then(setNotifications)
      .catch(() => setError('فشل في تحميل الإشعارات'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ p: 3, textAlign: 'center' }}><CircularProgress size={60} /><Typography sx={{ mt: 2 }}>جاري تحميل الإشعارات...</Typography></Box>;

  return (
    <Box sx={{ p: { xs: 1, md: 3 }, pr: { xs: 1, md: 0 } }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2', mb: 3 }}>الإشعارات</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {notifications.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <NotificationsIcon sx={{ color: '#1976d2', fontSize: 60, mb: 2 }} />
          <Typography variant="h6" color="textSecondary">لا توجد إشعارات حتى الآن</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
          {notifications.map((notif) => (
            <Paper key={notif.id} sx={{ p: 2.5, borderRadius: 4, display: 'flex', flexDirection: 'column', gap: 1.5, minHeight: 100, background: notif.is_read ? '#f5f5f5' : '#e3f2fd' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <NotificationsIcon sx={{ color: '#1976d2', fontSize: 32 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{notif.title || 'إشعار'}</Typography>
              </Box>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>{notif.body}</Typography>
              <Chip label={notif.is_read ? 'مقروء' : 'جديد'} color={notif.is_read ? 'default' : 'primary'} size="small" />
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default NotificationsPage;
