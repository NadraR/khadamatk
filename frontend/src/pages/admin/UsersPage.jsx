import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Alert,
  Snackbar,
  Tooltip,
  Fab,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  AppBar,
  Toolbar,
  Avatar,
  useTheme,
  useMediaQuery,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  Plus as AddIcon,
  Edit as EditIcon,
  Trash2 as DeleteIcon,
  Eye as ViewIcon,
  CheckCircle as CheckCircleIcon,
  X as CancelIcon,
  Menu as MenuIcon,
  Globe as GlobeIcon,
  Search as SearchIcon,
  Filter as FilterIcon,
} from 'lucide-react';
import { usersApi } from '../../services/adminApiService';
import { useTranslation } from '../../hooks/useTranslation';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { useCustomTheme } from '../../contexts/ThemeContext';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import '../../styles/adminCommon.css';
import './AdminDashboard.css';

const UsersPage = () => {
  const { t, toggleLanguage, currentLang } = useTranslation();
  const { user, isAuthenticated } = useAdminAuth();
  const { isDarkMode, toggleTheme } = useCustomTheme();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'staff', 'client'
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
    role: 'client',
    is_staff: false,
    is_active: true,
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchUsers();
  }, []);

  // فلترة وبحث المستخدمين
  useEffect(() => {
    let filtered = users;

    // فلترة حسب النوع
    if (filterType !== 'all') {
      filtered = filtered.filter(user => {
        if (filterType === 'staff') return user.is_staff;
        if (filterType === 'client') return !user.is_staff;
        return true;
      });
    }

    // بحث حسب الاسم أو البريد الإلكتروني
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, filterType]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const result = await usersApi.getUsers();
      if (result.success) {
        setUsers(result.data);
        setFilteredUsers(result.data);
      } else {
        showSnackbar(result.error || 'خطأ في تحميل المستخدمين', 'error');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showSnackbar('خطأ في تحميل المستخدمين', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleClose = () => {
    setOpen(false);
    setEditingUser(null);
    setFormData({ 
      username: '', 
      email: '', 
      first_name: '', 
      last_name: '', 
      phone: '', 
      password: '',
      role: 'client',
      is_staff: false, 
      is_active: true 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // تنظيف البيانات - إزالة الحقول الفارغة
      const cleanFormData = { ...formData };
      
      // إزالة الحقول الفارغة
      Object.keys(cleanFormData).forEach(key => {
        if (cleanFormData[key] === '' || cleanFormData[key] === null) {
          delete cleanFormData[key];
        }
      });
      
      console.log('Sending data:', cleanFormData);
      
      if (editingUser) {
        const result = await usersApi.updateUser(editingUser.id, cleanFormData);
        if (result.success) {
          showSnackbar('تم تحديث المستخدم بنجاح');
          handleClose();
          fetchUsers();
        } else {
          showSnackbar(result.error || 'خطأ في تحديث المستخدم', 'error');
        }
      } else {
        const result = await usersApi.createUser(cleanFormData);
        if (result.success) {
          showSnackbar('تم إنشاء المستخدم بنجاح');
          handleClose();
          fetchUsers();
        } else {
          showSnackbar(result.error || 'خطأ في إنشاء المستخدم', 'error');
        }
      }
    } catch (error) {
      console.error('Error saving user:', error);
      showSnackbar('خطأ في حفظ المستخدم', 'error');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      phone: user.phone || '',
      password: '',
      role: user.role || 'client',
      is_staff: user.is_staff,
      is_active: user.is_active,
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      try {
        const result = await usersApi.deleteUser(id);
        if (result.success) {
          showSnackbar('تم حذف المستخدم بنجاح');
          fetchUsers();
        } else {
          showSnackbar(result.error || 'خطأ في حذف المستخدم', 'error');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        showSnackbar('خطأ في حذف المستخدم', 'error');
      }
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      const result = await usersApi.updateUser(user.id, { is_active: !user.is_active });
      if (result.success) {
        showSnackbar(`تم ${user.is_active ? 'إلغاء تفعيل' : 'تفعيل'} المستخدم بنجاح`);
        fetchUsers();
      } else {
        showSnackbar(result.error || 'خطأ في تحديث حالة المستخدم', 'error');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      showSnackbar('خطأ في تحديث حالة المستخدم', 'error');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
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
          width: '100vw',
          mx: 'auto',
          px: { xs: 1, sm: 2 },
          pt: '56px',
          pl: sidebarOpen && !isMobile ? '180px' : 0,
          transform: sidebarOpen && !isMobile ? 'translateX(-180px)' : 'translateX(0)',
          transition: 'all 0.3s ease-in-out'
        }}
      >
        <Box
          sx={{
            p: { xs: 1, sm: 1.5, md: 2 },
            maxWidth: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}
        >
          {/* Page Header */}
          <Box sx={{ mt: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {/* <Box>
                <Typography variant="h4" sx={{ 
                  fontWeight: 'bold', 
                  mb: 1, 
                  color: isDarkMode ? '#e5e7eb' : '#666666' 
                }}>
                  {t('users management')}
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: isDarkMode ? '#9ca3af' : '#666666' 
                }}>
                  {t('users management description')}
                </Typography>
              </Box> */}
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpen(true)}
                sx={{
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #0077ff 0%, #4da6ff 100%)',
                  boxShadow: '0 4px 12px rgba(0,123,255,0.4)',
                  textTransform: 'none',
                  fontWeight: 500,
                  px: 3,
                  py: 1,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0056cc 0%, #3d8bff 100%)',
                    transform: 'scale(1.02)',
                    boxShadow: '0 6px 16px rgba(0,123,255,0.5)',
                  },
                  transition: 'all 0.3s ease-in-out',
                }}
              >
                {t('add new user')}
              </Button>
            </Box>
            
            {/* Search and Filter Bar */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'center', mt: 2 }}>
              <TextField
                placeholder={t('search by username')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon size={20} style={{ marginRight: 8, color: '#666' }} />
                }}
                sx={{
                  flex: 1,
                  maxWidth: '400px',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '16px',
                    backgroundColor: 'white',
                    boxShadow: '0 2px 8px rgba(0,123,255,0.15)',
                    '& fieldset': {
                      borderColor: '#e5e7eb',
                    },
                    '&:hover fieldset': {
                      borderColor: '#0077ff',
                      boxShadow: '0 4px 12px rgba(0,123,255,0.2)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#0077ff',
                      boxShadow: '0 4px 12px rgba(0,123,255,0.25)',
                    },
                  },
                }}
              />
              <FormControl sx={{ minWidth: 120 }}>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  displayEmpty
                  startAdornment={<FilterIcon size={20} style={{ marginRight: 8, color: '#666' }} />}
                  sx={{
                    borderRadius: '16px',
                    backgroundColor: 'white',
                    boxShadow: '0 2px 8px rgba(0,123,255,0.15)',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e5e7eb',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#0077ff',
                      boxShadow: '0 4px 12px rgba(0,123,255,0.2)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#0077ff',
                      boxShadow: '0 4px 12px rgba(0,123,255,0.25)',
                    },
                  }}
                >
                  <MenuItem value="all">{t('all users')}</MenuItem>
                  <MenuItem value="staff">{t('staff only')}</MenuItem>
                  <MenuItem value="client">{t('clients only')}</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Users Cards */}
          <Grid container spacing={2}>
            {filteredUsers && filteredUsers.map((user) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={user.id} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Card
                  sx={{
                    height: '320px', // ارتفاع ثابت ومتساوي لجميع الكاردات
                    width: '100%', // عرض كامل للكارد
                    minHeight: '320px', // ضمان الحد الأدنى للارتفاع
                    maxHeight: '320px', // ضمان الحد الأقصى للارتفاع
                    minWidth: '280px', // ضمان الحد الأدنى للعرض
                    maxWidth: '320px', // ضمان الحد الأقصى للعرض
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,123,255,0.08)',
                    border: '1px solid rgba(0,123,255,0.1)',
                    background: isDarkMode 
                      ? 'linear-gradient(135deg, rgba(17,24,39,0.9) 0%, rgba(10,15,26,0.9) 100%)'
                      : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(249,251,255,0.9) 100%)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease-in-out',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden', // منع تجاوز المحتوى
                    margin: '0 auto', // توسيط الكارد
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0,123,255,0.15)',
                    }
                  }}
                >
                  <CardContent sx={{ 
                    p: 2, 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column',
                    height: '100%',
                    overflow: 'hidden'
                  }}>
                    {/* User Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: user.is_staff ? '#0077ff' : '#e5e7eb', 
                            color: user.is_staff ? 'white' : '#6b7280',
                            width: 32, 
                            height: 32,
                            fontSize: '0.8rem'
                          }}
                        >
                          {user.username?.charAt(0)?.toUpperCase() || 'U'}
                        </Avatar>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 600, 
                          color: isDarkMode ? '#e5e7eb' : '#1e293b', 
                          fontSize: '0.9rem' 
                        }}>
                          {user.username}
                        </Typography>
                      </Box>
                      <Chip
                        label={user.is_active ? t('active') : t('inactive')}
                        sx={{ 
                          borderRadius: '6px', 
                          fontSize: '0.7rem',
                          backgroundColor: user.is_active ? '#dbeafe' : '#e5e7eb',
                          color: user.is_active ? '#2563eb' : '#6b7280',
                          border: user.is_active ? '1px solid #3b82f6' : 'none'
                        }}
                      />
                    </Box>

                    {/* User Details */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ 
                          color: isDarkMode ? '#9ca3af' : '#64748b', 
                          fontSize: '0.8rem' 
                        }}>
                          {t('email')}:
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 500, 
                          color: isDarkMode ? '#e5e7eb' : '#1e293b', 
                          fontSize: '0.8rem' 
                        }}>
                          {user.email}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ 
                          color: isDarkMode ? '#9ca3af' : '#64748b', 
                          fontSize: '0.8rem' 
                        }}>
                          {t('name')}:
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 500, 
                          color: isDarkMode ? '#e5e7eb' : '#1e293b', 
                          fontSize: '0.8rem' 
                        }}>
                          {`${user.first_name || ''} ${user.last_name || ''}`.trim() || t('not specified')}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ 
                          color: isDarkMode ? '#9ca3af' : '#64748b', 
                          fontSize: '0.8rem' 
                        }}>
                          {t('phone')}:
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 500, 
                          color: isDarkMode ? '#e5e7eb' : '#1e293b', 
                          fontSize: '0.8rem' 
                        }}>
                          {user.phone || t('not specified')}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ 
                          color: isDarkMode ? '#9ca3af' : '#64748b', 
                          fontSize: '0.8rem' 
                        }}>
                          {t('type')}:
                        </Typography>
                        <Chip
                          label={user.is_staff ? t('staff') : t('client')}
                          size="small"
                          sx={{ 
                            borderRadius: '6px', 
                            fontSize: '0.7rem',
                            backgroundColor: user.is_staff ? '#f0f9ff' : '#f9fafb',
                            color: user.is_staff ? '#0077ff' : '#6b7280',
                            border: user.is_staff ? '1px solid #0077ff' : '1px solid #e5e7eb'
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', marginTop: 'auto' }}>
                      {/* <Tooltip title={t('edit')}>
                        <IconButton 
                          size="small"
                          onClick={() => handleEdit(user)} 
                          sx={{ 
                            color: '#0077ff',
                            '&:hover': { background: 'rgba(0,123,255,0.1)' }
                          }}
                        >
                          <EditIcon size={16} />
                        </IconButton>
                      </Tooltip> */}
                      <Tooltip title={user.is_active ? t('deactivate') : t('activate')}>
                        <IconButton 
                          size="small"
                          onClick={() => handleToggleStatus(user)} 
                          sx={{ 
                            color: user.is_active ? '#6b7280' : '#0077ff',
                            '&:hover': { 
                              background: user.is_active ? 'rgba(107,114,128,0.1)' : 'rgba(0,123,255,0.1)' 
                            }
                          }}
                        >
                          {user.is_active ? <CancelIcon size={16} /> : <CheckCircleIcon size={16} />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('delete')}>
                        <IconButton 
                          size="small"
                          onClick={() => handleDelete(user.id)} 
                          sx={{ 
                            color: '#6b7280',
                            '&:hover': { background: 'rgba(107,114,128,0.1)' }
                          }}
                        >
                          <DeleteIcon size={16} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* No Results Message */}
          {filteredUsers && filteredUsers.length === 0 && !loading && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" sx={{ 
                color: isDarkMode ? '#e5e7eb' : '#666666', 
                mb: 1 
              }}>
                {t('no results')}
              </Typography>
              <Typography variant="body2" sx={{ 
                color: isDarkMode ? '#9ca3af' : '#999999' 
              }}>
                {searchTerm ? t('no users found search') : t('no users found filter')}
              </Typography>
            </Box>
          )}

        </Box>
      </Box>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingUser ? t('edit user') : t('add new user')}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label={t('username')}
              fullWidth
              variant="outlined"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
            <TextField
              margin="dense"
              label={t('email')}
              type="email"
              fullWidth
              variant="outlined"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <TextField
              margin="dense"
              label={t('first name')}
              fullWidth
              variant="outlined"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            />
            <TextField
              margin="dense"
              label={t('last name')}
              fullWidth
              variant="outlined"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            />
            <TextField
              margin="dense"
              label={t('phone number')}
              fullWidth
              variant="outlined"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <TextField
              margin="dense"
              label={t('password')}
              type="password"
              fullWidth
              variant="outlined"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!editingUser}
              helperText={editingUser ? t('leave blank to keep current password') : t('password required for new user')}
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>{t('role')}</InputLabel>
              <Select
                value={formData.role}
                label={t('role')}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <MenuItem value="client">{t('client')}</MenuItem>
                <MenuItem value="worker">{t('worker')}</MenuItem>
              </Select>
            </FormControl>
            {/* <FormControl fullWidth margin="dense">
              <InputLabel>{t('user type')}</InputLabel>
              <Select
                value={formData.is_staff}
                label={t('user type')}
                onChange={(e) => setFormData({ ...formData, is_staff: e.target.value })}
              >
                <MenuItem value={false}>{t('regular user')}</MenuItem>
                <MenuItem value={true}>{t('staff')}</MenuItem>
              </Select>
            </FormControl> */}
            <FormControl fullWidth margin="dense">
              <InputLabel>{t('status')}</InputLabel>
              <Select
                value={formData.is_active}
                label={t('status')}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.value })}
              >
                <MenuItem value={true}>{t('active')}</MenuItem>
                <MenuItem value={false}>{t('inactive')}</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>{t('cancel')}</Button>
            <Button type="submit" variant="contained">
              {editingUser ? t('update') : t('add')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

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
    </>
  );
};

export default UsersPage;
