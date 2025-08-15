import React from "react";
import { Link } from "react-router-dom";
import { FaHome, FaWrench, FaUserFriends, FaCog, FaSignOutAlt } from "react-icons/fa";
import "./Sidebar.css";

const Sidebar = () => {
  return (
    <div className="sidebarr" dir="rtl">
      <div>
        {/* <div className="sidebar-logo">
          <h2>خدماتك 🔧</h2>
        </div> */}

        <div className="sidebar-menu">
          <Link to="/Home" className="sidebar-item">
            <FaHome className="icon homee" />
            <span>الرئيسية</span>
          </Link>

          <Link to="/Services" className="sidebar-item">
            <FaWrench className="icon wrench" />
            <span>الخدمات</span>
          </Link>

          <Link to="/Clients" className="sidebar-item">
            <FaUserFriends className="icon users" />
            <span>العملاء</span>
          </Link>

          <Link to="/Settings" className="sidebar-item">
            <FaCog className="icon settings" />
            <span>الإعدادات</span>
          </Link>
        </div>

        <div className="sidebar-footer">
          <Link to="/" className="sidebar-item">
            <FaSignOutAlt className="icon logout" />
            <span>تسجيل الخروج</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
