import React, { useState } from "react";
import { authService } from "../services/authService";
import { useNavigate } from "react-router-dom";


const RegisterForm = ({ onSuccess, onError, darkMode, language = "ar" }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    userType: "client",
    firstName: "",
    lastName: "",
    username: "",
    phone: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Translations object
  const translations = {
    ar: {
      firstName: "الاسم الأول",
      lastName: "الاسم الأخير",
      username: "اسم المستخدم",
      phone: "رقم الهاتف",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      confirmPassword: "تأكيد كلمة المرور",
      userType: "نوع المستخدم",
      client: "عميل",
      worker: "مزود خدمة",
      firstNameRequired: "الاسم الأول مطلوب",
      lastNameRequired: "الاسم الأخير مطلوب",
      usernameRequired: "اسم المستخدم مطلوب",
      phoneRequired: "رقم الهاتف مطلوب",
      phoneInvalid: "يرجى إدخال رقم هاتف مصري صحيح (11 رقم يبدأ بـ 01)",
      emailRequired: "البريد الإلكتروني مطلوب",
      emailInvalid: "البريد الإلكتروني غير صحيح",
      passwordRequired: "كلمة المرور مطلوبة",
      passwordLength: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
      passwordMismatch: "كلمة المرور غير متطابقة",
      createAccount: "إنشاء الحساب",
      processing: "جاري إنشاء الحساب...",
      registerError: "حدث خطأ أثناء إنشاء الحساب",
      firstNamePlaceholder: "أدخل اسمك الأول",
      lastNamePlaceholder: "أدخل اسمك الأخير",
      usernamePlaceholder: "أدخل اسم المستخدم",
      phonePlaceholder: "أدخل رقم الهاتف (مثال: 01234567890)",
      emailPlaceholder: "أدخل بريدك الإلكتروني",
      passwordPlaceholder: "أدخل كلمة المرور",
      confirmPasswordPlaceholder: "أعد إدخال كلمة المرور"
    },
    en: {
      firstName: "First Name",
      lastName: "Last Name",
      username: "Username",
      phone: "Phone Number",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      userType: "User Type",
      client: "Client",
      worker: "Service Provider",
      firstNameRequired: "First name is required",
      lastNameRequired: "Last name is required",
      usernameRequired: "Username is required",
      phoneRequired: "Phone number is required",
      phoneInvalid: "Please enter a valid Egyptian phone number (11 digits starting with 01)",
      emailRequired: "Email is required",
      emailInvalid: "Invalid email format",
      passwordRequired: "Password is required",
      passwordLength: "Password must be at least 6 characters",
      passwordMismatch: "Passwords do not match",
      createAccount: "Create Account",
      processing: "Creating account...",
      registerError: "An error occurred while creating account",
      firstNamePlaceholder: "Enter your first name",
      lastNamePlaceholder: "Enter your last name",
      usernamePlaceholder: "Enter your username",
      phonePlaceholder: "Enter phone number (e.g., 01234567890)",
      emailPlaceholder: "Enter your email",
      passwordPlaceholder: "Enter your password",
      confirmPasswordPlaceholder: "Re-enter your password"
    }
  };

  const t = translations[language];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when editing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = t.emailRequired;
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = t.emailInvalid;
    if (!formData.username) newErrors.username = t.usernameRequired;
    if (!formData.phone) newErrors.phone = t.phoneRequired;
    else if (!/^01[0-9]{9}$/.test(formData.phone)) newErrors.phone = t.phoneInvalid;
    if (!formData.password) newErrors.password = t.passwordRequired;
    else if (formData.password.length < 6) newErrors.password = t.passwordLength;
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = t.passwordMismatch;
    if (!formData.firstName) newErrors.firstName = t.firstNameRequired;
    if (!formData.lastName) newErrors.lastName = t.lastNameRequired;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});
    try {
      // Set language in localStorage for error messages
      localStorage.setItem('language', language);
      
      const result = await authService.register(
        formData.email, 
        formData.password, 
        formData.userType,
        {
          username: formData.username,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone
        }
      );
      
      if (onSuccess) onSuccess(result.data);
        navigate("/");
   } catch (err) {
      const errorMsg = err.message || t.registerError;
      setErrors({ general: errorMsg });
      if (onError) onError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`register-form ${darkMode ? "dark" : ""}`} dir={language === "ar" ? "rtl" : "ltr"}>
      {errors.general && <div className="error-message">{errors.general}</div>}

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t.firstName}</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            disabled={isLoading}
            className={`form-input ${errors.firstName ? "error" : ""}`}
            placeholder={t.firstNamePlaceholder}
          />
          {errors.firstName && <span className="error-text">{errors.firstName}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">{t.lastName}</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            disabled={isLoading}
            className={`form-input ${errors.lastName ? "error" : ""}`}
            placeholder={t.lastNamePlaceholder}
          />
          {errors.lastName && <span className="error-text">{errors.lastName}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t.username}</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            disabled={isLoading}
            className={`form-input ${errors.username ? "error" : ""}`}
            placeholder={t.usernamePlaceholder}
          />
          {errors.username && <span className="error-text">{errors.username}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">{t.phone}</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            disabled={isLoading}
            className={`form-input ${errors.phone ? "error" : ""}`}
            placeholder={t.phonePlaceholder}
            pattern="01[0-9]{9}"
          />
          {errors.phone && <span className="error-text">{errors.phone}</span>}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">{t.email}</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
          className={`form-input ${errors.email ? "error" : ""}`}
          placeholder={t.emailPlaceholder}
        />
        {errors.email && <span className="error-text">{errors.email}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t.password}</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
            className={`form-input ${errors.password ? "error" : ""}`}
            placeholder={t.passwordPlaceholder}
          />
          {errors.password && <span className="error-text">{errors.password}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">{t.confirmPassword}</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={isLoading}
            className={`form-input ${errors.confirmPassword ? "error" : ""}`}
            placeholder={t.confirmPasswordPlaceholder}
          />
          {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">{t.userType}</label>
        <select 
          name="userType" 
          value={formData.userType} 
          onChange={handleChange} 
          disabled={isLoading}
          className="form-select"
          style={{
            padding: '16px 20px',
            textAlign: language === "ar" ? "right" : "left",
          }}
        >
          <option value="client">
            {t.client}
          </option>
          <option value="worker">
            {t.worker}
          </option>
        </select>
      </div>

      <button type="submit" disabled={isLoading} className="submit-button">
        {isLoading ? (
          <>
            <span className="spinner"></span>
            {t.processing}
          </>
        ) : (
          t.createAccount
        )}
      </button>
    </form>
  );
};

export default RegisterForm;