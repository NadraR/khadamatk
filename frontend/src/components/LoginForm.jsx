import React, { useState, useEffect } from 'react';
import './LoginForm.css';
import { Link, useNavigate } from "react-router-dom"; 
import { FaScrewdriver } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";

const LoginForm = () => {
  const [userType, setUserType] = useState('client');
  const [username, setUsername] = useState(''); 
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mode, setMode] = useState('login'); 
  const { t, i18n } = useTranslation();
  const navigate = useNavigate(); 

  const toggleLanguage = () => {
    const newLang = i18n.language === "ar" ? "en" : "ar";
    i18n.changeLanguage(newLang);
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
  };

 

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (mode === 'register' && password !== confirmPassword) {
      result = await authService.register(email, password, userType);

    alert(t("passwordMismatch"));
    return;
  }

  try {
    if (mode === "login") {
      // إرسال البيانات للباك إند
      const response = await api.post("/auth/jwt/create/", {
        username,
        password,
      });

      const data = response.data;
      // تخزين التوكنات في localStorage
      localStorage.setItem(ACCESS_TOKEN, data.access);
      localStorage.setItem(REFRESH_TOKEN, data.refresh);

      // بعد التخزين روح على الصفحة المناسبة
      if (userType === "client") {
        navigate("/homeClient");
      } else if (userType === "provider") {
        navigate("/homeProvider");
      } else if (userType === "admin") {
        navigate("/adminDashboard");
      }
    } else {
      // تسجيل مستخدم جديد (لو عندك API خاص بالتسجيل)
      const response = await api.post("/auth/users/", {
        username,
        email,
        phone,
        password,
      });

      alert("تم إنشاء الحساب بنجاح! تقدر تسجل دخول دلوقتي.");
      setMode("login");
    }
  } catch (err) {
    console.error("Login/Register error:", err.response?.data || err);
    alert("خطأ في الدخول أو التسجيل.");
  }
};

  const [darkMode, setDarkMode] = useState(false);
  const toggleDarkMode = () => setDarkMode(!darkMode);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  return (
    <div className="login-container" dir="rtl">
      <div className="platform-header">
        <div className="headerr">
          <div className="header-top">
            <div>
              <h1 className="platform-title">
                <FaScrewdriver style={{ marginLeft: "8px" }} /> {t("platformTitle")}
              </h1>
              <p className="platform-slogan">{t("platformSlogan")}</p>
            </div>
              
            <div className="lang-slogan">
              <div className='langmode'>
                <div className="mb-4">
                  <button onClick={toggleLanguage} className="darkmode-btn">
              {i18n.language === "ar" ? "English" : "العربية"}
            </button>
                </div>

                <button onClick={toggleDarkMode} className="darkmode-btn">
                  {darkMode ? "☀️ Light" : "🌙 Dark"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="login-box">
        <div className="mode-switch">
          <button
            className={mode === 'login' ? 'mode-btn active' : 'mode-btn'}
            onClick={() => setMode('login')}
          >
            {t("login")}
          </button>
          <button
            className={mode === 'register' ? 'mode-btn active' : 'mode-btn'}
            onClick={() => setMode('register')}
          >
            {t("register")}
          </button>
        </div>

        <h2 className="login-title">
          {mode === 'login' ? t("login") : t("register")}
        </h2>
        <p className="welcome-text">
          {mode === 'login' ? t("welcomeBack") : t("create Account")}
        </p>

        <form onSubmit={handleSubmit} className="login-form">

          <div className="form-group">
            <label htmlFor="username" className="form-label">{t("username")}</label>
            <input
              type="text"
              id="username"
              placeholder={t("usernamePlaceholder")}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t("userType")}</label>
            <select
  className="slct form-input"
  id="type"
  value={userType}
  onChange={(e) => setUserType(e.target.value)}
>
  <option value="client">{t("client")}</option>
  <option value="provider">{t("provider")}</option>
  <option value="admin">{t("admin")}</option> 
</select>
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">{t("email")}</label>
            <input
              type="email"
              id="email"
              placeholder={t("emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
            />
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="phone" className="form-label">{t("phone")}</label>
              <input
                type="tel"
                id="phone"
                placeholder={t("phonePlaceholder")}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="form-input"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password" className="form-label">{t("password")}</label>
            <input
              type="password"
              id="password"
              placeholder={t("passwordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">{t("confirmPassword")}</label>
              <input
                type="password"
                id="confirmPassword"
                placeholder={t("confirmPasswordPlaceholder")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input"
                required
              />
            </div>
          )}

          <button type="submit" className="submit-button">
            {mode === 'login' ? t("login") : t("create Account")}
          </button>
        </form>

        {mode === 'login' ? (
          <div className="form-links">
            <a href="#forgot-password" className="forgot-link">{t("forgotPassword")}</a>
            <p className="register-text">
              {t("noAccount")}{" "}
              <Link className="register-link" onClick={() => setMode('register')}>
                {t("createNew")}
              </Link>
            </p>
          </div>
        ) : (
          <div className="form-links">
            <p className="register-text">
              {t("haveAccount")}{" "}
              <Link className="register-link" onClick={() => setMode('login')}>
                {t("login")}
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginForm;
