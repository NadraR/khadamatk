import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Chip, Button, CircularProgress, Alert, TextField } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { adminApiService } from '../../services/adminApiService';

const SettingsPage = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    adminApiService.getSettings()
      .then(setSettings)
      .catch(() => setError('فشل في تحميل الإعدادات'))
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (id, value) => {
    try {
      await adminApiService.updateSetting(id, value);
      setSuccess('تم تحديث الإعداد بنجاح');
      setTimeout(() => setSuccess(null), 2000);
    } catch {
      setError('فشل في تحديث الإعداد');
    }
  };

  if (loading) return <Box sx={{ p: 3, textAlign: 'center' }}><CircularProgress size={60} /><Typography sx={{ mt: 2 }}>جاري تحميل الإعدادات...</Typography></Box>;

  return (
    <Box sx={{ p: { xs: 1, md: 3 }, pr: { xs: 1, md: 0 } }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2', mb: 3 }}>إعدادات المنصة</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {settings.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <SettingsIcon sx={{ color: '#455a64', fontSize: 60, mb: 2 }} />
          <Typography variant="h6" color="textSecondary">لا توجد إعدادات متاحة حالياً</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
          {settings.map((setting) => (
            <Paper key={setting.id} sx={{ p: 2.5, borderRadius: 4, display: 'flex', flexDirection: 'column', gap: 1.5, minHeight: 100 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <SettingsIcon sx={{ color: '#455a64', fontSize: 32 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{setting.key}</Typography>
              </Box>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>{setting.group}</Typography>
              <TextField
                label="القيمة"
                value={setting.value}
                onChange={e => handleUpdate(setting.id, e.target.value)}
                size="small"
                sx={{ mt: 1 }}
              />
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default SettingsPage;
