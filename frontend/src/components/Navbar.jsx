import React, { useEffect, useState } from 'react';
import { FaScrewdriver, FaBell } from 'react-icons/fa';
import './Navbar.css';
import { useTranslation } from "react-i18next";

const Navbar = () => {
  const [username, setUsername] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [query, setQuery] = useState("");
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const storedName = localStorage.getItem('username'); 
    if (storedName) {
      setUsername(storedName); 
    }
  }, []);

  // Toggle Dark Mode
  const toggleDarkMode = () => setDarkMode(!darkMode);

  // Toggle Language

  const toggleLanguage = () => {
    const newLang = i18n.language === "ar" ? "en" : "ar";
    i18n.changeLanguage(newLang);
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
  };

  // تأثير الـ Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      window.location.href = `/services?search=${query}`;
    }
  };

  return (
    <header className="header">
      <div className="header-top">
        <div>
          <h1 className="platform-title">
            <FaScrewdriver style={{ marginLeft: "8px" }} /> {t("platformTitle")}
          </h1>
          <p className="platform-slogan">{t("platformSlogan")}</p>
        </div>

        <div className="lang-slogan">
          <div className="langmode">
            {/* زرار تغيير اللغة */}
            <button onClick={toggleLanguage} className="darkmode-btn">
              {i18n.language === "ar" ? "English" : "العربية"}
            </button>

            {/* زرار Dark/Light Mode */}
            <button onClick={toggleDarkMode} className="darkmode-btn">
              {darkMode ? "☀️ Light" : "🌙 Dark"}
            </button>
          </div>
        </div>
      </div>

      <div className="nav-center">
        <input 
          type="text"
          placeholder="بحث عن خدمة..."
          className="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleSearch}
        />
      </div>

      <div className="nav-right">
        <FaBell className="icon" />
        <span className="user">{username || "ضيف"}</span>
        <span className="role">عميل</span>
      </div>
    </header>
  );
};

export default Navbar;
