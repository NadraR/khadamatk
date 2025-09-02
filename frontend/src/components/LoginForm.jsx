import React, { useState } from "react";
import { authService } from "../services/authService";

const LoginForm = ({ onSuccess, onError, darkMode, language = "ar" }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Translations object
  const translations = {
    ar: {
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      emailRequired: "البريد الإلكتروني مطلوب",
      emailInvalid: "البريد الإلكتروني غير صحيح",
      passwordRequired: "كلمة المرور مطلوبة",
      loginButton: "تسجيل الدخول",
      processing: "جاري المعالجة...",
      loginError: "حدث خطأ أثناء تسجيل الدخول"
    },
    en: {
      email: "Email",
      password: "Password",
      emailRequired: "Email is required",
      emailInvalid: "Invalid email format",
      passwordRequired: "Password is required",
      loginButton: "Login",
      processing: "Processing...",
      loginError: "An error occurred during login"
    }
  };

  const t = translations[language];

  const validateForm = () => {
    const newErrors = {};
    if (!email) newErrors.email = t.emailRequired;
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = t.emailInvalid;
    if (!password) newErrors.password = t.passwordRequired;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    try {
      const result = await authService.login(email, password);
      if (onSuccess) onSuccess(result.data);
    } catch (err) {
      const errorMsg = err.message || t.loginError;
      setErrors({ general: errorMsg });
      if (onError) onError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`login-form ${darkMode ? "dark" : ""}`} dir={language === "ar" ? "rtl" : "ltr"}>
      {errors.general && <div className="error-message">{errors.general}</div>}
      
      <div className="form-group">
        <label className="form-label">{t.email}</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          className={`form-input ${errors.email ? "error" : ""}`}
          placeholder={language === "ar" ? "أدخل بريدك الإلكتروني" : "Enter your email"}
        />
        {errors.email && <span className="error-text">{errors.email}</span>}
      </div>
      
      <div className="form-group">
        <label className="form-label">{t.password}</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          className={`form-input ${errors.password ? "error" : ""}`}
          placeholder={language === "ar" ? "أدخل كلمة المرور" : "Enter your password"}
        />
        {errors.password && <span className="error-text">{errors.password}</span>}
      </div>
      
      <button type="submit" disabled={isLoading} className="submit-button">
        {isLoading ? (
          <>
            <span className="spinner"></span>
            {t.processing}
          </>
        ) : (
          t.loginButton
        )}
      </button>
    </form>
  );
};

export default LoginForm;