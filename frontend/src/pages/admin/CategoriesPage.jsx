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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { categoriesApi } from '../../services/adminApiService';
import '../../styles/adminCommon.css';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchCategories();
  }, []);

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
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          إدارة التصنيفات
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
          sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
        >
          إضافة تصنيف جديد
        </Button>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>الاسم</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>الوصف</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>الحالة</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>تاريخ الإنشاء</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>الإجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id} hover>
                  <TableCell sx={{ fontWeight: 'medium' }}>{category.name}</TableCell>
                  <TableCell>
                    {category.description ? (
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {category.description}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.disabled">
                        لا يوجد وصف
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={category.is_active ? 'نشط' : 'غير نشط'}
                      color={category.is_active ? 'success' : 'default'}
                      size="small"
                      onClick={() => handleToggleActive(category)}
                      sx={{ cursor: 'pointer' }}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(category.created_at).toLocaleDateString('ar-SA')}
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Tooltip title="تعديل">
                      <IconButton
                        color="primary"
                        onClick={() => handleEdit(category)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="حذف">
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(category.id)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="اسم التصنيف"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="الوصف"
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
            <Button onClick={handleClose}>إلغاء</Button>
            <Button type="submit" variant="contained">
              {editingCategory ? 'تحديث' : 'إضافة'}
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
  );
};

export default CategoriesPage;
