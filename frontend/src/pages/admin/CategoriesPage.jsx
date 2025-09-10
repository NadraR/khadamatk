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
  useTheme,
  useMediaQuery,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Plus as AddIcon,
  Edit as EditIcon,
  Trash2 as DeleteIcon,
  Eye as ViewIcon,
  Search as SearchIcon,
  Filter as FilterIcon,
  X as ClearIcon,
} from 'lucide-react';
import { categoriesApi } from '../../services/adminApiService';
import { useTranslation } from '../../hooks/useTranslation';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { useCustomTheme } from '../../contexts/ThemeContext';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import '../../styles/adminCommon.css';

const CategoriesPage = () => {
  const { t, toggleLanguage, currentLang } = useTranslation();
  const { user, isAuthenticated } = useAdminAuth();
  const { isDarkMode } = useCustomTheme();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // دالة ترجمة النصوص الديناميكية
  const translateCategoryText = (text) => {
    // التحقق من أن text هو string
    if (!text || typeof text !== 'string') return text;
    
    // قائمة النصوص المعروفة وترجماتها
    const translations = {
      'بلاط': t('بلاط'),
      'تركيب أثاث': t('تركيب أثاث'),
      'تكييف': t('تكييف'),
      'تنظيف': t('تنظيف'),
      'جص': t('جص'),
      'حدادة': t('حدادة'),
      'دهان': t('دهان'),
      'خدمات عامة': t('خدمات عامة'),
      'صيانة أجهزة': t('صيانة أجهزة'),
      'سباكة': t('سباكة'),
      'نجارة': t('نجارة'),
      'كهرباء': t('كهرباء'),
      'نقل أثاث': t('نقل أثاث'),
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
    fetchCategories();
  }, []);

  // فلترة التصنيفات حسب البحث
  useEffect(() => {
    let filtered = categories;

    // فلترة حسب البحث
    if (searchTerm) {
      filtered = filtered.filter(category => {
        const searchLower = searchTerm.toLowerCase();
        const name = category.name?.toString().toLowerCase() || '';
        const description = category.description?.toString().toLowerCase() || '';
        
        return name.includes(searchLower) ||
               description.includes(searchLower);
      });
    }

    setFilteredCategories(filtered);
  }, [categories, searchTerm]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoriesApi.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      showSnackbar('خطأ في تحميل التصنيفات', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleClose = () => {
    setOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '', is_active: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await categoriesApi.updateCategory(editingCategory.id, formData);
        showSnackbar('تم تحديث التصنيف بنجاح');
      } else {
        await categoriesApi.createCategory(formData);
        showSnackbar('تم إنشاء التصنيف بنجاح');
      }
      handleClose();
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      showSnackbar('خطأ في حفظ التصنيف', 'error');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      is_active: category.is_active,
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا التصنيف؟')) {
      try {
        await categoriesApi.deleteCategory(id);
        showSnackbar('تم حذف التصنيف بنجاح');
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        showSnackbar('خطأ في حذف التصنيف', 'error');
      }
    }
  };

  const handleToggleActive = async (category) => {
    try {
      await categoriesApi.updateCategory(category.id, {
        ...category,
        is_active: !category.is_active,
      });
      showSnackbar('تم تحديث حالة التصنيف بنجاح');
      fetchCategories();
    } catch (error) {
      console.error('Error toggling category status:', error);
      showSnackbar('خطأ في تحديث حالة التصنيف', 'error');
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
                {t('categories management')}
              </Typography>
              <Typography variant="body1" sx={{ 
                color: isDarkMode ? '#9ca3af' : '#666666' 
              }}>
                {t('categories management description')}
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
              {t('add new category')}
            </Button>
          </Box>

          {/* Search Bar */}
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            alignItems: 'center', 
            mb: 3,
            flexWrap: 'wrap'
          }}>
            {/* Search Bar */}
            <TextField
              placeholder={t('search categories')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon size={20} style={{ marginRight: 8, color: isDarkMode ? '#9ca3af' : '#64748b',borderRadius: '12px' ,boxShadow: ' rgba(172, 203, 236'}} />,
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
                  borderRadius: '16px',
                  boxShadow: isDarkMode 
                    ? '0 4px 12px rgba(0,123,255,0.15)' 
                    : '0 4px 12px rgba(0,123,255,0.1)',
                  '& fieldset': {
                    border: 'none',
                  },
                  '&:hover fieldset': {
                    border: 'none',
                  },
                  '&:hover': {
                    boxShadow: isDarkMode 
                      ? '0 6px 16px rgba(0,123,255,0.2)' 
                      : '0 6px 16px rgba(0,123,255,0.15)',
                  },
                  '&.Mui-focused fieldset': {
                    border: isDarkMode ? '1px solid #0077ff' : '1px solid #0077ff',
                  },
                  '&.Mui-focused': {
                    boxShadow: isDarkMode 
                      ? '0 8px 20px rgba(0,123,255,0.25)' 
                      : '0 8px 20px rgba(0,123,255,0.2)',
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

            {/* Clear Search Button */}
            {searchTerm && (
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={() => setSearchTerm('')}
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
                {t('clear search')}
              </Button>
            )}
          </Box>

          {/* Categories Grid */}
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
            {filteredCategories.map((category) => (
              <Card
                key={category.id}
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
                  {/* Category Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 600, 
                      color: isDarkMode ? '#e5e7eb' : '#1e293b', 
                      fontSize: '0.9rem' 
                    }}>
                      {translateCategoryText(category.name)}
                    </Typography>
                    <Chip
                      label={category.is_active ? t('active') : t('inactive')}
                      size="small"
                      sx={{ 
                        borderRadius: '6px', 
                        fontSize: '0.7rem',
                        backgroundColor: category.is_active ? '#0077ff' : '#e5e7eb',
                        color: category.is_active ? 'white' : '#6b7280'
                      }}
                    />
                  </Box>

                  {/* Category Details */}
                  <Box sx={{ mb: 2, flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ 
                        color: isDarkMode ? '#9ca3af' : '#64748b', 
                        fontSize: '0.8rem' 
                      }}>
                        {t('category description')}:
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        fontWeight: 500, 
                        color: isDarkMode ? '#e5e7eb' : '#1e293b', 
                        fontSize: '0.8rem' 
                      }}>
                        {translateCategoryText(category.description) || t('not specified')}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ 
                        color: isDarkMode ? '#9ca3af' : '#64748b', 
                        fontSize: '0.8rem' 
                      }}>
                        {t('created date')}:
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        fontWeight: 500, 
                        color: isDarkMode ? '#e5e7eb' : '#1e293b', 
                        fontSize: '0.8rem' 
                      }}>
                        {new Date(category.created_at).toLocaleDateString('ar-SA')}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ 
                        color: isDarkMode ? '#9ca3af' : '#64748b', 
                        fontSize: '0.8rem' 
                      }}>
                        {t('category status')}:
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        fontWeight: 500, 
                        color: isDarkMode ? '#e5e7eb' : '#1e293b', 
                        fontSize: '0.8rem' 
                      }}>
                        {category.is_active ? t('active') : t('inactive')}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 'auto' }}>
                    {/* <Tooltip title={t('view category')}>
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
                    <Tooltip title={t('edit category')}>
                      <IconButton 
                        size="small"
                        onClick={() => handleEdit(category)} 
                        sx={{ 
                          color: '#0077ff',
                          '&:hover': { background: 'rgba(0,123,255,0.1)' }
                        }}
                      >
                        <EditIcon size={16} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('delete category')}>
                      <IconButton 
                        size="small"
                        onClick={() => handleDelete(category.id)} 
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
          {filteredCategories && filteredCategories.length === 0 && !loading && (
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
                {searchTerm ? t('no categories found filter') : t('no categories found')}
              </Typography>
            </Box>
          )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory ? t('edit category') : t('add new category')}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label={t('category name')}
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label={t('category description')}
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              sx={{ mb: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>{t('cancel')}</Button>
            <Button type="submit" variant="contained">
              {editingCategory ? t('update') : t('add')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
        </Box>
      </Box>
    </>
  );
};

export default CategoriesPage;
