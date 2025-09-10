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
  Menu as MenuIcon,
  Globe as GlobeIcon,
  Search as SearchIcon,
  Filter as FilterIcon,
  X as ClearIcon,
} from 'lucide-react';
import { servicesApi, categoriesApi } from '../../services/adminApiService';
import { useTranslation } from '../../hooks/useTranslation';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { useCustomTheme } from '../../contexts/ThemeContext';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import '../../styles/adminCommon.css';
import './AdminDashboard.css';

const ServicesPage = () => {
  const { t, toggleLanguage, currentLang } = useTranslation();
  const { user, isAuthenticated } = useAdminAuth();
  const { isDarkMode } = useCustomTheme();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filteredServices, setFilteredServices] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    is_active: true,
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // دالة ترجمة النصوص الديناميكية
  const translateServiceText = (text) => {
    // التحقق من أن text هو string
    if (!text || typeof text !== 'string') return text;
    
    // قائمة النصوص المعروفة وترجماتها
    const translations = {
      'خدمات كهربائي': t('services electrician'),
      'إصلاح الأجهزة الكهربائية': t('electrical appliance repair'),
      'خدمات سباكة': t('plumbing services'),
      'إصلاح وصيانة السباكة': t('plumbing repair and maintenance'),
      'خدمات سباك': t('plumber services'),
      'وصف الخدمة': t('service description'),
      'خدمات فني كهرباء': t('electrical technician services'),
      'كهرباء, إصلاح': t('electrical repair'),
      'خدمة مخصصة للطلب': t('custom service for request'),
      'دهان الشقق والمنازل والمكاتب بأفضل جودة - أحمد الدهان': t('apartment and house painting') + ' - ' + t('ahmed painter'),
      'دهان الشقق والمنازل والمكاتب بأفضل جودة - محمد الطلاء': t('apartment and house painting') + ' - ' + t('mohammed painter'),
      'ر.س': t('currency'),
    };

    // البحث عن الترجمة المطابقة
    for (const [arabic, english] of Object.entries(translations)) {
      if (text.includes(arabic)) {
        return text.replace(arabic, english);
      }
    }

    // إذا لم توجد ترجمة، إرجاع النص الأصلي
    return text;
  };

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, []);

  // فلترة الخدمات حسب البحث والتصنيف
  useEffect(() => {
    let filtered = services;

    // فلترة حسب البحث
    if (searchTerm) {
      filtered = filtered.filter(service => {
        const searchLower = searchTerm.toLowerCase();
        const name = service.name?.toString().toLowerCase() || '';
        const description = service.description?.toString().toLowerCase() || '';
        const category = service.category?.toString().toLowerCase() || '';
        
        return name.includes(searchLower) ||
               description.includes(searchLower) ||
               category.includes(searchLower);
      });
    }

    // فلترة حسب التصنيف
    if (selectedCategory) {
      filtered = filtered.filter(service =>
        service.category === selectedCategory
      );
    }

    setFilteredServices(filtered);
  }, [services, searchTerm, selectedCategory]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await servicesApi.getServices();
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
      showSnackbar('خطأ في تحميل الخدمات', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoriesApi.getCategories();
      if (response.success) {
        setCategories(response.data);
      } else {
        console.error('Error fetching categories:', response.error);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleClose = () => {
    setOpen(false);
    setEditingService(null);
    setFormData({ 
      name: '', 
      description: '', 
      price: '', 
      category: '', 
      is_active: true 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingService) {
        await servicesApi.updateService(editingService.id, formData);
        showSnackbar('تم تحديث الخدمة بنجاح');
      } else {
        await servicesApi.createService(formData);
        showSnackbar('تم إنشاء الخدمة بنجاح');
      }
      handleClose();
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      showSnackbar('خطأ في حفظ الخدمة', 'error');
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      price: service.price || '',
      category: service.category || '',
      is_active: service.is_active,
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الخدمة؟')) {
      try {
        await servicesApi.deleteService(id);
        showSnackbar('تم حذف الخدمة بنجاح');
        fetchServices();
      } catch (error) {
        console.error('Error deleting service:', error);
        showSnackbar('خطأ في حذف الخدمة', 'error');
      }
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
          // maxWidth: '1700px',
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            {/* <Box>
              <Typography variant="h4" sx={{ 
                fontWeight: 'bold', 
                mb: 1, 
                color: isDarkMode ? '#e5e7eb' : '#666666' 
              }}>
                {t('services management')}
              </Typography>
              <Typography variant="body1" sx={{ 
                color: isDarkMode ? '#9ca3af' : '#666666' 
              }}>
                {t('services management description')}
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
              {t('add new service')}
            </Button>
          </Box>

          {/* Search and Filter Bar */}
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            alignItems: 'center', 
            mb: 3,
            flexWrap: 'wrap'
          }}>
            {/* Search Bar */}
            <TextField
              placeholder={t('search services')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon size={20} style={{ marginRight: 8, color: isDarkMode ? '#9ca3af' : '#64748b' }} />,
                endAdornment: searchTerm && (
                  <IconButton
                    size="small"
                    onClick={() => setSearchTerm('')}
                    sx={{ color: isDarkMode ? '#9ca3af' : '#64748b' }}
                  >
                    <ClearIcon size={16} />
                  </IconButton>
                )
              }}
              sx={{
                minWidth: '250px',
                '& .MuiOutlinedInput-root': {
                  backgroundColor: isDarkMode ? 'rgba(17,24,39,0.9)' : 'rgba(255,255,255,0.9)',
                  border: isDarkMode ? '1px solid #1f2937' : '1px solid rgba(0,123,255,0.1)',
                  borderRadius: '8px',
                  '& fieldset': {
                    border: 'none',
                  },
                  '&:hover fieldset': {
                    border: 'none',
                  },
                  '&.Mui-focused fieldset': {
                    border: isDarkMode ? '1px solid #0077ff' : '1px solid #0077ff',
                  },
                },
                '& .MuiInputBase-input': {
                  color: isDarkMode ? '#e5e7eb' : '#1e293b',
                  '&::placeholder': {
                    color: isDarkMode ? '#9ca3af' : '#64748b',
                    opacity: 1,
                  },
                },
              }}
            />

            {/* Category Filter */}
            <FormControl sx={{ minWidth: '200px' }}>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                displayEmpty
                startAdornment={<FilterIcon size={20} style={{ marginRight: 8, color: isDarkMode ? '#9ca3af' : '#64748b' }} />}
                sx={{
                  backgroundColor: isDarkMode ? 'rgba(17,24,39,0.9)' : 'rgba(255,255,255,0.9)',
                  border: isDarkMode ? '1px solid #1f2937' : '1px solid rgba(0,123,255,0.1)',
                  borderRadius: '8px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    border: 'none',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    border: isDarkMode ? '1px solid #0077ff' : '1px solid #0077ff',
                  },
                  '& .MuiSelect-select': {
                    color: isDarkMode ? '#e5e7eb' : '#1e293b',
                  },
                }}
              >
                <MenuItem value="">
                  <em>{t('all categories')}</em>
                </MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.name}>
                    {translateServiceText(category.name)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Clear Filters Button */}
            {(searchTerm || selectedCategory) && (
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                }}
                sx={{
                  borderRadius: '8px',
                  borderColor: isDarkMode ? '#1f2937' : 'rgba(0,123,255,0.2)',
                  color: isDarkMode ? '#9ca3af' : '#64748b',
                  '&:hover': {
                    borderColor: isDarkMode ? '#374151' : 'rgba(0,123,255,0.4)',
                    backgroundColor: isDarkMode ? 'rgba(31,41,55,0.1)' : 'rgba(0,123,255,0.05)',
                  },
                }}
              >
                {t('clear filters')}
              </Button>
            )}
          </Box>

          {/* Services Grid */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { 
              xs: '1fr', 
              sm: 'repeat(2, 1fr)', 
              md: 'repeat(3, 1fr)', 
              lg: 'repeat(4, 1fr)' 
            }, 
            gap: 2.5,
            mt: 2
          }}>
            {filteredServices.map((service) => (
              <Card
                key={service.id}
                sx={{
                  minWidth: '280px',
                  maxWidth: '320px',
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
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0,123,255,0.15)',
                  }
                }}
              >
                <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Service Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 600, 
                      color: isDarkMode ? '#e5e7eb' : '#1e293b', 
                      fontSize: '0.9rem' 
                    }}>
                      {translateServiceText(service.name)}
                    </Typography>
                    <Chip
                      label={service.is_active ? t('active') : t('inactive')}
                      size="small"
                      sx={{ 
                        borderRadius: '6px', 
                        fontSize: '0.7rem',
                        backgroundColor: service.is_active ? '#0077ff' : '#e5e7eb',
                        color: service.is_active ? 'white' : '#6b7280'
                      }}
                    />
                  </Box>

                  {/* Service Details */}
                  <Box sx={{ mb: 2, flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ 
                        color: isDarkMode ? '#9ca3af' : '#64748b', 
                        fontSize: '0.8rem' 
                      }}>
                        {t('service description')}:
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        fontWeight: 500, 
                        color: isDarkMode ? '#e5e7eb' : '#1e293b', 
                        fontSize: '0.8rem' 
                      }}>
                        {translateServiceText(service.description) || t('not specified')}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ 
                        color: isDarkMode ? '#9ca3af' : '#64748b', 
                        fontSize: '0.8rem' 
                      }}>
                        {t('service price')}:
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        fontWeight: 500, 
                        color: isDarkMode ? '#e5e7eb' : '#1e293b', 
                        fontSize: '0.8rem' 
                      }}>
                        {service.price ? `${service.price} ${t('currency')}` : t('not specified')}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ 
                        color: isDarkMode ? '#9ca3af' : '#64748b', 
                        fontSize: '0.8rem' 
                      }}>
                        {t('service category')}:
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        fontWeight: 500, 
                        color: isDarkMode ? '#e5e7eb' : '#1e293b', 
                        fontSize: '0.8rem' 
                      }}>
                        {translateServiceText(service.category) || t('not specified')}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ 
                        color: isDarkMode ? '#9ca3af' : '#64748b', 
                        fontSize: '0.8rem' 
                      }}>
                        {t('service status')}:
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        fontWeight: 500, 
                        color: isDarkMode ? '#e5e7eb' : '#1e293b', 
                        fontSize: '0.8rem' 
                      }}>
                        {service.is_active ? t('active') : t('inactive')}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 'auto' }}>
                    {/* <Tooltip title={t('view service')}>
                      <IconButton 
                        size="small"
                        sx={{ 
                          color: '#0077ff',
                          '&:hover': { background: 'rgba(0,123,255,0.1)' }
                        }}
                      >
                        <ViewIcon size={16} />
                      </IconButton>
                    </Tooltip> */}
                    <Tooltip title={t('edit service')}>
                      <IconButton 
                        size="small"
                        onClick={() => handleEdit(service)} 
                        sx={{ 
                          color: '#0077ff',
                          '&:hover': { background: 'rgba(0,123,255,0.1)' }
                        }}
                      >
                        <EditIcon size={16} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('delete service')}>
                      <IconButton 
                        size="small"
                        onClick={() => handleDelete(service.id)} 
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
            ))}
          </Box>

          {/* No Results Message */}
          {filteredServices && filteredServices.length === 0 && !loading && (
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
                {(searchTerm || selectedCategory) ? t('no services found filter') : t('no services found')}
              </Typography>
            </Box>
          )}

        </Box>
      </Box>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingService ? t('edit service') : t('add new service')}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label={t('service name')}
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <TextField
              margin="dense"
              label={t('service description')}
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <TextField
              margin="dense"
              label={t('service price')}
              type="number"
              fullWidth
              variant="outlined"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>{t('service category')}</InputLabel>
              <Select
                value={formData.category}
                label={t('service category')}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.name}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense">
              <InputLabel>{t('service status')}</InputLabel>
              <Select
                value={formData.is_active}
                label={t('service status')}
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
              {editingService ? t('update') : t('add')}
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

export default ServicesPage;