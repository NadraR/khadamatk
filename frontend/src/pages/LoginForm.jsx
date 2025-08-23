import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { authService } from '../services/authService';
import GoogleLoginButton from '../components/GoogleLoginButton';
import RoleSelector from '../components/RoleSelector';
import './LoginForm.css';

const LoginForm = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [userType, setUserType] = useState('client');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [googleRole, setGoogleRole] = useState('client');
  const [pendingGoogleResult, setPendingGoogleResult] = useState(null);

  // تنظيف الأخطاء عند تغيير النمط
  useEffect(() => {
    setErrors({});
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  }, [mode]);

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'صيغة البريد الإلكتروني غير صحيحة';
    }

    if (!password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (password.length < 6) {
      newErrors.password = 'كلمة المرور يجب أن تكون على الأقل 6 أحرف';
    }

    if (mode === 'register') {
      if (!confirmPassword) {
        newErrors.confirmPassword = 'تأكيد كلمة المرور مطلوب';
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = 'كلمة المرور غير متطابقة';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const redirectAfterLogin = (userData) => {
    if (!userData?.hasLocation) {
      navigate('/location');
    } else if (userData?.role === 'worker') {
      navigate('/worker-dashboard');
    } else {
      navigate('/client-dashboard');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      let result;
      if (mode === 'login') {
        result = await authService.login(email, password);
      } else {
        result = await authService.register(email, password, userType);
      }

      if (result.success) {
        redirectAfterLogin(result.data);
      } else {
        setErrors({ general: result.message || 'حدث خطأ أثناء العملية' });
      }
    } catch (error) {
      const errorMessage = error.message || 'حدث خطأ أثناء العملية';
      if (errorMessage.includes('غير موجود')) {
        setErrors({ general: 'المستخدم غير موجود' });
      } else if (errorMessage.includes('كلمة المرور')) {
        setErrors({ general: 'كلمة المرور غير صحيحة' });
      } else if (errorMessage.includes('مستخدم')) {
        setErrors({ general: 'البريد الإلكتروني مستخدم بالفعل' });
      } else {
        setErrors({ general: errorMessage });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const idToken = credentialResponse?.credential;
      if (!idToken) {
        setErrors({ general: "لم يتم استلام التوكن من Google" });
        return;
      }

      // حفظ النتيجة مؤقتاً وعرض modal اختيار الدور
      setPendingGoogleResult({ idToken, rawResponse: credentialResponse });
      setShowRoleSelector(true);
      
    } catch (error) {
      console.error("Error in Google success handler:", error);
      setErrors({ general: "حدث خطأ أثناء معالجة استجابة Google" });
    }
  };

  // دالة تأكيد اختيار الدور - تم إصلاحها لاستخدام authService
  const _handleRoleConfirm = async () => {
    if (!pendingGoogleResult) return;

    setIsLoading(true);
    setShowRoleSelector(false);
    
    try {
      const result = await authService.googleLogin(
        pendingGoogleResult.idToken, 
        googleRole
      );
      
      if (result.success) {
        redirectAfterLogin(result.data);
      } else {
        setErrors({ general: result.message || "فشل تسجيل الدخول بـ Google" });
      }
    } catch (error) {
      setErrors({ general: error.message || "فشل تسجيل الدخول بـ Google" });
    } finally {
      setIsLoading(false);
      setPendingGoogleResult(null);
    }
  };

  // دالة إلغاء اختيار الدور - تم إصلاحها
  const _handleRoleCancel = () => {
    setShowRoleSelector(false);
    setPendingGoogleResult(null);
  };

  // دالة معالجة أخطاء Google - تم إصلاحها
  const _handleGoogleError = (error) => {
    console.error("Google login error:", error);
    setErrors({ general: error?.error_description || "فشل تسجيل الدخول بـ Google" });
  };

  return (
    <div className="login-container" dir="rtl">
      <div className="platform-header">
        <h1>خدماتك 🔧</h1>
        <p className="platform-slogan">منصة ربط العملاء بمزودي الخدمات</p>
        <div className="mb-4">
          <select className="lang-input" defaultValue="">
            <option value="" disabled>اللغة</option>
            <option value="English">English</option>
            <option value="العربية">العربية</option>
          </select>
        </div>
      </div>

      <div className="login-box">
        <div className="mode-switch">
          <button
            className={mode === 'login' ? 'mode-btn active' : 'mode-btn'}
            onClick={() => setMode('login')}
            disabled={isLoading}
          >
            تسجيل الدخول
          </button>
          <button
            className={mode === 'register' ? 'mode-btn active' : 'mode-btn'}
            onClick={() => setMode('register')}
            disabled={isLoading}
          >
            تسجيل جديد
          </button>
        </div>

        <h2 className="login-title">
          {mode === 'login' ? 'تسجيل الدخول' : 'تسجيل جديد'}
        </h2>
        <p className="welcome-text">
          {mode === 'login' ? 'مرحباً بك مرة أخرى' : 'أنشئ حسابك الآن'}
        </p>

        {errors.general && (
          <div className="error-message general-error">{errors.general}</div>
        )}

        <form onSubmit={handleSubmit} className="login-form" noValidate>
          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">نوع المستخدم</label>
              <select
                className="form-input"
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                disabled={isLoading}
              >
                <option value="client">عميل</option>
                <option value="worker">مزود خدمة</option>
              </select>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email" className="form-label">البريد الإلكتروني</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`form-input ${errors.email ? 'error' : ''}`}
              required
              disabled={isLoading}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group password-input-container">
            <label htmlFor="password" className="form-label">كلمة المرور</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`form-input ${errors.password ? 'error' : ''}`}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
                disabled={isLoading}
              >
                {showPassword ? 'إخفاء' : 'عرض'}
              </button>
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          {mode === 'register' && (
            <div className="form-group password-input-container">
              <label htmlFor="confirmPassword" className="form-label">تأكيد كلمة المرور</label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex="-1"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? 'إخفاء' : 'عرض'}
                </button>
              </div>
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>
          )}

          <button
            type="submit"
            className={`submit-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                جاري المعالجة...
              </>
            ) : mode === 'login' ? 'تسجيل الدخول' : 'إنشاء الحساب'}
          </button>
        </form>

        <div className="divider"><span>أو</span></div>

        <GoogleLoginButton
          onSuccess={handleGoogleSuccess}
          onError={_handleGoogleError}
          disabled={isLoading}
          userType={userType}
        />

        {mode === 'login' ? (
          <div className="form-links">
            <a href="#forgot-password" className="forgot-link">نسيت كلمة المرور؟</a>
            <p className="register-text">
              ليس لديك حساب؟{' '}
              <button
                className="register-link"
                onClick={() => setMode('register')}
                disabled={isLoading}
              >
                تسجيل جديد
              </button>
            </p>
          </div>
        ) : (
          <div className="form-links">
            <p className="register-text">
              لديك حساب بالفعل؟{' '}
              <button
                className="register-link"
                onClick={() => setMode('login')}
                disabled={isLoading}
              >
                تسجيل الدخول
              </button>
            </p>
          </div>
        )}

        {/* Modal لاختيار الدور بعد Google Login */}
        {showRoleSelector && (
          <div className="modal-overlay">
            <div className="role-modal">
              <h3>👋 مرحباً بك!</h3>
              <p>كيف تريد استخدام المنصة؟</p>
              
              <div className="form-group">
                <label className="form-label">نوع المستخدم</label>
                <select
                  className="form-input"
                  value={googleRole}
                  onChange={(e) => setGoogleRole(e.target.value)}
                >
                  <option value="client">عميل - أبحث عن خدمات</option>
                  <option value="worker">مزود خدمة - أقدم خدمات</option>
                </select>
              </div>
              
              <div className="modal-buttons">
                <button 
                  className="btn-secondary"
                  onClick={_handleRoleCancel}
                  disabled={isLoading}
                >
                  إلغاء
                </button>
                <button 
                  className="btn-primary"
                  onClick={_handleRoleConfirm}
                  disabled={isLoading}
                >
                  {isLoading ? 'جاري المعالجة...' : 'تأكيد والمتابعة'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginForm;