import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import LocationPicker from '../components/LocationPicker';
import { authService } from '../services/authService';
import './WorkerProfileCompletion.css';

const WorkerProfileCompletion = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [formData, setFormData] = useState({
    experience_years: '',
    hourly_rate: '',
    description: '',
    specializations: [],
    availability_hours: {
      start: '09:00',
      end: '17:00'
    }
  });

  // Check if user is logged in and is a worker
  useEffect(() => {
    const checkUserAndRedirect = async () => {
      try {
        // تحقق من المصادقة أولاً
        const isAuthenticated = await authService.isAuthenticated();
        if (!isAuthenticated) {
          navigate('/auth');
          return;
        }
        
        // احصل على بيانات المستخدم
        const userData = authService.getCurrentUser();
        if (!userData) {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            authService.saveUserToStorage(JSON.parse(storedUser));
          } else {
            navigate('/auth');
            return;
          }
        }
        
        const finalUserData = authService.getCurrentUser();
        
        // تحقق إذا كان المستخدم worker ولم يكمل ملفه
        if (finalUserData.role === 'worker' && !finalUserData.profile_completed) {
          // ابقى في هذه الصفحة ليكمال الملف
          return;
        }
        
        // إذا كان ليس worker أو أكمل الملف، وجهه للصفحة المناسبة
        navigate(finalUserData.role === 'worker' ? '/homeProvider' : '/');
        
      } catch (error) {
        console.error('Error checking user:', error);
        navigate('/auth');
      }
    };
    
    checkUserAndRedirect();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSpecializationChange = (e) => {
    const value = e.target.value;
    const isChecked = e.target.checked;
    
    setFormData(prev => ({
      ...prev,
      specializations: isChecked 
        ? [...prev.specializations, value]
        : prev.specializations.filter(spec => spec !== value)
    }));
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedLocation) {
      toast.error(i18n.language === 'ar' ? 'يرجى تحديد موقعك' : 'Please select your location');
      return;
    }

    if (!formData.experience_years || !formData.hourly_rate || !formData.description) {
      toast.error(i18n.language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const profileData = {
        ...formData,
        location: selectedLocation,
        experience_years: parseInt(formData.experience_years),
        hourly_rate: parseFloat(formData.hourly_rate)
      };

      const result = await authService.completeWorkerProfile(profileData);
      
      if (result.success) {
        toast.success(i18n.language === 'ar' ? 
          'تم إكمال الملف الشخصي بنجاح!' : 
          'Profile completed successfully!');
        
        // تحديث بيانات المستخدم
        const userData = authService.getCurrentUser();
        if (userData) {
          userData.profile_completed = true;
          authService.saveUserToStorage(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        }
        
        // الانتقال للصفحة المناسبة بعد ثانيتين
        setTimeout(() => {
          navigate('/homeProvider');
        }, 2000);
        
      } else {
        toast.error(result.message || (i18n.language === 'ar' ? 
          'فشل في إكمال الملف الشخصي' : 
          'Failed to complete profile'));
      }
    } catch (error) {
      console.error('Profile completion error:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.message || 
                          (i18n.language === 'ar' ? 
                           'حدث خطأ أثناء إكمال الملف الشخصي' : 
                           'Error completing profile');
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const specializations = [
    { value: 'plumbing', label: i18n.language === 'ar' ? 'سباكة' : 'Plumbing' },
    { value: 'electrical', label: i18n.language === 'ar' ? 'كهرباء' : 'Electrical' },
    { value: 'carpentry', label: i18n.language === 'ar' ? 'نجارة' : 'Carpentry' },
    { value: 'painting', label: i18n.language === 'ar' ? 'دهان' : 'Painting' },
    { value: 'cleaning', label: i18n.language === 'ar' ? 'تنظيف' : 'Cleaning' },
    { value: 'appliance_repair', label: i18n.language === 'ar' ? 'إصلاح الأجهزة' : 'Appliance Repair' },
    { value: 'gardening', label: i18n.language === 'ar' ? 'بستنة' : 'Gardening' },
    { value: 'moving', label: i18n.language === 'ar' ? 'نقل' : 'Moving' }
  ];

  return (
    <div className="worker-profile-completion" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="container">
        <div className="profile-completion-card">
          <div className="card-header">
            <h1 className="title">
              {i18n.language === 'ar' ? 'إكمال الملف الشخصي' : 'Complete Your Profile'}
            </h1>
            <p className="subtitle">
              {i18n.language === 'ar' 
                ? 'أكمل ملفك الشخصي لبدء تقديم الخدمات للعملاء' 
                : 'Complete your profile to start providing services to clients'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-section">
              <h2 className="section-title">
                {i18n.language === 'ar' ? 'المعلومات الأساسية' : 'Basic Information'}
              </h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    {i18n.language === 'ar' ? 'سنوات الخبرة *' : 'Years of Experience *'}
                  </label>
                  <input
                    type="number"
                    name="experience_years"
                    value={formData.experience_years}
                    onChange={handleInputChange}
                    className="form-input"
                    min="0"
                    max="50"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    {i18n.language === 'ar' ? 'السعر بالساعة (جنيه) *' : 'Hourly Rate (EGP) *'}
                  </label>
                  <input
                    type="number"
                    name="hourly_rate"
                    value={formData.hourly_rate}
                    onChange={handleInputChange}
                    className="form-input"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  {i18n.language === 'ar' ? 'وصف الخدمات *' : 'Service Description *'}
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-textarea"
                  rows="4"
                  placeholder={i18n.language === 'ar' 
                    ? 'اكتب وصفاً مفصلاً عن خدماتك وخبرتك...' 
                    : 'Write a detailed description of your services and experience...'
                  }
                  required
                />
              </div>
            </div>

            <div className="form-section">
              <h2 className="section-title">
                {i18n.language === 'ar' ? 'التخصصات' : 'Specializations'}
              </h2>
              <div className="specializations-grid">
                {specializations.map(spec => (
                  <label key={spec.value} className="checkbox-label">
                    <input
                      type="checkbox"
                      value={spec.value}
                      checked={formData.specializations.includes(spec.value)}
                      onChange={handleSpecializationChange}
                      className="checkbox-input"
                    />
                    <span className="checkbox-text">{spec.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-section">
              <h2 className="section-title">
                {i18n.language === 'ar' ? 'ساعات العمل' : 'Working Hours'}
              </h2>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    {i18n.language === 'ar' ? 'من' : 'From'}
                  </label>
                  <input
                    type="time"
                    name="availability_hours.start"
                    value={formData.availability_hours.start}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    {i18n.language === 'ar' ? 'إلى' : 'To'}
                  </label>
                  <input
                    type="time"
                    name="availability_hours.end"
                    value={formData.availability_hours.end}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2 className="section-title">
                {i18n.language === 'ar' ? 'موقع العمل *' : 'Work Location *'}
              </h2>
              <p className="location-hint">
                {i18n.language === 'ar' 
                  ? 'انقر على الخريطة لتحديد موقع عملك أو استخدم زر "الموقع الحالي"' 
                  : 'Click on the map to select your work location or use "Current Location" button'
                }
              </p>
              <LocationPicker onLocationSelect={handleLocationSelect} height={400} />
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn btn-secondary"
                disabled={isLoading}
              >
                {i18n.language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading 
                  ? (i18n.language === 'ar' ? 'جاري الحفظ...' : 'Saving...')
                  : (i18n.language === 'ar' ? 'إكمال الملف الشخصي' : 'Complete Profile')
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WorkerProfileCompletion;
