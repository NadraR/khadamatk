import React, { useState } from "react";
import { authService } from "../services/authService";
import { Eye, EyeOff } from "lucide-react";

const LoginForm = ({ onSuccess, onError, darkMode, language = "ar" }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      loginError: "حدث خطأ أثناء تسجيل الدخول",
      showPassword: "إظهار كلمة المرور",
      hidePassword: "إخفاء كلمة المرور"
    },
    en: {
      email: "Email",
      password: "Password",
      emailRequired: "Email is required",
      emailInvalid: "Invalid email format",
      passwordRequired: "Password is required",
      loginButton: "Login",
      processing: "Processing...",
      loginError: "An error occurred during login",
      showPassword: "Show password",
      hidePassword: "Hide password"
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
      
      // Handle redirect path for workers
      if (result.redirectPath) {
        console.log('[DEBUG] LoginForm: Redirecting to:', result.redirectPath);
        window.location.href = result.redirectPath;
        return;
      }
      
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
        <div className="password-input-container">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className={`form-input ${errors.password ? "error" : ""}`}
            placeholder={language === "ar" ? "أدخل كلمة المرور" : "Enter your password"}
          />
          <button
            type="button"
            className="password-toggle-btn"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
            title={showPassword ? t.hidePassword : t.showPassword}
            aria-label={showPassword ? t.hidePassword : t.showPassword}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
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