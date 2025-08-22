import React, { useState } from 'react';
import { FaBell } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      window.location.href = `/services?search=${query}`;
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <span className="logo" onClick={() => window.location.href = '/home'}>خدماتك</span>
        <span className="tagline">منصة الخدمات الذكية</span>
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
        <span className="user">محمد أحمد</span>
        <span className="role">عميل</span>
      </div>
    </nav>
  );
};

export default Navbar;
