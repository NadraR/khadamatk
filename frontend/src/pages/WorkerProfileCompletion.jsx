import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import LocationPicker from '../components/LocationPicker';
import { authService } from '../services/authService';
import apiService from '../services/ApiService';
import { FaUser, FaClock, FaMapMarkerAlt, FaTools, FaStar, FaSpinner, FaCheck } from 'react-icons/fa';
import './WorkerProfileCompletion.css';

const WorkerProfileCompletion = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [neighborhood, setNeighborhood] = useState('');
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    job_title: '',
    experience_years: '',
    hourly_rate: '',
    description: '',
    skills: [],
    services_provided: '',
    estimated_price: '',
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
        
        // إذا لم يكن worker، وجهه للصفحة الرئيسية
        if (finalUserData.role !== 'worker') {
          navigate('/');
          return;
        }
        
        // تحقق من اكتمال الملف الشخصي للعامل
        const profileCompleted = await checkWorkerProfileCompletion(finalUserData);
        
        if (profileCompleted) {
          // إذا كان الملف مكتمل، وجهه لصفحة مزود الخدمة
          navigate('/homeProvider');
        } else {
          // إذا لم يكن الملف مكتمل، ابقى في هذه الصفحة
          console.log('[DEBUG] Worker profile incomplete, staying on completion page');
        }
        
      } catch (error) {
        console.error('Error checking user:', error);
        navigate('/auth');
      }
    };
    
    checkUserAndRedirect();
  }, [navigate]);

  // Function to check if worker profile is truly complete
  const checkWorkerProfileCompletion = async (userData) => {
    try {
      // First check the local flag
      if (!userData.profile_completed) {
        return false;
      }
      
      // Then check the server for actual profile data
      const response = await authService.checkProfileCompletion();
      if (!response) {
        return false;
      }
      
      // Additionally, check if worker has essential profile data
      try {
        const profileResponse = await apiService.get(`/api/accounts/user/${userData.id}/profile/`);
        const profile = profileResponse.worker_profile || profileResponse;
        
        // Check if essential fields are filled
        const hasJobTitle = profile.job_title && profile.job_title.trim();
        const hasSkills = profile.skills && profile.skills.trim();
        const hasServices = profile.services_provided && profile.services_provided.trim();
        const hasExperience = profile.experience_years !== null && profile.experience_years !== undefined;
        const hasRate = profile.hourly_rate !== null && profile.hourly_rate !== undefined;
        
        console.log('[DEBUG] Profile check:', {
          hasJobTitle,
          hasSkills,
          hasServices,
          hasExperience,
          hasRate,
          profile
        });
        
        // Profile is complete if user has job title, skills, and services
        return hasJobTitle && hasSkills && hasServices;
        
      } catch (profileError) {
        console.warn('[DEBUG] Could not fetch profile details:', profileError);
        // If we can't fetch profile details, assume incomplete
        return false;
      }
      
    } catch (error) {
      console.error('Error checking profile completion:', error);
      return false;
    }
  };

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

  const handleSkillChange = (e) => {
    const value = e.target.value;
    const isChecked = e.target.checked;
    
    setFormData(prev => ({
      ...prev,
      skills: isChecked 
        ? [...prev.skills, value]
        : prev.skills.filter(skill => skill !== value)
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.job_title.trim()) {
        newErrors.job_title = i18n.language === 'ar' ? 'المسمى الوظيفي مطلوب' : 'Job title is required';
      }
      if (!formData.experience_years) {
        newErrors.experience_years = i18n.language === 'ar' ? 'سنوات الخبرة مطلوبة' : 'Experience years is required';
      } else if (formData.experience_years < 0 || formData.experience_years > 50) {
        newErrors.experience_years = i18n.language === 'ar' ? 'سنوات الخبرة يجب أن تكون بين 0 و 50' : 'Experience years must be between 0 and 50';
      }
      if (!formData.hourly_rate) {
        newErrors.hourly_rate = i18n.language === 'ar' ? 'السعر بالساعة مطلوب' : 'Hourly rate is required';
      } else if (formData.hourly_rate <= 0) {
        newErrors.hourly_rate = i18n.language === 'ar' ? 'السعر يجب أن يكون أكبر من صفر' : 'Hourly rate must be greater than 0';
      }
    }
    
    if (step === 2) {
      if (!formData.description.trim()) {
        newErrors.description = i18n.language === 'ar' ? 'وصف الخدمات مطلوب' : 'Service description is required';
      } else if (formData.description.trim().length < 50) {
        newErrors.description = i18n.language === 'ar' ? 'وصف الخدمات يجب أن يكون 50 حرف على الأقل' : 'Service description must be at least 50 characters';
      }
      if (formData.skills.length === 0) {
        newErrors.skills = i18n.language === 'ar' ? 'يجب اختيار مهارة واحدة على الأقل' : 'Please select at least one skill';
      }
    }
    
    if (step === 3) {
      if (!selectedLocation && !neighborhood.trim()) {
        newErrors.location = i18n.language === 'ar' ? 'يرجى تحديد موقعك على الخريطة أو كتابة الحي' : 'Please select your location on map or enter your neighborhood';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all steps
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      toast.error(i18n.language === 'ar' ? 'يرجى إكمال جميع الحقول المطلوبة' : 'Please complete all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const profileData = {
        job_title: formData.job_title.trim(),
        experience_years: parseInt(formData.experience_years),
        hourly_rate: parseFloat(formData.hourly_rate),
        skills: formData.skills.join(', '),
        services_provided: formData.description.trim(),
        estimated_price: formData.estimated_price ? parseFloat(formData.estimated_price) : null,
        location: selectedLocation,
        neighborhood: neighborhood.trim()
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

  const availableSkills = [
    { value: 'plumbing', label: i18n.language === 'ar' ? 'سباكة' : 'Plumbing' },
    { value: 'electrical', label: i18n.language === 'ar' ? 'كهرباء' : 'Electrical' },
    { value: 'carpentry', label: i18n.language === 'ar' ? 'نجارة' : 'Carpentry' },
    { value: 'painting', label: i18n.language === 'ar' ? 'دهان' : 'Painting' },
    { value: 'cleaning', label: i18n.language === 'ar' ? 'تنظيف' : 'Cleaning' },
    { value: 'appliance_repair', label: i18n.language === 'ar' ? 'إصلاح الأجهزة' : 'Appliance Repair' },
    { value: 'gardening', label: i18n.language === 'ar' ? 'بستنة' : 'Gardening' },
    { value: 'moving', label: i18n.language === 'ar' ? 'نقل' : 'Moving' },
    { value: 'hvac', label: i18n.language === 'ar' ? 'تكييف وتدفئة' : 'HVAC' },
    { value: 'flooring', label: i18n.language === 'ar' ? 'الأرضيات' : 'Flooring' },
    { value: 'roofing', label: i18n.language === 'ar' ? 'الأسقف' : 'Roofing' },
    { value: 'landscaping', label: i18n.language === 'ar' ? 'تنسيق الحدائق' : 'Landscaping' }
  ];

  const renderStepIndicator = () => (
    <div className="step-indicator">
      {[1, 2, 3].map(step => (
        <div key={step} className={`step ${currentStep >= step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}>
          <div className="step-circle">
            {currentStep > step ? <FaCheck /> : step}
          </div>
          <div className="step-label">
            {step === 1 && (i18n.language === 'ar' ? 'المعلومات الأساسية' : 'Basic Info')}
            {step === 2 && (i18n.language === 'ar' ? 'المهارات والخدمات' : 'Skills & Services')}
            {step === 3 && (i18n.language === 'ar' ? 'الموقع والإكمال' : 'Location & Complete')}
          </div>
        </div>
      ))}
    </div>
  );

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

          {renderStepIndicator()}
          
          <form onSubmit={handleSubmit} className="profile-form">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="form-section">
                <h2 className="section-title">
                  <FaUser className="section-icon" />
                  {i18n.language === 'ar' ? 'المعلومات الأساسية' : 'Basic Information'}
                </h2>
                
                <div className="form-group">
                  <label className="form-label">
                    {i18n.language === 'ar' ? 'المسمى الوظيفي *' : 'Job Title *'}
                  </label>
                  <input
                    type="text"
                    name="job_title"
                    value={formData.job_title}
                    onChange={handleInputChange}
                    className={`form-input ${errors.job_title ? 'error' : ''}`}
                    placeholder={i18n.language === 'ar' 
                      ? 'مثال: فني كهرباء، سباك، نجار...' 
                      : 'e.g., Electrician, Plumber, Carpenter...'
                    }
                  />
                  {errors.job_title && <span className="error-message">{errors.job_title}</span>}
                </div>
                
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
                      className={`form-input ${errors.experience_years ? 'error' : ''}`}
                      min="0"
                      max="50"
                    />
                    {errors.experience_years && <span className="error-message">{errors.experience_years}</span>}
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
                      className={`form-input ${errors.hourly_rate ? 'error' : ''}`}
                      min="0"
                      step="0.01"
                    />
                    {errors.hourly_rate && <span className="error-message">{errors.hourly_rate}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    {i18n.language === 'ar' ? 'السعر التقديري للخدمة (اختياري)' : 'Estimated Service Price (Optional)'}
                  </label>
                  <input
                    type="number"
                    name="estimated_price"
                    value={formData.estimated_price}
                    onChange={handleInputChange}
                    className="form-input"
                    min="0"
                    step="0.01"
                    placeholder={i18n.language === 'ar' ? 'السعر التقديري للخدمة الواحدة' : 'Estimated price per service'}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Skills and Services */}
            {currentStep === 2 && (
              <div className="form-section">
                <h2 className="section-title">
                  <FaTools className="section-icon" />
                  {i18n.language === 'ar' ? 'المهارات والخدمات' : 'Skills & Services'}
                </h2>
                
                <div className="form-group">
                  <label className="form-label">
                    {i18n.language === 'ar' ? 'وصف الخدمات *' : 'Service Description *'}
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className={`form-textarea ${errors.description ? 'error' : ''}`}
                    rows="5"
                    placeholder={i18n.language === 'ar' 
                      ? 'اكتب وصفاً مفصلاً عن خدماتك وخبرتك... (50 حرف على الأقل)' 
                      : 'Write a detailed description of your services and experience... (at least 50 characters)'
                    }
                  />
                  <div className="character-count">
                    {formData.description.length}/50 {i18n.language === 'ar' ? 'حرف كحد أدنى' : 'characters minimum'}
                  </div>
                  {errors.description && <span className="error-message">{errors.description}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    {i18n.language === 'ar' ? 'المهارات *' : 'Skills *'}
                  </label>
                  <div className={`skills-grid ${errors.skills ? 'error' : ''}`}>
                    {availableSkills.map(skill => (
                      <label key={skill.value} className="checkbox-label">
                        <input
                          type="checkbox"
                          value={skill.value}
                          checked={formData.skills.includes(skill.value)}
                          onChange={handleSkillChange}
                          className="checkbox-input"
                        />
                        <span className="checkbox-text">{skill.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.skills && <span className="error-message">{errors.skills}</span>}
                </div>

                <div className="form-section">
                  <h3 className="section-title">
                    <FaClock className="section-icon" />
                    {i18n.language === 'ar' ? 'ساعات العمل' : 'Working Hours'}
                  </h3>
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
              </div>
            )}

            {/* Step 3: Location */}
            {currentStep === 3 && (
              <div className="form-section">
                <h2 className="section-title">
                  <FaMapMarkerAlt className="section-icon" />
                  {i18n.language === 'ar' ? 'موقع العمل *' : 'Work Location *'}
                </h2>
                <p className="location-hint">
                  {i18n.language === 'ar' 
                    ? 'يمكنك تحديد موقعك على الخريطة أو كتابة اسم الحي فقط' 
                    : 'You can select your location on the map or just enter your neighborhood name'
                  }
                </p>
                
                {/* حقل الحي */}
                <div className="form-group mb-4">
                  <label className="form-label">
                    {i18n.language === 'ar' ? 'الحي (اختياري)' : 'Neighborhood (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="form-input"
                    placeholder={i18n.language === 'ar' 
                      ? 'مثال: المعادي، الزمالك، النزهة...' 
                      : 'e.g., Maadi, Zamalek, Nozha...'
                    }
                  />
                  <small className="text-muted">
                    {i18n.language === 'ar' 
                      ? 'يمكنك كتابة اسم الحي بدلاً من تحديد الموقع الدقيق على الخريطة' 
                      : 'You can enter neighborhood name instead of precise location on map'
                    }
                  </small>
                </div>
                {/* مؤشر الموقع المحدد */}
                {(selectedLocation || neighborhood.trim()) && (
                  <div className="location-info mb-3 p-3 bg-success bg-opacity-10 rounded">
                    <div className="d-flex align-items-center">
                      <div className="bg-success rounded-circle p-2 me-3">
                        <FaMapMarkerAlt className="text-white" style={{ fontSize: '12px' }} />
                      </div>
                      <div>
                        <div className="fw-bold text-success">
                          {i18n.language === 'ar' ? 'تم تحديد الموقع!' : 'Location Set!'}
                        </div>
                        <div className="small text-muted">
                          {selectedLocation && (
                            <div>
                              {i18n.language === 'ar' ? 'الإحداثيات:' : 'Coordinates:'} 
                              {` ${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}`}
                            </div>
                          )}
                          {neighborhood.trim() && (
                            <div>
                              {i18n.language === 'ar' ? 'الحي:' : 'Neighborhood:'} {neighborhood}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <LocationPicker 
                  onLocationSelect={handleLocationSelect} 
                  height={400}
                  showSaveButton={false}
                  showSearchBox={true}
                />
                {errors.location && <span className="error-message">{errors.location}</span>}
              </div>
            )}

            <div className="form-actions">
              <div className="action-buttons">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="btn btn-secondary"
                    disabled={isLoading}
                  >
                    {i18n.language === 'ar' ? 'السابق' : 'Previous'}
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="btn btn-outline"
                  disabled={isLoading}
                >
                  {i18n.language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="btn btn-primary"
                    disabled={isLoading}
                  >
                    {i18n.language === 'ar' ? 'التالي' : 'Next'}
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <FaSpinner className="spinner" />
                        {i18n.language === 'ar' ? 'جاري الحفظ...' : 'Saving...'}
                      </>
                    ) : (
                      <>
                        <FaStar />
                        {i18n.language === 'ar' ? 'إكمال الملف الشخصي' : 'Complete Profile'}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WorkerProfileCompletion;
