import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData.username, formData.password);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.detail || 'اسم المستخدم أو كلمة المرور غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(120deg, #e3f2fd 60%, #f8fafc 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      direction: 'rtl',
      fontFamily: `'Cairo', 'Tajawal', 'Segoe UI', 'Arial', 'sans-serif'`
    }}>
      <Container maxWidth="xs">
        <Paper elevation={6} sx={{
          p: 5,
          borderRadius: 6,
          boxShadow: 8,
          textAlign: 'center',
          background: '#fff',
          fontFamily: `'Cairo', 'Tajawal', 'Segoe UI', 'Arial', 'sans-serif'`
        }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
            <Box sx={{ width: 80, height: 80, bgcolor: 'primary.main', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, fontWeight: 900, mb: 1, boxShadow: 3, letterSpacing: 2, fontFamily: `'Cairo', 'Tajawal', 'Segoe UI', 'Arial', 'sans-serif'` }}>
              خ
            </Box>
            <Typography component="h1" variant="h4" sx={{ fontWeight: 900, color: 'primary.main', mb: 0.5, fontFamily: `'Cairo', 'Tajawal', 'Segoe UI', 'Arial', 'sans-serif'`, fontSize: 34, letterSpacing: 0.5 }}>
              تسجيل دخول الأدمن
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 2, fontWeight: 600, fontFamily: `'Cairo', 'Tajawal', 'Segoe UI', 'Arial', 'sans-serif'`, fontSize: 18 }}>
              خدماتك - لوحة التحكم الإدارية
            </Typography>
          </Box>
          {error && (
            <Alert severity="error" sx={{ mb: 2, fontWeight: 600 }}>{error}</Alert>
          )}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, textAlign: 'right' }}>
            <Box sx={{ mb: 2, textAlign: 'right' }}>
              <Typography sx={{ fontWeight: 800, mb: 0.5, pr: 0.5, fontSize: 17, color: 'text.primary', fontFamily: `'Cairo', 'Tajawal', 'Segoe UI', 'Arial', 'sans-serif'` }}>اسم المستخدم<span style={{ color: '#d32f2f' }}>*</span></Typography>
              <TextField
                required
                fullWidth
                id="username"
                name="username"
                autoComplete="username"
                autoFocus
                value={formData.username}
                onChange={handleChange}
                sx={{ direction: 'rtl', background: '#f5faff', borderRadius: 2 }}
                inputProps={{ style: { textAlign: 'right', fontWeight: 700, fontSize: 17, fontFamily: 'inherit' } }}
              />
            </Box>
            <Box sx={{ mb: 2, textAlign: 'right' }}>
              <Typography sx={{ fontWeight: 800, mb: 0.5, pr: 0.5, fontSize: 17, color: 'text.primary', fontFamily: `'Cairo', 'Tajawal', 'Segoe UI', 'Arial', 'sans-serif'` }}>كلمة المرور<span style={{ color: '#d32f2f' }}>*</span></Typography>
              <TextField
                required
                fullWidth
                name="password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                sx={{ direction: 'rtl', background: '#f5faff', borderRadius: 2 }}
                inputProps={{ style: { textAlign: 'right', fontWeight: 700, fontSize: 17, fontFamily: 'inherit' } }}
              />
            </Box>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 2, mb: 1, borderRadius: 3, fontWeight: 800, fontSize: 20, py: 1.5, background: 'linear-gradient(90deg, #1976d2 70%, #42a5f5 100%)', fontFamily: `'Cairo', 'Tajawal', 'Segoe UI', 'Arial', 'sans-serif'` }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'تسجيل الدخول'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default AdminLogin;
