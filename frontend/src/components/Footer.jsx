import React from "react";
import { 
  FaApple,
  FaTools, 
  FaHeadset, 
  FaAndroid, 
  FaPhoneAlt, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaStar, 
  FaShieldAlt 
} from "react-icons/fa";
import "./Footer.css";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="footer" dir="rtl">
      <div className="footer-stats">
        <div className="statItem">
          <FaStar className="stat-icon" />
          <h3>4.9</h3>
          <p>{t("footer.customerRating")}</p>
        </div>
        <div className="statItem">
          <FaShieldAlt className="stat-icon" />
          <h3>10K+</h3>
          <p>{t("footer.trustedClients")}</p>
        </div>
        <div className="statItem">
          <FaHeadset className="stat-icon" />
          <h3>24/7</h3>
          <p>{t("footer.support")}</p>
        </div>
        <div className="statItem">
          <FaTools className="stat-icon" />
          <h3>500+</h3>
          <p>{t("footer.providers")}</p>
        </div>
      </div>

      <div className="footer-main">
        <div className="footer-about">
          <h2>
            <FaTools style={{ marginRight: "8px" }} />
            <span> {t("platformTitle")}</span>
          </h2>
          <p>{t("footer.about")}</p>
          <p><FaPhoneAlt /> +966 11 123 4567</p>
          <p><FaEnvelope /> support@khadamatak.com</p>
          <p><FaMapMarkerAlt /> {t("footer.address")}</p>
        </div>

        {/* روابط */}
        <div className="footer-links">
          <h3>{t("footer.servicesTitle")}</h3>
          <ul>
            <li>{t("plumbing")}</li>
            <li>{t("electricity")}</li>
            <li>{t("carpentry")}</li>
            <li>{t("cleaning")}</li>
            <li>{t("appliances")}</li>
          </ul>
        </div>

        <div className="footer-links">
          <h3>{t("footer.companyTitle")}</h3>
          <ul>
            <li>{t("footer.aboutUs")}</li>
            <li>{t("footer.howWeWork")}</li>
            <li>{t("footer.careers")}</li>
            <li>{t("footer.partnerships")}</li>
            <li>{t("footer.news")}</li>
          </ul>
        </div>

        <div className="footer-links">
          <h3>{t("footer.supportTitle")}</h3>
          <ul>
            <li>{t("footer.helpCenter")}</li>
            <li>{t("footer.contact")}</li>
            <li>{t("footer.faq")}</li>
            <li>{t("footer.report")}</li>
            <li>{t("footer.systemStatus")}</li>
          </ul>
        </div>

        <div className="footer-links">
          <h3>{t("footer.legalTitle")}</h3>
          <ul>
            <li>{t("footer.terms")}</li>
            <li>{t("footer.privacy")}</li>
            <li>{t("footer.cancellation")}</li>
            <li>{t("footer.compliance")}</li>
          </ul>
        </div>

        <div className="footer-newsletter">
          <h3>{t("footer.newsletterTitle")}</h3>
          <p>{t("footer.newsletterText")}</p>
          <input type="email" placeholder={t("footer.emailPlaceholder")} />
          <button>{t("footer.subscribe")}</button>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2024 {t("platformTitle")}. {t("footer.rights")}</p>
        <div className="apps">
          <span>{t("footer.availableOn")}</span>
          <FaApple className="app-icon" /> iOS
          <FaAndroid className="app-icon" /> Android
        </div>
      </div>
    </footer>
  );
};

export default Footer;
