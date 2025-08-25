import React from "react";
import { Link } from "react-router-dom";
import { FaHome, FaWrench, FaUserFriends, FaCog, FaSignOutAlt } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import "./Sidebar.css";

const Sidebar = () => {
  const { t } = useTranslation();

  return (
    <div className="sidebarr" dir="rtl">
      {/* <div> */}
        <div className="sidebar-menu">
          <Link to="/Home" className="sidebar-item">
            <FaHome className="icon homee" />
            <span>{t("sidebar.home")}</span>
          </Link>

          <Link to="/services" className="sidebar-item">
            <FaWrench className="icon wrench" />
            <span>{t("sidebar.services")}</span>
          </Link>

          <Link to="/Clients" className="sidebar-item">
            <FaUserFriends className="icon users" />
            <span>{t("sidebar.clients")}</span>
          </Link>

          <Link to="/Settings" className="sidebar-item">
            <FaCog className="icon settings" />
            <span>{t("sidebar.settings")}</span>
          </Link>
        </div>

        <div className="sidebar-footer">
          <Link to="/" className="sidebar-item">
            <FaSignOutAlt className="icon logout" />
            <span>{t("sidebar.logout")}</span>
          </Link>
        </div>
      </div>
    // </div>
  );
};

export default Sidebar;
