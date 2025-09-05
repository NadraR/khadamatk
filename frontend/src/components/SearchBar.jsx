import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

const SearchBar = () => {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredServices, setFilteredServices] = useState([]);
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);

  // قائمة الخدمات المتاحة
  const services = [
    { id: 1, name: { ar: "سباكة", en: "Plumbing" }, category: "home" },
    { id: 2, name: { ar: "كهرباء", en: "Electrical" }, category: "home" },
    { id: 3, name: { ar: "دهان", en: "Painting" }, category: "home" },
    { id: 4, name: { ar: "نجارة", en: "Carpentry" }, category: "home" },
    { id: 5, name: { ar: "تنظيف", en: "Cleaning" }, category: "home" },
    { id: 6, name: { ar: "تكييف", en: "Air Conditioning" }, category: "home" },
    { id: 7, name: { ar: "صيانة أجهزة", en: "Appliance Repair" }, category: "home" },
    { id: 8, name: { ar: "تركيب أثاث", en: "Furniture Assembly" }, category: "home" },
    { id: 9, name: { ar: "نقل أثاث", en: "Moving" }, category: "home" },
    { id: 10, name: { ar: "حدادة", en: "Welding" }, category: "home" },
    { id: 11, name: { ar: "بلاط", en: "Tiling" }, category: "home" },
    { id: 12, name: { ar: "جص", en: "Plastering" }, category: "home" }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      console.log('Searching for:', searchTerm);
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length > 0) {
      const filtered = services.filter(service => {
        const serviceName = i18n.language === "ar" ? service.name.ar : service.name.en;
        return serviceName.toLowerCase().includes(value.toLowerCase());
      });
      setFilteredServices(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setFilteredServices([]);
    }
  };

  const handleSuggestionClick = (service) => {
    const serviceName = i18n.language === "ar" ? service.name.ar : service.name.en;
    setSearchTerm(serviceName);
    setShowSuggestions(false);
    console.log('Selected service:', service);
  };

  const handleInputFocus = () => {
    if (searchTerm.length > 0 && filteredServices.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // تأخير إخفاء القائمة للسماح بالنقر على الاقتراحات
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  // إخفاء القائمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <StyledWrapper>
      <div className="search-container" ref={searchRef}>
        <form onSubmit={handleSearch} className="search">
          <input 
            type="text" 
            className="search__input" 
            placeholder={t("searchPlaceholder")}
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            autoComplete="off"
          />
          <button type="submit" className="search__button">
            <svg className="search__icon" aria-hidden="true" viewBox="0 0 24 24">
              <g>
                <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z" />
              </g>
            </svg>
          </button>
        </form>
        
        {/* قائمة الاقتراحات */}
        {showSuggestions && filteredServices.length > 0 && (
          <div className="suggestions-dropdown" ref={suggestionsRef}>
            <div className="suggestions-header">
              <span className="suggestions-title">
                {i18n.language === "ar" ? "اقتراحات الخدمات" : "Service Suggestions"}
              </span>
            </div>
            <div className="suggestions-list">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(service)}
                >
                  <div className="suggestion-content">
                    <span className="suggestion-name">
                      {i18n.language === "ar" ? service.name.ar : service.name.en}
                    </span>
                    <span className="suggestion-category">
                      {i18n.language === "ar" ? "خدمات منزلية" : "Home Services"}
                    </span>
                  </div>
                  <div className="suggestion-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .search-container {
    position: relative;
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
  }

  .search {
    display: flex;
    align-items: center;
    position: relative;
    width: 100%;
  }

  .search__input {
    font-family: inherit;
    font-size: 16px;
    background-color: #f4f2f2;
    border: 2px solid #e0e0e0;
    color: #646464;
    padding: 1rem 3.5rem 1rem 1.5rem;
    border-radius: 30px;
    width: 100%;
    transition: all ease-in-out 0.3s;
    outline: none;
    box-sizing: border-box;
  }

  .search__input:hover {
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }

  .search__input:focus {
    border-color: #007bff;
    background-color: #ffffff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.15);
  }

  .search__input::-webkit-input-placeholder {
    font-weight: 400;
    color: #999;
  }

  .search__input::-moz-placeholder {
    font-weight: 400;
    color: #999;
  }

  .search__input:-ms-input-placeholder {
    font-weight: 400;
    color: #999;
  }

  .search__input::placeholder {
    font-weight: 400;
    color: #999;
  }

  .search__button {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    border: none;
    background-color: #007bff;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all ease-in-out 0.3s;
    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
  }

  .search__button:hover {
    background-color: #0056b3;
    transform: translateY(-50%) scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.4);
  }

  .search__button:active {
    transform: translateY(-50%) scale(0.95);
  }

  .search__icon {
    height: 1.2em;
    width: 1.2em;
    fill: #ffffff;
  }

  /* Dark mode support */
  body.dark-mode & .search__input {
    background-color: #2c3e50;
    border-color: #4a5568;
    color: #ecf0f1;
  }

  body.dark-mode & .search__input:hover {
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
  }

  body.dark-mode & .search__input:focus {
    border-color: #3498db;
    background-color: #34495e;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.15);
  }

  body.dark-mode & .search__input::placeholder {
    color: #bdc3c7;
  }

  body.dark-mode & .search__button {
    background-color: #3498db;
  }

  body.dark-mode & .search__button:hover {
    background-color: #2980b9;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .search {
      max-width: 100%;
    }
    
    .search__input {
      font-size: 14px;
      padding: 0.8rem 3rem 0.8rem 1.2rem;
    }
    
    .search__button {
      width: 36px;
      height: 36px;
      right: 6px;
    }
    
    .search__icon {
      height: 1em;
      width: 1em;
    }
  }

  /* قائمة الاقتراحات */
  .suggestions-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    margin-top: 4px;
    overflow: hidden;
    animation: slideDown 0.2s ease-out;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .suggestions-header {
    padding: 12px 16px 8px;
    border-bottom: 1px solid #f0f0f0;
    background: #f8f9fa;
  }

  .suggestions-title {
    font-size: 12px;
    font-weight: 600;
    color: #6c757d;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .suggestions-list {
    max-height: 300px;
    overflow-y: auto;
  }

  .suggestion-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    border-bottom: 1px solid #f8f9fa;
  }

  .suggestion-item:last-child {
    border-bottom: none;
  }

  .suggestion-item:hover {
    background-color: #f8f9fa;
    transform: translateX(2px);
  }

  .suggestion-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
  }

  .suggestion-name {
    font-size: 14px;
    font-weight: 500;
    color: #2c3e50;
    line-height: 1.2;
  }

  .suggestion-category {
    font-size: 11px;
    color: #6c757d;
    font-weight: 400;
  }

  .suggestion-icon {
    color: #6c757d;
    opacity: 0.6;
    transition: all 0.2s ease;
  }

  .suggestion-item:hover .suggestion-icon {
    color: #007bff;
    opacity: 1;
    transform: translateX(2px);
  }

  /* Dark mode support for suggestions */
  body.dark-mode & .suggestions-dropdown {
    background: #2c3e50;
    border-color: #4a5568;
  }

  body.dark-mode & .suggestions-header {
    background: #34495e;
    border-bottom-color: #4a5568;
  }

  body.dark-mode & .suggestions-title {
    color: #bdc3c7;
  }

  body.dark-mode & .suggestion-item {
    border-bottom-color: #4a5568;
  }

  body.dark-mode & .suggestion-item:hover {
    background-color: #34495e;
  }

  body.dark-mode & .suggestion-name {
    color: #ecf0f1;
  }

  body.dark-mode & .suggestion-category {
    color: #bdc3c7;
  }

  body.dark-mode & .suggestion-icon {
    color: #bdc3c7;
  }

  body.dark-mode & .suggestion-item:hover .suggestion-icon {
    color: #3498db;
  }

  /* Responsive design for suggestions */
  @media (max-width: 768px) {
    .suggestions-dropdown {
      border-radius: 8px;
    }
    
    .suggestion-item {
      padding: 10px 12px;
    }
    
    .suggestion-name {
      font-size: 13px;
    }
    
    .suggestion-category {
      font-size: 10px;
    }
  }`;

export default SearchBar;
