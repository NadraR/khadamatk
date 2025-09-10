import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Grid,
  Alert,
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Card,
  CardContent,
  CardHeader,
} from '@mui/material';
import {
  Save as SaveIcon,
  Restore as RestoreIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import { settingsApi } from '../../services/adminApiService';
import { useTranslation } from '../../hooks/useTranslation';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { useCustomTheme } from '../../contexts/ThemeContext';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import '../../styles/adminCommon.css';

const SettingsPage = () => {
  const { t, toggleLanguage, currentLang } = useTranslation();
  const { user, isAuthenticated } = useAdminAuth();
  const { isDarkMode } = useCustomTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settings, setSettings] = useState({
    // General Settings
    site_name: 'خدماتك',
    site_description: 'منصة الخدمات المنزلية',
    default_language: 'ar',
    timezone: 'Asia/Riyadh',
    
    // Notification Settings
    email_notifications: true,
    push_notifications: true,
    sms_notifications: false,
    
    // Security Settings
    two_factor_auth: false,
    session_timeout: 30,
    password_min_length: 8,
    
    // Financial Settings
    website_profit_rate: 5,
    worker_profit_rate: 95,
    currency: 'SAR',
    
    // Appearance Settings
    theme: 'light',
    primary_color: '#0077ff',
    secondary_color: '#4da6ff'
  });

  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
        const response = await settingsApi.getSettings();
      setSettings({ ...settings, ...response.data });
    } catch (error) {
      console.error('Error fetching settings:', error);
      showSnackbar('خطأ في تحميل الإعدادات', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    try {
      await settingsApi.updateSettings(settings);
      showSnackbar('تم حفظ الإعدادات بنجاح');
    } catch (error) {
      console.error('Error saving settings:', error);
      showSnackbar('خطأ في حفظ الإعدادات', 'error');
    }
  };

  const handleResetSettings = async () => {
    try {
      await settingsApi.resetSettings();
      showSnackbar('تم إعادة تعيين الإعدادات بنجاح');
      fetchSettings();
    } catch (error) {
      console.error('Error resetting settings:', error);
      showSnackbar('خطأ في إعادة تعيين الإعدادات', 'error');
    }
  };

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
    link.download = 'settings.json';
        link.click();
    showSnackbar('تم تصدير الإعدادات بنجاح');
  };

  const handleImportSettings = (event) => {
    const file = event.target.files[0];
    if (file) {
    const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target.result);
          setSettings(importedSettings);
          showSnackbar('تم استيراد الإعدادات بنجاح');
        } catch (error) {
          showSnackbar('خطأ في استيراد الإعدادات', 'error');
      }
    };
    reader.readAsText(file);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>جاري تحميل الإعدادات...</Typography>
      </Box>
    );
  }

  return (
    <>
      {/* AdminHeader - الهيدر المشترك */}
      <AdminHeader 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />

      {/* AdminSidebar */}
      <AdminSidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        isMobile={false}
      />

      {/* المحتوى الرئيسي */}
      <Box
        sx={{
          minHeight: '100vh',
          background: isDarkMode 
            ? 'linear-gradient(180deg, #0a0f1a 0%, #111827 100%)'
            : 'linear-gradient(180deg, #f9fbff 0%, #ffffff 100%)',
          direction: 'rtl',
          overflowX: 'hidden',
          overflowY: 'auto',
          width: '100%',
          px: { xs: 1, sm: 2 },
          py: { xs: 8, sm: 9 },
        }}
      >
        <Box className="admin-page">
          <Box className="admin-header">
            <Typography variant="h4" component="h1" sx={{
              color: isDarkMode ? '#e5e7eb' : '#666666'
            }}>
              {t('settings management')}
            </Typography>
            <Typography variant="body1" sx={{
              color: isDarkMode ? '#9ca3af' : '#666666'
            }}>
              {t('settings management description')}
            </Typography>
          </Box>

      <Grid container spacing={3}>
        {/* General Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="الإعدادات العامة" />
            <CardContent>
              <TextField
                fullWidth
                label="اسم الموقع"
                value={settings.site_name}
                onChange={(e) => handleSettingChange('site_name', e.target.value)}
                sx={{ mb: 2 }}
              />
              
                <TextField
                  fullWidth
                  label="وصف الموقع"
                  multiline
                rows={3}
                value={settings.site_description}
                onChange={(e) => handleSettingChange('site_description', e.target.value)}
                sx={{ mb: 2 }}
              />
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>اللغة الافتراضية</InputLabel>
                <Select
                  value={settings.default_language}
                  label="اللغة الافتراضية"
                  onChange={(e) => handleSettingChange('default_language', e.target.value)}
                >
                  <MenuItem value="ar">العربية</MenuItem>
                  <MenuItem value="en">English</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth>
                <InputLabel>المنطقة الزمنية</InputLabel>
                <Select
                  value={settings.timezone}
                  label="المنطقة الزمنية"
                  onChange={(e) => handleSettingChange('timezone', e.target.value)}
                >
                  <MenuItem value="Asia/Riyadh">الرياض (GMT+3)</MenuItem>
                  <MenuItem value="Asia/Dubai">دبي (GMT+4)</MenuItem>
                  <MenuItem value="Africa/Cairo">القاهرة (GMT+2)</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="إعدادات الإشعارات" />
            <CardContent>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.email_notifications}
                    onChange={(e) => handleSettingChange('email_notifications', e.target.checked)}
                  />
                }
                label="إشعارات البريد الإلكتروني"
                sx={{ mb: 2 }}
                />
                
                <FormControlLabel
                  control={
                    <Switch
                    checked={settings.push_notifications}
                    onChange={(e) => handleSettingChange('push_notifications', e.target.checked)}
                  />
                }
                label="الإشعارات الفورية"
                sx={{ mb: 2 }}
              />
              
                <FormControlLabel
                  control={
                    <Switch
                    checked={settings.sms_notifications}
                    onChange={(e) => handleSettingChange('sms_notifications', e.target.checked)}
                  />
                }
                label="إشعارات SMS"
                sx={{ mb: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="إعدادات الأمان" />
            <CardContent>
                <FormControlLabel
                  control={
                    <Switch
                    checked={settings.two_factor_auth}
                    onChange={(e) => handleSettingChange('two_factor_auth', e.target.checked)}
                  />
                }
                label="المصادقة الثنائية"
                sx={{ mb: 2 }}
              />
              
              <Typography variant="body2" sx={{ mb: 1 }}>
                انتهاء صلاحية الجلسة (دقيقة): {settings.session_timeout}
              </Typography>
              <Slider
                value={settings.session_timeout}
                onChange={(e, value) => handleSettingChange('session_timeout', value)}
                min={5}
                max={120}
                step={5}
                marks
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="الحد الأدنى لطول كلمة المرور"
                type="number"
                value={settings.password_min_length}
                onChange={(e) => handleSettingChange('password_min_length', parseInt(e.target.value))}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Financial Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="الإعدادات المالية" />
            <CardContent>
              <Typography variant="body2" sx={{ mb: 1 }}>
                نسبة أرباح الموقع: {settings.website_profit_rate}%
              </Typography>
              <Slider
                value={settings.website_profit_rate}
                onChange={(e, value) => handleSettingChange('website_profit_rate', value)}
                min={1}
                max={20}
                step={1}
                marks
                sx={{ mb: 2 }}
              />
              
              <Typography variant="body2" sx={{ mb: 1 }}>
                نسبة أرباح العامل: {settings.worker_profit_rate}%
                </Typography>
              <Slider
                value={settings.worker_profit_rate}
                onChange={(e, value) => handleSettingChange('worker_profit_rate', value)}
                min={80}
                max={99}
                step={1}
                marks
                sx={{ mb: 2 }}
              />
              
              <FormControl fullWidth>
                <InputLabel>العملة</InputLabel>
                  <Select
                  value={settings.currency}
                  label="العملة"
                  onChange={(e) => handleSettingChange('currency', e.target.value)}
                >
                  <MenuItem value="SAR">ريال سعودي (ر.س)</MenuItem>
                  <MenuItem value="AED">درهم إماراتي (د.إ)</MenuItem>
                  <MenuItem value="USD">دولار أمريكي ($)</MenuItem>
                  </Select>
                </FormControl>
            </CardContent>
          </Card>
        </Grid>

        {/* Appearance Settings */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="إعدادات المظهر" />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>الوضع</InputLabel>
                  <Select
                      value={settings.theme}
                      label="الوضع"
                      onChange={(e) => handleSettingChange('theme', e.target.value)}
                    >
                      <MenuItem value="light">فاتح</MenuItem>
                      <MenuItem value="dark">داكن</MenuItem>
                      <MenuItem value="auto">تلقائي</MenuItem>
                  </Select>
                </FormControl>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="اللون الأساسي"
                    type="color"
                    value={settings.primary_color}
                    onChange={(e) => handleSettingChange('primary_color', e.target.value)}
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
              <TextField
                    fullWidth
                    label="اللون الثانوي"
                    type="color"
                    value={settings.secondary_color}
                    onChange={(e) => handleSettingChange('secondary_color', e.target.value)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Actions */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="الإجراءات" />
            <CardContent>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveSettings}
                  sx={{ bgcolor: '#0077ff', '&:hover': { bgcolor: '#0056b3' } }}
                >
                  حفظ الإعدادات
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<RestoreIcon />}
                  onClick={handleResetSettings}
                >
                  إعادة تعيين
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportSettings}
                >
                  تصدير
                </Button>
                
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadIcon />}
                >
                  استيراد
                  <input
                    type="file"
                    hidden
                    accept=".json"
                    onChange={handleImportSettings}
                  />
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
        </Box>
      </Box>
    </>
  );
};

export default SettingsPage;
