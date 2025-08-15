import React, { useState } from 'react';
import './LoginForm.css';
import { Link, useNavigate } from "react-router-dom";

const LoginForm = () => {
  const [userType, setUserType] = useState('client');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mode, setMode] = useState('login'); 

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'register' && password !== confirmPassword) {
      alert('كلمة المرور غير متطابقة');
      return;
    }
    console.log({ mode, userType, email, password });
    navigate('/home');
  };

  return (
    <div className="login-container" dir="rtl">
      <div className="platform-header">
        <h1> خدماتك 🔧</h1>
        <p className="platform-slogan">منصة ربط العملاء بمزودي الخدمات</p>
        <div className="mb-4">
            <select
                className="lang-input"
                id="type"
                defaultValue=""
            >
                <option value="" disabled>اللغة</option>
                <option value="عميل">English</option>
                <option value="مزود خدمة">العربية</option>
            </select>
            </div>
      </div>

      <div className="login-box">
        <div className="mode-switch">
          <button
            className={mode === 'login' ? 'mode-btn active' : 'mode-btn'}
            onClick={() => setMode('login')}
          >
            تسجيل الدخول
          </button>
          <button
            className={mode === 'register' ? 'mode-btn active' : 'mode-btn'}
            onClick={() => setMode('register')}
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

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">نوع المستخدم</label>
            <div className="mb-4">
            <label htmlFor="type" className="form-label fw-bold text-white">
                نوع العميل
            </label>
            <select
                className="form-input"
                id="type"
                defaultValue=""
            >
                <option value="" disabled>نوع المستخدم</option>
                <option value="عميل">عميل</option>
                <option value="مزود خدمة">مزود خدمة</option>
            </select>
            </div>


          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">البريد الإلكتروني</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              كلمة المرور
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                تأكيد كلمة المرور
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input"
                required
              />
            </div>
          )}

          <button type="submit" className="submit-button">
            {mode === 'login' ? 'تسجيل الدخول' : 'إنشاء الحساب'}
          </button>
        </form>

        {mode === 'login' ? (
          <div className="form-links">
            <a href="#forgot-password" className="forgot-link">نسيت كلمة المرور؟</a>
            <p className="register-text">
              ليس لديك حساب؟ <Link className="register-link" onClick={() => setMode('register')}>تسجيل جديد</Link>
            </p>
          </div>
        ) : (
          <div className="form-links">
            <p className="register-text">
              لديك حساب بالفعل؟ <Link className="register-link" onClick={() => setMode('login')}>تسجيل الدخول</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginForm;
