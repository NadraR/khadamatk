import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  Grid,
  Card,
  CardContent,
  IconButton,
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Business as BusinessIcon,
  Language as LanguageIcon,
  Palette as PaletteIcon,
  Storage as StorageIcon,
  Download as DownloadIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import { settingsApi } from '../../services/adminApiService';
import './SettingsPage.css';

const SettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  
  // إعدادات النظام
  const [systemSettings, setSystemSettings] = useState({
    site_name: 'خدماتك',
    site_description: 'منصة الخدمات المنزلية',
    site_email: 'info@khadamatk.com',
    site_phone: '+966501234567',
    maintenance_mode: false,
    registration_enabled: true,
    email_verification: true,
    sms_verification: false
  });

  // إعدادات الأمان
  const [securitySettings, setSecuritySettings] = useState({
    password_min_length: 8,
    session_timeout: 30,
    max_login_attempts: 5,
    two_factor_auth: false,
    ip_whitelist: '',
    ssl_enabled: true
  });

  // إعدادات الإشعارات
  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    admin_notifications: true,
    user_notifications: true,
    order_notifications: true
  });

  // إعدادات المظهر
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'light',
    primary_color: '#0077ff',
    secondary_color: '#10b981',
    language: 'ar',
    rtl_enabled: true,
    logo_url: '',
    favicon_url: ''
  });

  useEffect(() => {
    loadSettings();
  }, []);

  // تطبيق الإعدادات تلقائياً عند تغييرها
  useEffect(() => {
    if (appearanceSettings.theme && appearanceSettings.language) {
      applySettings();
    }
  }, [appearanceSettings.theme, appearanceSettings.language, appearanceSettings.primary_color, appearanceSettings.secondary_color]);

  // إظهار إشعار عند تغيير الإعدادات
  const showChangeNotification = (settingName) => {
    setSuccess(`تم تغيير ${settingName} بنجاح`);
    setSnackbarOpen(true);
  };

  // دالة لتحويل القيم من string إلى boolean
  const convertStringToBoolean = (value) => {
    if (typeof value === 'string') {
      const result = value.toLowerCase() === 'true';
      console.log(`Converting "${value}" to boolean: ${result}`);
      return result;
    }
    return Boolean(value);
  };

  // دالة لتحويل القيم من string إلى number
  const convertStringToNumber = (value) => {
    if (typeof value === 'string' && !isNaN(value)) {
      return Number(value);
    }
    return value;
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // تحميل الإعدادات من localStorage أولاً
      const localSettings = localStorage.getItem('admin_settings');
      if (localSettings) {
        const parsedSettings = JSON.parse(localSettings);
        
        if (parsedSettings.system) {
          const convertedSystem = {
            ...parsedSettings.system,
            maintenance_mode: convertStringToBoolean(parsedSettings.system.maintenance_mode),
            registration_enabled: convertStringToBoolean(parsedSettings.system.registration_enabled),
            email_verification: convertStringToBoolean(parsedSettings.system.email_verification),
            sms_verification: convertStringToBoolean(parsedSettings.system.sms_verification)
          };
          setSystemSettings(prev => ({...prev, ...convertedSystem}));
        }
        
        if (parsedSettings.security) {
          const convertedSecurity = {
            ...parsedSettings.security,
            password_min_length: convertStringToNumber(parsedSettings.security.password_min_length),
            session_timeout: convertStringToNumber(parsedSettings.security.session_timeout),
            max_login_attempts: convertStringToNumber(parsedSettings.security.max_login_attempts),
            two_factor_auth: convertStringToBoolean(parsedSettings.security.two_factor_auth),
            ssl_enabled: convertStringToBoolean(parsedSettings.security.ssl_enabled)
          };
          setSecuritySettings(prev => ({...prev, ...convertedSecurity}));
        }
        
        if (parsedSettings.notifications) {
          const convertedNotifications = {
            ...parsedSettings.notifications,
            email_notifications: convertStringToBoolean(parsedSettings.notifications.email_notifications),
            sms_notifications: convertStringToBoolean(parsedSettings.notifications.sms_notifications),
            push_notifications: convertStringToBoolean(parsedSettings.notifications.push_notifications),
            admin_notifications: convertStringToBoolean(parsedSettings.notifications.admin_notifications),
            user_notifications: convertStringToBoolean(parsedSettings.notifications.user_notifications),
            order_notifications: convertStringToBoolean(parsedSettings.notifications.order_notifications)
          };
          setNotificationSettings(prev => ({...prev, ...convertedNotifications}));
        }
        
        if (parsedSettings.appearance) {
          const convertedAppearance = {
            ...parsedSettings.appearance,
            rtl_enabled: convertStringToBoolean(parsedSettings.appearance.rtl_enabled)
          };
          setAppearanceSettings(prev => ({...prev, ...convertedAppearance}));
        }
      }
      
      // محاولة تحميل الإعدادات من الباك إند
      try {
        const response = await settingsApi.getSettings();
        if (response.success) {
          const settings = response.data;
          
          // تحويل القيم من backend
          if (settings.system) {
            const convertedSystem = {
              ...settings.system,
              maintenance_mode: convertStringToBoolean(settings.system.maintenance_mode),
              registration_enabled: convertStringToBoolean(settings.system.registration_enabled),
              email_verification: convertStringToBoolean(settings.system.email_verification),
              sms_verification: convertStringToBoolean(settings.system.sms_verification)
            };
            setSystemSettings(prev => ({...prev, ...convertedSystem}));
          }
          
          if (settings.security) {
            const convertedSecurity = {
              ...settings.security,
              password_min_length: convertStringToNumber(settings.security.password_min_length),
              session_timeout: convertStringToNumber(settings.security.session_timeout),
              max_login_attempts: convertStringToNumber(settings.security.max_login_attempts),
              two_factor_auth: convertStringToBoolean(settings.security.two_factor_auth),
              ssl_enabled: convertStringToBoolean(settings.security.ssl_enabled)
            };
            setSecuritySettings(prev => ({...prev, ...convertedSecurity}));
          }
          
          if (settings.notifications) {
            const convertedNotifications = {
              ...settings.notifications,
              email_notifications: convertStringToBoolean(settings.notifications.email_notifications),
              sms_notifications: convertStringToBoolean(settings.notifications.sms_notifications),
              push_notifications: convertStringToBoolean(settings.notifications.push_notifications),
              admin_notifications: convertStringToBoolean(settings.notifications.admin_notifications),
              user_notifications: convertStringToBoolean(settings.notifications.user_notifications),
              order_notifications: convertStringToBoolean(settings.notifications.order_notifications)
            };
            setNotificationSettings(prev => ({...prev, ...convertedNotifications}));
          }
          
          if (settings.appearance) {
            const convertedAppearance = {
              ...settings.appearance,
              rtl_enabled: convertStringToBoolean(settings.appearance.rtl_enabled)
            };
            setAppearanceSettings(prev => ({...prev, ...convertedAppearance}));
          }
        }
      } catch (apiError) {
        console.log('لا يمكن الاتصال بالباك إند، استخدام الإعدادات المحلية');
      }
      
      setLoading(false);
    } catch (err) {
      setError('فشل في تحميل الإعدادات');
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // تنظيف البيانات وإزالة القيم الفارغة
      const cleanSettings = (settings) => {
        const cleaned = {};
        for (const [key, value] of Object.entries(settings)) {
          if (value !== undefined && value !== null && value !== '') {
            cleaned[key] = value;
          }
        }
        return cleaned;
      };
      
      const allSettings = {
        system: cleanSettings(systemSettings),
        security: cleanSettings(securitySettings),
        notifications: cleanSettings(notificationSettings),
        appearance: cleanSettings(appearanceSettings)
      };
      
      console.log('Sending settings:', allSettings);
      
      const response = await settingsApi.updateSettings(allSettings);
      if (response.success) {
        setSuccess('تم حفظ الإعدادات بنجاح');
        setSnackbarOpen(true);
      } else {
        setError(response.error || 'فشل في حفظ الإعدادات');
      }
      setSaving(false);
    } catch (err) {
      console.error('Save error:', err);
      setError('فشل في حفظ الإعدادات');
      setSaving(false);
    }
  };

  const applySettings = () => {
    // تطبيق إعدادات المظهر
    if (appearanceSettings.theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.style.backgroundColor = '#121212';
    } else if (appearanceSettings.theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      document.body.style.backgroundColor = '#ffffff';
    } else {
      // تلقائي - يتبع إعدادات النظام
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
      document.body.style.backgroundColor = prefersDark ? '#121212' : '#ffffff';
    }

    // تطبيق اللغة
    if (appearanceSettings.language === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', 'en');
    }

    // إعادة تحميل الصفحة عند تغيير اللغة (فقط إذا كانت مختلفة)
    const currentLang = document.documentElement.getAttribute('lang');
    if (currentLang && currentLang !== appearanceSettings.language) {
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }

    // تطبيق الألوان
    if (appearanceSettings.primary_color) {
      document.documentElement.style.setProperty('--primary-color', appearanceSettings.primary_color);
    }
    if (appearanceSettings.secondary_color) {
      document.documentElement.style.setProperty('--secondary-color', appearanceSettings.secondary_color);
    }

    // حفظ الإعدادات في localStorage
    localStorage.setItem('admin_settings', JSON.stringify({
      system: systemSettings,
      security: securitySettings,
      notifications: notificationSettings,
      appearance: appearanceSettings
    }));
  };

  const handleReset = async () => {
    try {
      const response = await settingsApi.resetSettings();
      if (response.success) {
        setSuccess('تم إعادة تعيين الإعدادات');
        setSnackbarOpen(true);
        // إعادة تحميل الصفحة لتطبيق الإعدادات الافتراضية
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setError(response.error || 'فشل في إعادة تعيين الإعدادات');
      }
    } catch (err) {
      setError('فشل في إعادة تعيين الإعدادات');
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleExportSettings = async () => {
    try {
      const response = await settingsApi.exportSettings();
      if (response.success) {
        // إنشاء ملف JSON للتحميل
        const allSettings = {
          system: systemSettings,
          security: securitySettings,
          notifications: notificationSettings,
          appearance: appearanceSettings,
          exported_at: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(allSettings, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `admin-settings-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        setSuccess('تم تصدير الإعدادات بنجاح');
        setSnackbarOpen(true);
      } else {
        setError(response.error || 'فشل في تصدير الإعدادات');
      }
    } catch (err) {
      setError('فشل في تصدير الإعدادات');
    }
  };

  const handleImportSettings = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const settingsData = JSON.parse(e.target.result);
        
        if (settingsData.system) {
          const convertedSystem = {
            ...settingsData.system,
            maintenance_mode: convertStringToBoolean(settingsData.system.maintenance_mode),
            registration_enabled: convertStringToBoolean(settingsData.system.registration_enabled),
            email_verification: convertStringToBoolean(settingsData.system.email_verification),
            sms_verification: convertStringToBoolean(settingsData.system.sms_verification)
          };
          setSystemSettings(prev => ({...prev, ...convertedSystem}));
        }
        
        if (settingsData.security) {
          const convertedSecurity = {
            ...settingsData.security,
            password_min_length: convertStringToNumber(settingsData.security.password_min_length),
            session_timeout: convertStringToNumber(settingsData.security.session_timeout),
            max_login_attempts: convertStringToNumber(settingsData.security.max_login_attempts),
            two_factor_auth: convertStringToBoolean(settingsData.security.two_factor_auth),
            ssl_enabled: convertStringToBoolean(settingsData.security.ssl_enabled)
          };
          setSecuritySettings(prev => ({...prev, ...convertedSecurity}));
        }
        
        if (settingsData.notifications) {
          const convertedNotifications = {
            ...settingsData.notifications,
            email_notifications: convertStringToBoolean(settingsData.notifications.email_notifications),
            sms_notifications: convertStringToBoolean(settingsData.notifications.sms_notifications),
            push_notifications: convertStringToBoolean(settingsData.notifications.push_notifications),
            admin_notifications: convertStringToBoolean(settingsData.notifications.admin_notifications),
            user_notifications: convertStringToBoolean(settingsData.notifications.user_notifications),
            order_notifications: convertStringToBoolean(settingsData.notifications.order_notifications)
          };
          setNotificationSettings(prev => ({...prev, ...convertedNotifications}));
        }
        
        if (settingsData.appearance) {
          const convertedAppearance = {
            ...settingsData.appearance,
            rtl_enabled: convertStringToBoolean(settingsData.appearance.rtl_enabled)
          };
          setAppearanceSettings(prev => ({...prev, ...convertedAppearance}));
        }
        
        setSuccess('تم استيراد الإعدادات بنجاح');
        setSnackbarOpen(true);
      } catch (err) {
        setError('خطأ في قراءة ملف الإعدادات');
      }
    };
    reader.readAsText(file);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography sx={{ mt: 2 }}>جاري تحميل الإعدادات...</Typography>
      </Box>
    );
  }

  return (
    <Box className="settings-page theme-transition" sx={{ p: { xs: 1, md: 3 }, pr: { xs: 1, md: 0 }, minHeight: '100vh', overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, width: '100%' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
          إعدادات النظام
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {/* <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadSettings}
            disabled={loading}
          >
            تحديث
          </Button> */}
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportSettings}
            sx={{ 
              color: '#10b981', 
              borderColor: '#10b981',
              '&:hover': {
                borderColor: '#059669',
                backgroundColor: 'rgba(16, 185, 129, 0.05)'
              }
            }}
          >
            تصدير
          </Button>
          <input
            type="file"
            accept=".json"
            onChange={handleImportSettings}
            style={{ display: 'none' }}
            id="import-settings"
          />
          <Button
            variant="outlined"
            component="label"
            htmlFor="import-settings"
            startIcon={<UploadIcon />}
            sx={{ 
              color: '#f59e0b', 
              borderColor: '#f59e0b',
              '&:hover': {
                borderColor: '#d97706',
                backgroundColor: 'rgba(245, 158, 11, 0.05)'
              }
            }}
          >
            استيراد
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
            sx={{
              background: 'linear-gradient(135deg, #0077ff 0%, #4da6ff 100%)',
              boxShadow: '0 2px 8px rgba(0,123,255,0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #0056cc 0%, #3d8bff 100%)',
                boxShadow: '0 4px 12px rgba(0,123,255,0.4)',
                transform: 'translateY(-1px)'
              }
            }}
          >
            {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3} sx={{ width: '100%' }}>
        {/* إعدادات النظام */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card className="stat-card" sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BusinessIcon sx={{ color: '#0077ff', mr: 1, fontSize: 24 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#334155' }}>
                  إعدادات النظام
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="اسم الموقع"
                  value={systemSettings.site_name}
                  onChange={(e) => {
                    setSystemSettings({...systemSettings, site_name: e.target.value});
                    showChangeNotification('اسم الموقع');
                  }}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="وصف الموقع"
                  value={systemSettings.site_description}
                  onChange={(e) => {
                    setSystemSettings({...systemSettings, site_description: e.target.value});
                    showChangeNotification('وصف الموقع');
                  }}
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                />
                <TextField
                  label="البريد الإلكتروني"
                  type="email"
                  value={systemSettings.site_email}
                  onChange={(e) => {
                    setSystemSettings({...systemSettings, site_email: e.target.value});
                    showChangeNotification('البريد الإلكتروني');
                  }}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="رقم الهاتف"
                  value={systemSettings.site_phone}
                  onChange={(e) => {
                    setSystemSettings({...systemSettings, site_phone: e.target.value});
                    showChangeNotification('رقم الهاتف');
                  }}
                  fullWidth
                  size="small"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={systemSettings.maintenance_mode}
                      onChange={(e) => {
                        setSystemSettings({...systemSettings, maintenance_mode: e.target.checked});
                        showChangeNotification('وضع الصيانة');
                      }}
                    />
                  }
                  label="وضع الصيانة"
                  sx={{ 
                    '& .MuiFormControlLabel-label': {
                      color: '#475569',
                      fontSize: '0.875rem'
                    }
                  }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={systemSettings.registration_enabled}
                      onChange={(e) => {
                        setSystemSettings({...systemSettings, registration_enabled: e.target.checked});
                        showChangeNotification('تفعيل التسجيل');
                      }}
                    />
                  }
                  label="تفعيل التسجيل"
                  sx={{ 
                    '& .MuiFormControlLabel-label': {
                      color: '#475569',
                      fontSize: '0.875rem'
                    }
                  }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={systemSettings.email_verification}
                      onChange={(e) => {
                        setSystemSettings({...systemSettings, email_verification: e.target.checked});
                        showChangeNotification('التحقق من البريد الإلكتروني');
                      }}
                    />
                  }
                  label="التحقق من البريد الإلكتروني"
                  sx={{ 
                    '& .MuiFormControlLabel-label': {
                      color: '#475569',
                      fontSize: '0.875rem'
                    }
                  }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={systemSettings.sms_verification}
                      onChange={(e) => {
                        setSystemSettings({...systemSettings, sms_verification: e.target.checked});
                        showChangeNotification('التحقق من الرسائل النصية');
                      }}
                    />
                  }
                  label="التحقق من الرسائل النصية"
                  sx={{ 
                    '& .MuiFormControlLabel-label': {
                      color: '#475569',
                      fontSize: '0.875rem'
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* إعدادات الأمان */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card className="stat-card" sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SecurityIcon sx={{ color: '#ef4444', mr: 1, fontSize: 24 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#334155' }}>
                  إعدادات الأمان
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="الحد الأدنى لطول كلمة المرور"
                  type="number"
                  value={securitySettings.password_min_length}
                  onChange={(e) => {
                    setSecuritySettings({...securitySettings, password_min_length: parseInt(e.target.value)});
                    showChangeNotification('الحد الأدنى لطول كلمة المرور');
                  }}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="مهلة الجلسة (دقيقة)"
                  type="number"
                  value={securitySettings.session_timeout}
                  onChange={(e) => {
                    setSecuritySettings({...securitySettings, session_timeout: parseInt(e.target.value)});
                    showChangeNotification('مهلة الجلسة');
                  }}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="الحد الأقصى لمحاولات تسجيل الدخول"
                  type="number"
                  value={securitySettings.max_login_attempts}
                  onChange={(e) => {
                    setSecuritySettings({...securitySettings, max_login_attempts: parseInt(e.target.value)});
                    showChangeNotification('الحد الأقصى لمحاولات تسجيل الدخول');
                  }}
                  fullWidth
                  size="small"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={securitySettings.two_factor_auth}
                      onChange={(e) => {
                        setSecuritySettings({...securitySettings, two_factor_auth: e.target.checked});
                        showChangeNotification('المصادقة الثنائية');
                      }}
                    />
                  }
                  label="المصادقة الثنائية"
                  sx={{ 
                    '& .MuiFormControlLabel-label': {
                      color: '#475569',
                      fontSize: '0.875rem'
                    }
                  }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={securitySettings.ssl_enabled}
                      onChange={(e) => {
                        setSecuritySettings({...securitySettings, ssl_enabled: e.target.checked});
                        showChangeNotification('تفعيل SSL');
                      }}
                    />
                  }
                  label="تفعيل SSL"
                  sx={{ 
                    '& .MuiFormControlLabel-label': {
                      color: '#475569',
                      fontSize: '0.875rem'
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* إعدادات الإشعارات */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card className="stat-card" sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <NotificationsIcon sx={{ color: '#f59e0b', mr: 1, fontSize: 24 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#334155' }}>
                  إعدادات الإشعارات
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.email_notifications}
                      onChange={(e) => {
                        setNotificationSettings({...notificationSettings, email_notifications: e.target.checked});
                        showChangeNotification('إشعارات البريد الإلكتروني');
                      }}
                    />
                  }
                  label="إشعارات البريد الإلكتروني"
                  sx={{ 
                    '& .MuiFormControlLabel-label': {
                      color: '#475569',
                      fontSize: '0.875rem'
                    }
                  }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.sms_notifications}
                      onChange={(e) => {
                        setNotificationSettings({...notificationSettings, sms_notifications: e.target.checked});
                        showChangeNotification('إشعارات الرسائل النصية');
                      }}
                    />
                  }
                  label="إشعارات الرسائل النصية"
                  sx={{ 
                    '& .MuiFormControlLabel-label': {
                      color: '#475569',
                      fontSize: '0.875rem'
                    }
                  }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.push_notifications}
                      onChange={(e) => {
                        setNotificationSettings({...notificationSettings, push_notifications: e.target.checked});
                        showChangeNotification('الإشعارات الفورية');
                      }}
                    />
                  }
                  label="الإشعارات الفورية"
                  sx={{ 
                    '& .MuiFormControlLabel-label': {
                      color: '#475569',
                      fontSize: '0.875rem'
                    }
                  }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.admin_notifications}
                      onChange={(e) => {
                        setNotificationSettings({...notificationSettings, admin_notifications: e.target.checked});
                        showChangeNotification('إشعارات المدير');
                      }}
                    />
                  }
                  label="إشعارات المدير"
                  sx={{ 
                    '& .MuiFormControlLabel-label': {
                      color: '#475569',
                      fontSize: '0.875rem'
                    }
                  }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.user_notifications}
                      onChange={(e) => {
                        setNotificationSettings({...notificationSettings, user_notifications: e.target.checked});
                        showChangeNotification('إشعارات المستخدمين');
                      }}
                    />
                  }
                  label="إشعارات المستخدمين"
                  sx={{ 
                    '& .MuiFormControlLabel-label': {
                      color: '#475569',
                      fontSize: '0.875rem'
                    }
                  }}
                />
        </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* إعدادات المظهر */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card className="stat-card" sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PaletteIcon sx={{ color: '#8b5cf6', mr: 1, fontSize: 24 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#334155' }}>
                  إعدادات المظهر
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>السمة</InputLabel>
                  <Select
                    value={appearanceSettings.theme || 'light'}
                    onChange={(e) => {
                      setAppearanceSettings({...appearanceSettings, theme: e.target.value});
                      showChangeNotification('السمة');
                    }}
                    label="السمة"
                  >
                    <MenuItem value="light">فاتحة</MenuItem>
                    <MenuItem value="dark">داكنة</MenuItem>
                    <MenuItem value="auto">تلقائية</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth size="small">
                  <InputLabel>اللغة</InputLabel>
                  <Select
                    value={appearanceSettings.language || 'ar'}
                    onChange={(e) => {
                      setAppearanceSettings({...appearanceSettings, language: e.target.value});
                      showChangeNotification('اللغة');
                    }}
                    label="اللغة"
                  >
                    <MenuItem value="ar">العربية</MenuItem>
                    <MenuItem value="en">English</MenuItem>
                  </Select>
                </FormControl>
                
                {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <TextField
                    label="اللون الأساسي"
                    type="color"
                    value={appearanceSettings.primary_color}
                    onChange={(e) => {
                      setAppearanceSettings({...appearanceSettings, primary_color: e.target.value});
                      showChangeNotification('اللون الأساسي');
                    }}
                    size="small"
                    sx={{ width: 100 }}
                  />
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      backgroundColor: appearanceSettings.primary_color,
                      borderRadius: 1,
                      border: '1px solid #ccc'
                    }}
                  />
                </Box> */}
                
                {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField
                    label="اللون الثانوي"
                    type="color"
                    value={appearanceSettings.secondary_color}
                    onChange={(e) => {
                      setAppearanceSettings({...appearanceSettings, secondary_color: e.target.value});
                      showChangeNotification('اللون الثانوي');
                    }}
                size="small"
                    sx={{ width: 100 }}
                  />
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      backgroundColor: appearanceSettings.secondary_color,
                      borderRadius: 1,
                      border: '1px solid #ccc'
                    }}
                  />
                </Box> */}
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={appearanceSettings.rtl_enabled}
                      onChange={(e) => {
                        setAppearanceSettings({...appearanceSettings, rtl_enabled: e.target.checked});
                        showChangeNotification('دعم اللغة العربية');
                      }}
                    />
                  }
                  label="دعم اللغة العربية (RTL)"
                  sx={{ 
                    '& .MuiFormControlLabel-label': {
                      color: '#475569',
                      fontSize: '0.875rem'
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* إعادة تعيين الإعدادات */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button
          variant="outlined"
          color="error"
          onClick={handleReset}
          sx={{ mr: 2 }}
        >
          إعادة تعيين الإعدادات
        </Button>
        </Box>

      {/* Snackbar للرسائل */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SettingsPage;
