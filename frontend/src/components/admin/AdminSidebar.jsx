// src/components/admin/AdminSidebar.jsx
import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Avatar
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  Star as StarIcon,
  Receipt as ReceiptIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const drawerWidth = 240;

const AdminSidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAdminAuth();

  // Permissions from backend: can_manage_users, can_manage_services, can_manage_orders, can_view_logs, can_manage_settings
  const menuItems = [
    { text: 'لوحة التحكم', icon: <DashboardIcon />, path: '/admin', color: '#1976d2', show: true },
    { text: 'المستخدمين', icon: <PeopleIcon />, path: '/admin/users', color: '#388e3c', show: true },
    { text: 'الخدمات', icon: <BusinessIcon />, path: '/admin/services', color: '#0288d1', show: true },
    { text: 'الطلبات', icon: <AssignmentIcon />, path: '/admin/orders', color: '#fbc02d', show: true },
    { text: 'التقييمات النصية', icon: <StarIcon />, path: '/admin/reviews', color: '#8e24aa', show: true },
    { text: 'التقييمات الرقمية', icon: <StarIcon />, path: '/admin/ratings', color: '#ffb300', show: true },
    { text: 'الفواتير', icon: <ReceiptIcon />, path: '/admin/invoices', color: '#e53935', show: true },
    { text: 'الإشعارات', icon: <NotificationsIcon />, path: '/admin/notifications', color: '#1976d2', show: true },
    { text: 'الإعدادات', icon: <SettingsIcon />, path: '/admin/settings', color: '#455a64', show: true },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const drawerContent = (
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #e3f2fd 0%, #fce4ec 100%)',
      direction: 'rtl',
      boxShadow: '0 8px 32px #1976d244, 0 1.5px 0 #1976d233',
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      overflow: 'hidden',
      p: 2,
    }}>
      {/* Header */}
      <Box sx={{ p: 3, textAlign: 'center', borderBottom: 1, borderColor: 'divider', background: '#fff', boxShadow: 2, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
        <Avatar sx={{ width: 70, height: 70, mx: 'auto', mb: 1, bgcolor: 'primary.main', fontSize: 36, fontWeight: 'bold', letterSpacing: 2, boxShadow: 3 }}>
          خ
        </Avatar>
        <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold', letterSpacing: 1 }}>
          خدماتك
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ fontSize: 15, mt: 0.5 }}>
          لوحة التحكم الإدارية
        </Typography>
      </Box>

      {/* Menu Items */}
      <List sx={{ flexGrow: 1, pt: 2, direction: 'rtl' }}>
        {menuItems.filter(item => item.show).map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                onClose();
              }}
              sx={{
                mx: 1,
                borderRadius: 3,
                minHeight: 56,
                boxShadow: location.pathname === item.path ? 3 : 0,
                background: location.pathname === item.path ? `linear-gradient(90deg, ${item.color}22 60%, #fff 100%)` : 'transparent',
                color: location.pathname === item.path ? item.color : '#333',
                transition: '0.2s',
                '&:hover': {
                  background: `linear-gradient(90deg, ${item.color}11 60%, #e3f2fd 100%)`,
                  color: item.color,
                  boxShadow: 2,
                },
                '& .MuiListItemIcon-root': {
                  color: item.color,
                  fontSize: 32,
                  minWidth: 44
                },
              }}
            >
              <ListItemText primary={item.text} primaryTypographyProps={{ sx: { fontSize: 18, fontWeight: 600, textAlign: 'right', letterSpacing: 0.5 } }} />
              <ListItemIcon sx={{ minWidth: 44 }}>{React.cloneElement(item.icon, { sx: { fontSize: 32 } })}</ListItemIcon>
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 1 }} />
      {/* Logout */}
  <Box sx={{ p: 2, mt: 'auto', mb: 2 }}>
        <ListItemButton onClick={handleLogout} sx={{
          borderRadius: 3,
          background: 'linear-gradient(90deg, #fff 60%, #f8d7da 100%)',
          boxShadow: 2,
          justifyContent: 'flex-end',
          '&:hover': { background: 'linear-gradient(90deg, #f8d7da 60%, #fff 100%)', boxShadow: 4 },
        }}>
          <ListItemText primary="تسجيل الخروج" primaryTypographyProps={{ sx: { fontWeight: 700, color: 'error.main', textAlign: 'right', fontSize: 17 } }} />
          <ListItemIcon>
            <LogoutIcon color="error" sx={{ fontSize: 30 }} />
          </ListItemIcon>
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant="persistent"
      anchor="right"
      open={open}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        background: 'transparent',
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          position: 'fixed',
          right: 0,
          top: '64px',
          height: 'calc(100vh - 64px)',
          background: 'linear-gradient(135deg, #e3f2fd 0%, #fce4ec 100%)',
          boxShadow: '0 8px 32px #1976d244, 0 1.5px 0 #1976d233',
          borderTopLeftRadius: 18,
          borderBottomLeftRadius: 18,
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: '#1976d2 #e3f2fd',
          zIndex: 1300,
          border: '1.5px solid #e3f2fd',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default AdminSidebar;
