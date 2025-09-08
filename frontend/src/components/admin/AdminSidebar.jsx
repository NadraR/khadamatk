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
  IconButton,
  useTheme,
  useMediaQuery,
  Badge
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
  Logout as LogoutIcon,
  Close as CloseIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  AccountCircle as AccountCircleIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const drawerWidth = 180;

const AdminSidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAdminAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Professional menu items with better organization
  const menuItems = [
    { text: 'لوحة التحكم', icon: <DashboardIcon />, path: '/admin', color: '#0077ff', show: true, section: 'main' },
    { text: 'المستخدمون', icon: <PeopleIcon />, path: '/admin/users', color: '#10b981', show: true, section: 'main' },
    { text: 'الخدمات', icon: <BusinessIcon />, path: '/admin/services', color: '#3b82f6', show: true, section: 'main' },
    { text: 'الحجوزات', icon: <AssignmentIcon />, path: '/admin/orders', color: '#f59e0b', show: true, section: 'main' },
    { text: 'الفواتير', icon: <ReceiptIcon />, path: '/admin/invoices', color: '#ef4444', show: true, section: 'finance' },
    { text: 'التقييمات', icon: <StarIcon />, path: '/admin/ratings', color: '#f97316', show: true, section: 'finance' },
    { text: 'التقارير', icon: <AssessmentIcon />, path: '/admin/reviews', color: '#8b5cf6', show: true, section: 'finance' },
    { text: 'الإحصائيات', icon: <TrendingUpIcon />, path: '/admin/stats', color: '#06b6d4', show: true, section: 'analytics' },
    { text: 'الإشعارات', icon: <NotificationsIcon />, path: '/admin/notifications', color: '#0077ff', show: true, section: 'settings', badge: 3 },
    { text: 'الإعدادات', icon: <SettingsIcon />, path: '/admin/settings', color: '#6b7280', show: true, section: 'settings' },
    { text: 'الملف الشخصي', icon: <AccountCircleIcon />, path: '/admin/profile', color: '#8b5cf6', show: true, section: 'settings' },
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
      background: 'linear-gradient(180deg, #f9fbff 0%, #ffffff 100%)',
      direction: 'rtl',
      borderTopLeftRadius: 0,
      borderTopRightRadius: 20,
      overflow: 'hidden',
      p: 0,
      maxHeight: '100%',
      boxShadow: '0 8px 32px rgba(0,123,255,0.15)',
      border: '1px solid rgba(0,123,255,0.1)',
    }}>
      {/* Professional Header */}
      <Box sx={{ 
        p: 2, 
        textAlign: 'center', 
        borderBottom: 1, 
        borderColor: 'rgba(0,123,255,0.1)', 
        background: 'linear-gradient(135deg, #0077ff 0%, #4da6ff 100%)',
        borderTopLeftRadius: 0, 
        borderTopRightRadius: 20, 
        position: 'relative',
        color: 'white',
        boxShadow: '0 4px 15px rgba(0,123,255,0.3)'
      }}>
        {/* Close button for mobile */}
        {isMobile && (
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              color: 'white',
              zIndex: 1
            }}
          >
            <CloseIcon />
          </IconButton>
        )}
        <Avatar sx={{ 
          width: 60, 
          height: 60, 
          mx: 'auto', 
          mb: 1, 
          bgcolor: 'rgba(255,255,255,0.2)', 
          fontSize: 28, 
          fontWeight: 'bold', 
          letterSpacing: 1, 
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          border: '2px solid rgba(255,255,255,0.3)'
        }}>
          {user?.username?.charAt(0).toUpperCase() || 'A'}
        </Avatar>
        <Typography variant="h6" sx={{ fontWeight: 'bold', letterSpacing: 0.5, color: 'white', mb: 0.5 }}>
          {user?.username || 'مشرف النظام'}
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem' }}>
          مدير النظام
        </Typography>
      </Box>

      {/* Professional Menu Items */}
      <List sx={{ flexGrow: 1, pt: 1, direction: 'rtl', overflow: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
                    {/* لوحة التحكم */}
                    <Typography variant="subtitle2" sx={{ px: 2, py: 1, color: '#0077ff', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 1, mt: 1, background: 'rgba(0,123,255,0.05)', borderRadius: 1, mx: 1 }}>
                      لوحة التحكم
                    </Typography>
        {menuItems.filter(item => item.show && item.section === 'main').map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5, px: 1 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => { navigate(item.path); onClose(); }}
              sx={{
                borderRadius: 2,
                minHeight: 40,
                background: location.pathname === item.path ? `linear-gradient(135deg, ${item.color}15 0%, ${item.color}08 100%)` : 'transparent',
                color: location.pathname === item.path ? item.color : '#475569',
                border: location.pathname === item.path ? `1px solid ${item.color}20` : '1px solid transparent',
                '&:hover': {
                  background: `linear-gradient(135deg, ${item.color}08 0%, ${item.color}04 100%)`,
                  color: item.color,
                  border: `1px solid ${item.color}15`,
                  transform: 'translateX(-2px)',
                },
                '& .MuiListItemIcon-root': {
                  color: location.pathname === item.path ? item.color : '#64748b',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ 
                  sx: { 
                    fontSize: 13, 
                    fontWeight: location.pathname === item.path ? 600 : 500, 
                    textAlign: 'right' 
                  } 
                }} 
              />
              <ListItemIcon sx={{ minWidth: 36 }}>
                {React.cloneElement(item.icon, { sx: { fontSize: 20 } })}
              </ListItemIcon>
            </ListItemButton>
          </ListItem>
        ))}

                    {/* المالية والتحليل */}
                    <Typography variant="subtitle2" sx={{ px: 2, py: 1, color: '#ef4444', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 1, mt: 2, background: 'rgba(239,68,68,0.05)', borderRadius: 1, mx: 1 }}>
                      المالية والتحليل
                    </Typography>
        {menuItems.filter(item => item.show && item.section === 'finance').map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5, px: 1 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                onClose();
              }}
              sx={{
                borderRadius: 2,
                minHeight: 40,
                background: location.pathname === item.path ? `linear-gradient(135deg, ${item.color}15 0%, ${item.color}08 100%)` : 'transparent',
                color: location.pathname === item.path ? item.color : '#475569',
                border: location.pathname === item.path ? `1px solid ${item.color}20` : '1px solid transparent',
                '&:hover': {
                  background: `linear-gradient(135deg, ${item.color}08 0%, ${item.color}04 100%)`,
                  color: item.color,
                  border: `1px solid ${item.color}15`,
                  transform: 'translateX(-2px)',
                },
                '& .MuiListItemIcon-root': {
                  color: location.pathname === item.path ? item.color : '#64748b',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ 
                  sx: { 
                    fontSize: 13, 
                    fontWeight: location.pathname === item.path ? 600 : 500, 
                    textAlign: 'right' 
                  } 
                }} 
              />
              <ListItemIcon sx={{ minWidth: 36 }}>
                {React.cloneElement(item.icon, { sx: { fontSize: 20 } })}
              </ListItemIcon>
            </ListItemButton>
          </ListItem>
        ))}

                    {/* التحليلات */}
                    <Typography variant="subtitle2" sx={{ px: 2, py: 1, color: '#06b6d4', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 1, mt: 2, background: 'rgba(6,182,212,0.05)', borderRadius: 1, mx: 1 }}>
                      التحليلات
                    </Typography>
        {menuItems.filter(item => item.show && item.section === 'analytics').map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5, px: 1 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                onClose();
              }}
              sx={{
                borderRadius: 2,
                minHeight: 40,
                background: location.pathname === item.path ? `linear-gradient(135deg, ${item.color}15 0%, ${item.color}08 100%)` : 'transparent',
                color: location.pathname === item.path ? item.color : '#475569',
                border: location.pathname === item.path ? `1px solid ${item.color}20` : '1px solid transparent',
                '&:hover': {
                  background: `linear-gradient(135deg, ${item.color}08 0%, ${item.color}04 100%)`,
                  color: item.color,
                  border: `1px solid ${item.color}15`,
                  transform: 'translateX(-2px)',
                },
                '& .MuiListItemIcon-root': {
                  color: location.pathname === item.path ? item.color : '#64748b',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ 
                  sx: { 
                    fontSize: 13, 
                    fontWeight: location.pathname === item.path ? 600 : 500, 
                    textAlign: 'right' 
                  } 
                }} 
              />
              <ListItemIcon sx={{ minWidth: 36 }}>
                {React.cloneElement(item.icon, { sx: { fontSize: 20 } })}
              </ListItemIcon>
            </ListItemButton>
          </ListItem>
        ))}

                    {/* الإعدادات */}
                    <Typography variant="subtitle2" sx={{ px: 2, py: 1, color: '#6b7280', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 1, mt: 2, background: 'rgba(107,114,128,0.05)', borderRadius: 1, mx: 1 }}>
                      الإعدادات
                    </Typography>
        {menuItems.filter(item => item.show && item.section === 'settings').map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5, px: 1 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                onClose();
              }}
              sx={{
                borderRadius: 2,
                minHeight: 40,
                background: location.pathname === item.path ? `linear-gradient(135deg, ${item.color}15 0%, ${item.color}08 100%)` : 'transparent',
                color: location.pathname === item.path ? item.color : '#475569',
                border: location.pathname === item.path ? `1px solid ${item.color}20` : '1px solid transparent',
                '&:hover': {
                  background: `linear-gradient(135deg, ${item.color}08 0%, ${item.color}04 100%)`,
                  color: item.color,
                  border: `1px solid ${item.color}15`,
                  transform: 'translateX(-2px)',
                },
                '& .MuiListItemIcon-root': {
                  color: location.pathname === item.path ? item.color : '#64748b',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ 
                  sx: { 
                    fontSize: 13, 
                    fontWeight: location.pathname === item.path ? 600 : 500, 
                    textAlign: 'right' 
                  } 
                }} 
              />
              <ListItemIcon sx={{ minWidth: 36 }}>
                {item.badge ? (
                  <Badge badgeContent={item.badge} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', height: 16, minWidth: 16 } }}>
                    {React.cloneElement(item.icon, { sx: { fontSize: 20 } })}
                  </Badge>
                ) : (
                  React.cloneElement(item.icon, { sx: { fontSize: 20 } })
                )}
              </ListItemIcon>
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 1, borderColor: 'rgba(0,123,255,0.1)' }} />
      
      {/* Professional Footer */}
      <Box sx={{ p: 2, textAlign: 'center', background: 'linear-gradient(135deg, rgba(0,123,255,0.05) 0%, rgba(77,166,255,0.05) 100%)', borderTop: '1px solid rgba(0,123,255,0.1)' }}>
        <Typography variant="body2" sx={{ color: '#0077ff', fontWeight: 600, mb: 1, fontSize: '0.75rem' }}>
          © خدماتك 2024
        </Typography>
        <IconButton 
          onClick={handleLogout}
          sx={{ 
            color: '#ef4444',
            background: 'rgba(239, 68, 68, 0.1)',
            '&:hover': {
              background: 'rgba(239, 68, 68, 0.2)',
              transform: 'scale(1.05)',
            },
            transition: 'all 0.3s ease',
            borderRadius: 2
          }}
        >
          <LogoutIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant="temporary"
      anchor="right"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true,
        BackdropProps: {
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
          }
        }
      }}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          position: 'fixed',
          right: 0,
          top: isMobile ? 0 : '64px',
          height: isMobile ? '100vh' : 'calc(100vh - 64px)',
          maxHeight: isMobile ? '100vh' : 'calc(100vh - 64px)',
          background: 'transparent',
          boxShadow: 'none',
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e1 #f1f5f9',
          zIndex: 1300,
          border: 'none',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default AdminSidebar;
