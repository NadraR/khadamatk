import React from "react";
import { 
  FaApple,
  FaAndroid, 
  FaPhoneAlt, 
  FaEnvelope, 
  FaMapMarkerAlt
} from "react-icons/fa";
import {
  Star,
  Shield,
  Headphones,
  Wrench,
  Settings
} from "lucide-react";
import "./Footer.css";
import { useTranslation } from "../hooks/useTranslation";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="footer" dir="rtl">
      <div className="footer-stats">
        <div className="statItem">
          <Star className="stat-icon" size={2} />
          <h3>4.9</h3>
          <p>{t("footer.customerRating")}</p>
        </div>
        <div className="statItem">
          <Shield className="stat-icon" size={2} />
          <h3>10K+</h3>
          <p>{t("footer.trustedClients")}</p>
        </div>
        <div className="statItem">
          <Headphones className="stat-icon" size={2} />
          <h3>24/7</h3>
          <p>{t("footer.support")}</p>
        </div>
        <div className="statItem">
          <Settings className="stat-icon" size={2} />
          <h3>500+</h3>
          <p>{t("footer.providers")}</p>
        </div>
      </div>

      <div className="footer-main">
        <div className="footer-about">
          <h2>
            <Wrench style={{ marginRight: "4px" }} size={16} />
            <span>{t("platformTitle")}</span>
          </h2>
          <p style={{ fontSize: "11px", margin: "4px 0", color: "#94a3b8" }}>{t("footer.about")}</p>
          <div style={{ fontSize: "10px", color: "#94a3b8" }}>
            <p style={{ margin: "2px 0" }}><FaPhoneAlt style={{ marginRight: "3px", fontSize: "12px" }} /> +966 11 123 4567</p>
            <p style={{ margin: "2px 0" }}><FaEnvelope style={{ marginRight: "3px", fontSize: "12px" }} /> support@khadamatak.com</p>
          </div>
        </div>

        <div className="footer-links">
          <h3>{t("footer.servicesTitle")}</h3>
          <ul>
            <li>{t("plumbing")}</li>
            <li>{t("electricity")}</li>
            <li>{t("carpentry")}</li>
            <li>{t("cleaning")}</li>
          </ul>
        </div>

        <div className="footer-links">
          <h3>{t("footer.companyTitle")}</h3>
          <ul>
            <li>{t("footer.aboutUs")}</li>
            <li>{t("footer.howWeWork")}</li>
            <li>{t("footer.careers")}</li>
            <li>{t("footer.contact")}</li>
          </ul>
        </div>

        <div className="footer-links">
          <h3>{t("footer.supportTitle")}</h3>
          <ul>
            <li>{t("footer.helpCenter")}</li>
            <li>{t("footer.faq")}</li>
            <li>{t("footer.terms")}</li>
            <li>{t("footer.privacy")}</li>
          </ul>
        </div>

        <div className="footer-newsletter">
          <h3>{t("footer.newsletterTitle")}</h3>
          <p style={{ fontSize: "10px", margin: "4px 0", color: "#94a3b8" }}>{t("footer.newsletterText")}</p>
          <input type="email" placeholder={t("footer.emailPlaceholder")} />
          <button>{t("footer.subscribe")}</button>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2024 {t("platformTitle")}. {t("footer.rights")}</p>
        <div className="apps">
          <span>{t("footer.availableOn")}</span>
          <FaApple className="app-icon" style={{ fontSize: "14px" }} /> iOS
          <FaAndroid className="app-icon" style={{ fontSize: "14px" }} /> Android
        </div>
      </div>
    </footer>
  );
};

export default Footer;
