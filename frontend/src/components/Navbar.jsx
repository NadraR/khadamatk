import React from 'react';
import { FaBell, FaHeart, FaMapMarkerAlt } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <span className="logo" onClick={() => window.location.href = '/home'}>خدماتك</span>
        <span className="tagline">منصة الخدمات الذكية</span>
      </div>
      <div className="nav-center">
        <input type="text" placeholder="بحث" className="search-input" />
      </div>
      <div className="nav-right">
        <FaBell className="icon" />
        <span className="user">اسم المستخدم</span>
        <span className="role">مستخدم</span>
      </div>
    </nav>
  );
};

export default Navbar;
