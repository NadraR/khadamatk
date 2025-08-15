import React from "react";
import { FaApple,FaTools, FaHeadset, FaAndroid, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaStar, FaShieldAlt } from "react-icons/fa";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer" dir="rtl">
      <div className="footer-stats">
        <div className="statItem">
          <FaStar className="stat-icon" />
          <h3>4.9</h3>
          <p>تقييم العملاء</p>
        </div>
        <div className="statItem">
            <FaShieldAlt className="stat-icon" />
          <h3>10K+</h3>
          <p>عميل موثوق</p>
        </div>
        <div className="statItem">
            <FaHeadset className="stat-icon" />
          <h3>24/7</h3>
          <p>خدمة العملاء</p>
        </div>
        <div className="statItem">
            <FaTools className="stat-icon" />
          <h3>500+</h3>
          <p>مزود خدمة</p>
        </div>
      </div>

      <div className="footer-main">
        <div className="footer-about">
          <h2>🔧 خدماتك</h2>
          <p>
            منصة رائدة تربط العملاء بمزودي الخدمات المحترفين. نوفر خدمات موثوقة وسريعة لجميع احتياجاتك المنزلية والتجارية.
          </p>
          <p><FaPhoneAlt /> +966 11 123 4567</p>
          <p><FaEnvelope /> support@khadamatak.com</p>
          <p><FaMapMarkerAlt /> الرياض، المملكة العربية السعودية</p>
        </div>

        {/* روابط */}
        <div className="footer-links">
          <h3>الخدمات</h3>
          <ul>
            <li>سباكة</li>
            <li>كهرباء</li>
            <li>نجارة</li>
            <li>تنظيف</li>
            <li>صيانة أجهزة</li>
          </ul>
        </div>

        <div className="footer-links">
          <h3>الشركة</h3>
          <ul>
            <li>من نحن</li>
            <li>كيف نعمل</li>
            <li>الوظائف</li>
            <li>الشراكات</li>
            <li>الأخبار</li>
          </ul>
        </div>

        <div className="footer-links">
          <h3>الدعم</h3>
          <ul>
            <li>مركز المساعدة</li>
            <li>اتصل بنا</li>
            <li>الأسئلة الشائعة</li>
            <li>بلغ عن مشكلة</li>
            <li>حالة النظام</li>
          </ul>
        </div>

        <div className="footer-links">
          <h3>القانونية</h3>
          <ul>
            <li>الشروط والأحكام</li>
            <li>سياسة الخصوصية</li>
            <li>سياسة الإلغاء</li>
            <li>الامتثال</li>
          </ul>
        </div>

        <div className="footer-newsletter">
          <h3>اشترك في النشرة الإخبارية</h3>
          <p>احصل على آخر العروض والأخبار</p>
          <input type="email" placeholder="أدخل بريدك الإلكتروني" />
          <button>اشترك</button>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2024 خدماتك. جميع الحقوق محفوظة.</p>
        <div className="apps">
          <span>متاح على:</span>
          <FaApple className="app-icon" /> آيفون
          <FaAndroid className="app-icon" /> أندرويد
        </div>
      </div>
    </footer>
  );
};

export default Footer;
