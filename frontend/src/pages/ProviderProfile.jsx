import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Avatar,
  Rating,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  IconButton
} from '@mui/material';
import {
  Person as PersonIcon,
  Work as WorkIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  AccessTime as TimeIcon,
  Assignment as AssignmentIcon,
  AttachMoney as MoneyIcon,
  BusinessCenter as BusinessIcon,
  CalendarToday as CalendarIcon,
  ArrowBack as ArrowBackIcon,
  WhatsApp as WhatsAppIcon,
  Message as MessageIcon
} from '@mui/icons-material';
import providerService from '../services/ProviderService';
import Navbar from '../components/Navbar';

const ProviderProfile = () => {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProviderProfile();
  }, [providerId]);

  const loadProviderProfile = async () => {
    try {
      setLoading(true);
      const result = await providerService.getProviderProfile(providerId);
      
      if (result.success) {
        console.log('[DEBUG] Provider profile response:', result.data);
        setProvider(result.data);
        setError(null);
      } else {
        console.error('Error loading provider profile:', result.error);
        setError(result.error);
      }
    } catch (error) {
      console.error('Error loading provider profile:', error);
      setError('فشل في تحميل ملف مقدم الخدمة');
    } finally {
      setLoading(false);
    }
  };

  const getProviderName = () => {
    if (!provider) return 'مقدم خدمة';
    
    if (provider.first_name && provider.last_name) {
      return `${provider.first_name} ${provider.last_name}`;
    }
    
    if (provider.first_name) {
      return provider.first_name;
    }
    
    return provider.username || 'مقدم خدمة';
  };

  const handleWhatsAppContact = () => {
    if (provider?.phone) {
      const message = `مرحباً، أود الاستفسار عن خدماتك`;
      providerService.contactViaWhatsApp(provider.phone, message);
    }
  };

  const handleStartChat = () => {
    // Navigate to chat page or open chat modal
    navigate(`/chat/provider/${providerId}`);
  };

  const handleBookService = (serviceId) => {
    navigate(`/service/${serviceId}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          variant="outlined"
        >
          العودة
        </Button>
      </Container>
    );
  }

  if (!provider) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">
          مقدم الخدمة غير موجود
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          variant="outlined"
          sx={{ mt: 2 }}
        >
          العودة
        </Button>
      </Container>
    );
  }

  return (
    <div dir="rtl">
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            variant="outlined"
            sx={{ mb: 2 }}
          >
            العودة
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Provider Info Card */}
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '2rem'
                }}
              >
                {getProviderName().charAt(0)}
              </Avatar>
              
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {getProviderName()}
              </Typography>
              
              {provider.profile?.job_title && (
                <Typography variant="h6" color="primary" gutterBottom>
                  {provider.profile.job_title}
                </Typography>
              )}
              
              {provider.profile?.neighborhood && (
                <Box display="flex" alignItems="center" justifyContent="center" sx={{ mb: 2 }}>
                  <LocationIcon color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {provider.profile.neighborhood}
                  </Typography>
                </Box>
              )}

              {/* Rating */}
              <Box sx={{ mb: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="center" sx={{ mb: 1 }}>
                  <Rating
                    value={provider.rating?.average_rating || 0}
                    precision={0.1}
                    readOnly
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="h6" color="warning.main">
                    {provider.rating?.average_rating?.toFixed(1) || '0.0'}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  ({provider.rating?.total_ratings || 0} تقييم)
                </Typography>
              </Box>

              {/* Contact Buttons */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {provider.phone && (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<WhatsAppIcon />}
                    onClick={handleWhatsAppContact}
                    fullWidth
                  >
                    تواصل عبر واتساب
                  </Button>
                )}
                
                <Button
                  variant="outlined"
                  startIcon={<MessageIcon />}
                  onClick={handleStartChat}
                  fullWidth
                >
                  بدء محادثة
                </Button>
              </Box>

              {/* Stats */}
              <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Grid container spacing={2} textAlign="center">
                  <Grid item xs={6}>
                    <Typography variant="h6" color="primary">
                      {provider.stats?.completed_orders || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      طلبات مكتملة
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h6" color="primary">
                      {provider.stats?.member_since || new Date().getFullYear()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      عضو منذ
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>

          {/* Details and Services */}
          <Grid item xs={12} md={8}>
            {/* Provider Details */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon sx={{ mr: 1 }} />
                معلومات مقدم الخدمة
              </Typography>
              
              <Grid container spacing={2}>
                {provider.profile?.experience_years && (
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center">
                      <TimeIcon color="action" sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          سنوات الخبرة
                        </Typography>
                        <Typography variant="body1">
                          {provider.profile.experience_years} سنة
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}

                {provider.profile?.hourly_rate && (
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center">
                      <MoneyIcon color="action" sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          السعر بالساعة
                        </Typography>
                        <Typography variant="body1" color="success.main" fontWeight="bold">
                          {provider.profile.hourly_rate} ج.م
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}

                {provider.profile?.skills && (
                  <Grid item xs={12}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        المهارات
                      </Typography>
                      <Typography variant="body1">
                        {provider.profile.skills}
                      </Typography>
                    </Box>
                  </Grid>
                )}

                {provider.profile?.services_provided && (
                  <Grid item xs={12}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        الخدمات المقدمة
                      </Typography>
                      <Typography variant="body1">
                        {provider.profile.services_provided}
                      </Typography>
                    </Box>
                  </Grid>
                )}

                {provider.profile?.certifications && (
                  <Grid item xs={12}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        الشهادات والمؤهلات
                      </Typography>
                      <Typography variant="body1">
                        {provider.profile.certifications}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Paper>

            {/* Services */}
            {provider.services && provider.services.length > 0 && (
              <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <BusinessIcon sx={{ mr: 1 }} />
                  الخدمات المتاحة ({provider.services.length})
                </Typography>
                
                <Grid container spacing={2}>
                  {provider.services.map((service) => (
                    <Grid item xs={12} sm={6} key={service.id}>
                      <Card 
                        variant="outlined" 
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { 
                            boxShadow: 2,
                            borderColor: 'primary.main'
                          }
                        }}
                        onClick={() => handleBookService(service.id)}
                      >
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {service.title}
                          </Typography>
                          
                          {service.description && (
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {service.description}
                            </Typography>
                          )}
                          
                          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
                            {service.category && (
                              <Chip 
                                label={service.category.name} 
                                size="small" 
                                color="primary" 
                                variant="outlined" 
                              />
                            )}
                            
                            <Typography variant="h6" color="success.main" fontWeight="bold">
                              {service.price} ج.م
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            )}

            {/* Reviews */}
            {provider.rating?.recent_reviews && provider.rating.recent_reviews.length > 0 && (
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <StarIcon sx={{ mr: 1 }} />
                  آراء العملاء
                </Typography>
                
                <List>
                  {provider.rating.recent_reviews.map((review, index) => (
                    <React.Fragment key={review.id}>
                      <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                              <Typography variant="subtitle2" sx={{ mr: 2 }}>
                                {review.client_name}
                              </Typography>
                              <Rating value={review.rating} size="small" readOnly />
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography variant="body2" color="text.primary">
                                {review.comment}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                {review.service_name} • {new Date(review.created_at).toLocaleDateString('ar-SA')}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                      {index < provider.rating.recent_reviews.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default ProviderProfile;
