import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Chip, Button, CircularProgress, Alert } from '@mui/material';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { adminApiService } from '../../services/adminApiService';

const CategoriesPage = () => {
  const { token } = useAdminAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    adminApiService
      .getCategories(token)
      .then(response => {
        setCategories(response.data);
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });
  }, [token]);

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Categories
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <Paper sx={{ padding: 2 }}>
          {categories.map(category => (
            <Chip key={category.id} label={category.name} sx={{ margin: 1 }} />
          ))}
        </Paper>
      )}
      {error && <Alert severity="error">{error}</Alert>}
    </Box>
  );
};

export default CategoriesPage;
