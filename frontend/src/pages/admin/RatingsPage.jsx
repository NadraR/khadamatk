import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Chip, CircularProgress, Alert } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { ratingsApi } from '../../services/adminApiService';
import '../../styles/adminCommon.css';

const RatingsPage = () => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    ratingsApi.getRatings()
      .then(setRatings)
      .catch(() => setError('فشل في تحميل التقييمات'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ p: 3, textAlign: 'center' }}><CircularProgress size={60} /><Typography sx={{ mt: 2 }}>جاري تحميل التقييمات...</Typography></Box>;

  return (
    <Box sx={{ p: { xs: 1, md: 3 }, pr: { xs: 1, md: 0 } }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2', mb: 3 }}>كل التقييمات الرقمية</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {ratings.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <StarIcon sx={{ color: '#ffb300', fontSize: 60, mb: 2 }} />
          <Typography variant="h6" color="textSecondary">لا توجد تقييمات رقمية حتى الآن</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
          {ratings.map((rating) => (
            <Paper key={rating.id} sx={{ p: 2.5, borderRadius: 4, display: 'flex', flexDirection: 'column', gap: 1.5, minHeight: 100 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <StarIcon sx={{ color: '#ffb300', fontSize: 32 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{rating.user_name || 'مستخدم'}</Typography>
              </Box>
              <Chip label={`تقييم: ${rating.score}`} color="info" size="small" sx={{ mt: 1 }} />
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default RatingsPage;
