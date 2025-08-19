import React, { useState } from 'react';
import './LoginForm.css';
import { Link } from "react-router-dom";
import { FaScrewdriver } from "react-icons/fa";


const LoginForm = () => {
  const [userType, setUserType] = useState('client');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mode, setMode] = useState('login'); 

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'register' && password !== confirmPassword) {
      alert('كلمة المرور غير متطابقة');
      return;
    }
    console.log({ mode, userType, email, phone, password });
  };

  return (
    <div className="login-container" dir="rtl">
      <div className="platform-header">
        <header className="header">
  <div className="header-top">
    <div>
<h1 className="platform-title">
  <FaScrewdriver style={{ marginLeft: "8px" }} /> خدماتك
</h1>
    <p className="platform-slogan">منصتك لكل الخدمات في مكان واحد</p>
          </div>

    <div className="lang-slogan">
      <div className="mb-4">
          <select className="lang-input" id="lang" defaultValue="">
            <option value="" disabled>اللغة</option>
            <option value="English">English</option>
            <option value="Arabic">العربية</option>
          </select>
        </div>
    </div>
  </div>
</header>


        
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
            <select
              className="slct form-input"
              id="type"
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
            >
              <option value="client">عميل</option>
              <option value="provider">مزود خدمة</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">البريد الإلكتروني</label>
            <input
              type="email"
              id="email"
              placeholder="أدخل بريدك الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
            />
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="phone" className="form-label">رقم الهاتف</label>
              <input
                type="tel"
                id="phone"
                placeholder="+0123456789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="form-input"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password" className="form-label">كلمة المرور</label>
            <input
              type="password"
              id="password"
              placeholder="أدخل كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">تأكيد كلمة المرور</label>
              <input
                type="password"
                id="confirmPassword"
                placeholder="أدخل كلمة المرور مرة أخرى"
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
              ليس لديك حساب؟{' '}
              <Link className="register-link" onClick={() => setMode('register')}>
                إنشاء حساب جديد
              </Link>
            </p>
          </div>
        ) : (
          <div className="form-links">
            <p className="register-text">
              لديك حساب بالفعل؟{' '}
              <Link className="register-link" onClick={() => setMode('login')}>
                تسجيل الدخول
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginForm;