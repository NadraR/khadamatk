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
  Avatar,
  IconButton
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Category as CategoryIcon,
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
    { text: 'لوحة التحكم', icon: <DashboardIcon />, path: '/admin', color: '#1976d2', show: true, section: 'main' },
    { text: 'إدارة المستخدمين', icon: <PeopleIcon />, path: '/admin/users', color: '#388e3c', show: true, section: 'main' },
    { text: 'إدارة الحجوزات', icon: <AssignmentIcon />, path: '/admin/orders', color: '#fbc02d', show: true, section: 'main' },
    { text: 'إدارة الخدمات', icon: <BusinessIcon />, path: '/admin/services', color: '#0288d1', show: true, section: 'main' },
    { text: 'إدارة الإيرادات', icon: <ReceiptIcon />, path: '/admin/invoices', color: '#e53935', show: true, section: 'finance' },
    { text: 'التحليلات', icon: <StarIcon />, path: '/admin/ratings', color: '#ffb300', show: true, section: 'finance' },
    { text: 'التقارير', icon: <StarIcon />, path: '/admin/reviews', color: '#8e24aa', show: true, section: 'finance' },
    { text: 'إعدادات النظام', icon: <SettingsIcon />, path: '/admin/settings', color: '#455a64', show: true, section: 'settings' },
    { text: 'التنبيهات', icon: <NotificationsIcon />, path: '/admin/notifications', color: '#1976d2', show: true, section: 'settings', badge: 5 },
    { text: 'الملف الشخصي', icon: <PeopleIcon />, path: '/admin/profile', color: '#7b1fa2', show: true, section: 'settings' },
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
      background: 'white',
      direction: 'rtl',
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      overflow: 'hidden',
      p: 2,
    }}>
      {/* Header */}
      <Box sx={{ p: 3, textAlign: 'center', borderBottom: 1, borderColor: 'divider', background: '#fff', boxShadow: 2, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
        <Avatar sx={{ width: 70, height: 70, mx: 'auto', mb: 1, bgcolor: '#d32f2f', fontSize: 36, fontWeight: 'bold', letterSpacing: 2, boxShadow: 3 }}>
          R
        </Avatar>
        <Typography variant="h5" sx={{ fontWeight: 'bold', letterSpacing: 1, color: '#d32f2f' }}>
          rewan مشرف النظام
        </Typography>
      </Box>

      {/* Menu Items */}
      <List sx={{ flexGrow: 1, pt: 2, direction: 'rtl' }}>
        {/* لوحة التحكم */}
        <Typography variant="subtitle2" sx={{ px: 3, py: 1, color: '#666', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>
          لوحة التحكم
        </Typography>
        {menuItems.filter(item => item.show && item.section === 'main').map((item) => (
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
                minHeight: 48,
                boxShadow: location.pathname === item.path ? 2 : 0,
                background: location.pathname === item.path ? `linear-gradient(90deg, ${item.color}15 60%, #fff 100%)` : 'transparent',
                color: location.pathname === item.path ? item.color : '#333',
                transition: '0.2s',
                '&:hover': {
                  background: `linear-gradient(90deg, ${item.color}08 60%, #f5f5f5 100%)`,
                  color: item.color,
                  boxShadow: 1,
                },
                '& .MuiListItemIcon-root': {
                  color: item.color,
                  fontSize: 24,
                  minWidth: 40
                },
              }}
            >
              <ListItemText primary={item.text} primaryTypographyProps={{ sx: { fontSize: 14, fontWeight: 500, textAlign: 'right' } }} />
              <ListItemIcon sx={{ minWidth: 40 }}>{React.cloneElement(item.icon, { sx: { fontSize: 24 } })}</ListItemIcon>
            </ListItemButton>
          </ListItem>
        ))}

        {/* المالية والتحليل */}
        <Typography variant="subtitle2" sx={{ px: 3, py: 1, color: '#666', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1, mt: 2 }}>
          المالية والتحليل
        </Typography>
        {menuItems.filter(item => item.show && item.section === 'finance').map((item) => (
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
                minHeight: 48,
                boxShadow: location.pathname === item.path ? 2 : 0,
                background: location.pathname === item.path ? `linear-gradient(90deg, ${item.color}15 60%, #fff 100%)` : 'transparent',
                color: location.pathname === item.path ? item.color : '#333',
                transition: '0.2s',
                '&:hover': {
                  background: `linear-gradient(90deg, ${item.color}08 60%, #f5f5f5 100%)`,
                  color: item.color,
                  boxShadow: 1,
                },
                '& .MuiListItemIcon-root': {
                  color: item.color,
                  fontSize: 24,
                  minWidth: 40
                },
              }}
            >
              <ListItemText primary={item.text} primaryTypographyProps={{ sx: { fontSize: 14, fontWeight: 500, textAlign: 'right' } }} />
              <ListItemIcon sx={{ minWidth: 40 }}>{React.cloneElement(item.icon, { sx: { fontSize: 24 } })}</ListItemIcon>
            </ListItemButton>
          </ListItem>
        ))}

        {/* الحساب والإعدادات */}
        <Typography variant="subtitle2" sx={{ px: 3, py: 1, color: '#666', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1, mt: 2 }}>
          الحساب والإعدادات
        </Typography>
        {menuItems.filter(item => item.show && item.section === 'settings').map((item) => (
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
                minHeight: 48,
                boxShadow: location.pathname === item.path ? 2 : 0,
                background: location.pathname === item.path ? `linear-gradient(90deg, ${item.color}15 60%, #fff 100%)` : 'transparent',
                color: location.pathname === item.path ? item.color : '#333',
                transition: '0.2s',
                '&:hover': {
                  background: `linear-gradient(90deg, ${item.color}08 60%, #f5f5f5 100%)`,
                  color: item.color,
                  boxShadow: 1,
                },
                '& .MuiListItemIcon-root': {
                  color: item.color,
                  fontSize: 24,
                  minWidth: 40
                },
              }}
            >
              <ListItemText primary={item.text} primaryTypographyProps={{ sx: { fontSize: 14, fontWeight: 500, textAlign: 'right' } }} />
              <ListItemIcon sx={{ minWidth: 40 }}>{React.cloneElement(item.icon, { sx: { fontSize: 24 } })}</ListItemIcon>
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 1 }} />
      
      {/* Footer */}
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: '#666', fontWeight: 500, mb: 1 }}>
          خدماتك 0 2024
        </Typography>
        <IconButton sx={{ color: '#666' }}>
          <Typography variant="h6">?</Typography>
        </IconButton>
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
          background: 'white',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          borderTopLeftRadius: 18,
          borderBottomLeftRadius: 18,
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: '#d32f2f #f5f5f5',
          zIndex: 1300,
          border: '1px solid #e0e0e0',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default AdminSidebar;
