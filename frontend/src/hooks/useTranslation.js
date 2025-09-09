import { useState, useEffect } from 'react';
import { getTranslation, getCurrentLanguage, setLanguage } from '../utils/translations';

export const useTranslation = () => {
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage);

  const t = (key) => {
    return getTranslation(key, currentLang);
  };

  const changeLanguage = (lang) => {
    setCurrentLang(lang);
    setLanguage(lang);
    // إعادة تحميل الصفحة لتطبيق التغييرات
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const toggleLanguage = () => {
    const newLang = currentLang === 'ar' ? 'en' : 'ar';
    changeLanguage(newLang);
  };

  useEffect(() => {
    const savedLang = getCurrentLanguage();
    if (savedLang !== currentLang) {
      setCurrentLang(savedLang);
    }
  }, [currentLang]);

  return {
    t,
    currentLang,
    changeLanguage,
    toggleLanguage,
    isRTL: currentLang === 'ar'
  };
};
