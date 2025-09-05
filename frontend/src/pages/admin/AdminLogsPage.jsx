import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Chip, CircularProgress, Alert } from '@mui/material';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { adminApiService } from '../../services/adminApiService';

const AdminLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminApiService.getAdminLogs()
      .then(setLogs)
      .catch(() => setError('فشل في تحميل السجلات'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ p: 3, textAlign: 'center' }}><CircularProgress size={60} /><Typography sx={{ mt: 2 }}>جاري تحميل السجلات...</Typography></Box>;

  return (
    <Box sx={{ p: { xs: 1, md: 3 }, pr: { xs: 1, md: 0 } }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2', mb: 3 }}>سجلات الإدارة</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {logs.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <ListAltIcon sx={{ color: '#0288d1', fontSize: 60, mb: 2 }} />
          <Typography variant="h6" color="textSecondary">لا توجد سجلات إدارية حتى الآن</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
          {logs.map((log) => (
            <Paper key={log.id} sx={{ p: 2.5, borderRadius: 4, display: 'flex', flexDirection: 'column', gap: 1.5, minHeight: 100 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ListAltIcon sx={{ color: '#0288d1', fontSize: 32 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{log.action}</Typography>
              </Box>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>{log.target_model} #{log.target_id}</Typography>
              <Chip label={log.timestamp?.slice(0, 19).replace('T', ' ')} color="info" size="small" />
              <Typography variant="body2" color="textSecondary">{log.notes}</Typography>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default AdminLogsPage;
