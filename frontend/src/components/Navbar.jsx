// import React, { useEffect, useState } from 'react';
// import { FaScrewdriver, FaBell, FaMoon, FaSun } from 'react-icons/fa';
// import './Navbar.css';
// import { useTranslation } from "react-i18next";

// const Navbar = () => {
//   const [username, setUsername] = useState('');
//   const [darkMode, setDarkMode] = useState(false);
//   const [query, setQuery] = useState("");
//   const { t, i18n } = useTranslation();

//   useEffect(() => {
//     const storedName = localStorage.getItem('username'); 
//     if (storedName) {
//       setUsername(storedName); 
//     }
//   }, []);

//   const toggleDarkMode = () => setDarkMode(!darkMode);

//   const toggleLanguage = () => {
//     const newLang = i18n.language === "ar" ? "en" : "ar";
//     i18n.changeLanguage(newLang);
//     document.documentElement.lang = newLang;
//     document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
//   };

//   useEffect(() => {
//     if (darkMode) {
//       document.body.classList.add("dark-mode");
//     } else {
//       document.body.classList.remove("dark-mode");
//     }
//   }, [darkMode]);

//   const handleSearch = (e) => {
//     if (e.key === "Enter") {
//       window.location.href = `/services?search=${query}`;
//     }
//   };

//   return (
//     <header className="header">
//       <div className="header-top">
//         <div>
//           <h1 className="platform-title">
//             <FaScrewdriver style={{ marginLeft: "8px" }} /> {t("platformTitle")}
//           </h1>
//           <p className="platform-slogan">{t("platformSlogan")}</p>
//         </div>

//         <div className="lang-slogan">
//           <div className="langmode">
//             <button onClick={toggleLanguage} className="darkmode-btn">
//               {i18n.language === "ar" ? "English" : "العربية"}
//             </button>

//             <button onClick={toggleDarkMode} className="darkmode-btn">
//               {darkMode ? <FaSun /> : <FaMoon />}
//             </button>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Navbar;
