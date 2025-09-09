import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Chip, Button, CircularProgress, Alert } from '@mui/material';
import RateReviewIcon from '@mui/icons-material/RateReview';
import { reviewsApi } from '../../services/adminApiService';
import '../../styles/adminCommon.css';

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    reviewsApi.getReviews()
      .then((data) => {
        console.log('API /reviews/ data:', data);
        setReviews(data);
      })
      .catch(() => setError('فشل في تحميل التقييمات'))
      .finally(() => setLoading(false));
  }, []);

  const handleSoftDelete = async (id) => {
    try {
      await reviewsApi.softDeleteReview(id);
      setReviews(reviews => reviews.filter(r => r.id !== id));
    } catch {
      setError('فشل في حذف التقييم');
    }
  };

  if (loading) return <Box sx={{ p: 3, textAlign: 'center' }}><CircularProgress size={60} /><Typography sx={{ mt: 2 }}>جاري تحميل التقييمات...</Typography></Box>;

  return (
    <Box sx={{ p: { xs: 1, md: 3 }, pr: { xs: 1, md: 0 } }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2', mb: 3 }}>إدارة التقييمات</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {reviews.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <RateReviewIcon sx={{ color: '#7b1fa2', fontSize: 60, mb: 2 }} />
          <Typography variant="h6" color="textSecondary">لا توجد تقييمات نصية حتى الآن</Typography>
        </Box>
      ) : (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
          gap: 2.2,
        }}>
          {reviews.map((review) => (
            <Paper
              key={review.id}
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 5,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                boxShadow: '0 4px 24px #7b1fa222',
                background: '#fff',
                minHeight: 120,
                transition: 'box-shadow 0.22s, transform 0.22s',
                '&:hover': {
                  boxShadow: '0 8px 32px #7b1fa244',
                  transform: 'scale(1.025)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                <RateReviewIcon sx={{ color: '#7b1fa2', fontSize: 36, boxShadow: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, fontSize: 22 }}>{review.user_name || 'مستخدم'}</Typography>
              </Box>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1, fontSize: 16 }}>{review.text}</Typography>
              <Chip label={`تقييم: ${review.rating}`} color="info" size="medium" sx={{ fontWeight: 700, fontSize: 15 }} />
              <Button size="small" color="error" variant="contained" sx={{ mt: 1, borderRadius: 2, fontWeight: 700, px: 2, fontSize: 15, boxShadow: '0 2px 8px #e5393522' }} onClick={() => handleSoftDelete(review.id)}>حذف</Button>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ReviewsPage;
