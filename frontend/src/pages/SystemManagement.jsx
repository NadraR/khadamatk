import React from "react";
import { 
  FaScrewdriver, FaChartBar, FaDatabase, FaShieldAlt, FaServer, 
  FaUsers, FaUserCog, FaUser, FaBox, FaCheckCircle, FaClock, 
  FaMapMarkerAlt, FaLock, FaExclamationTriangle, FaHistory, FaBan, 
  FaDesktop, FaMicrochip, FaMemory, FaHdd, FaCircle 
} from "react-icons/fa";

const SystemManagement = () => {
  return (
    <>
      <style>{`
        .system-container {
          margin: 0 auto;
          padding: 30px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          text-align: right;
          direction: rtl;
          background: linear-gradient(135deg, #f5f5f5, #dcdcdc, #b0b0b0);
          min-height: 100vh;
        }

        .system-title {
          font-size: 2rem;
          font-weight: bold;
          color: #222;
          text-align: center;
          margin-bottom: 10px;
        }

        .system-subtitle {
          text-align: center;
          color: #555;
          font-size: 15px;
          margin-bottom: 30px;
        }

        /* الشبكة الرئيسية */
        .system-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .system-section {
          background: #fff;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          animation: fadeIn 0.8s ease-in-out;
        }

        .system-section h2 {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          font-size: 18px;
          color: #333;
        }

        .system-section ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .system-section li {
          padding: 8px 0;
          border-bottom: 1px solid #eee;
          font-size: 14px;
          color: #444;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .system-section li:last-child {
          border-bottom: none;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="system-container">
        <h1 className="system-title"><FaScrewdriver /> إدارة النظام</h1>
        <p className="system-subtitle">
          من هنا تقدر تشوف ملخص عن النظام وبعض البيانات العامة.
        </p>

        <div className="system-grid">
          {/* الصلاحيات */}
          <div className="system-section">
            <h2><FaScrewdriver /> إدارة الصلاحيات</h2>
            <ul>
              <li><FaUserCog /> مدير النظام - وصول كامل</li>
              <li><FaScrewdriver /> فني - وصول للخدمات فقط</li>
              <li><FaUser /> مستخدم عادي - وصول للطلبات الشخصية</li>
            </ul>
          </div>

          {/* تقارير الأداء */}
          <div className="system-section">
            <h2><FaChartBar /> تقارير الأداء</h2>
            <ul>
              <li><FaUsers /> عدد المستخدمين: 245</li>
              <li><FaUserCog /> عدد الفنيين المسجلين: 37</li>
              <li><FaBox /> إجمالي الطلبات: 1,230</li>
              <li><FaCheckCircle color="green" /> الطلبات المكتملة: 1,050</li>
              <li><FaClock /> الطلبات المعلقة: 180</li>
            </ul>
          </div>

          {/* النسخ الاحتياطي */}
          <div className="system-section">
            <h2><FaDatabase /> النسخ الاحتياطي</h2>
            <ul>
              <li><FaHistory /> آخر نسخة: 28 أغسطس 2025 - 02:15 ص</li>
              <li><FaDatabase /> حجم النسخة: 512 MB</li>
              <li><FaCheckCircle color="green" /> الحالة: ناجحة</li>
              <li><FaMapMarkerAlt /> المكان: السيرفر الرئيسي - القاهرة</li>
            </ul>
          </div>

          {/* إعدادات الأمان */}
          <div className="system-section">
            <h2><FaShieldAlt /> إعدادات الأمان</h2>
            <ul>
              <li><FaLock /> تفعيل المصادقة الثنائية: ✅</li>
              <li><FaExclamationTriangle color="orange" /> محاولات تسجيل الدخول الفاشلة اليوم: 5</li>
              <li><FaHistory /> آخر نشاط مشبوه: 27 أغسطس 2025 - 11:45 م</li>
              <li><FaBan color="red" /> قائمة الحظر: 12 عنوان IP</li>
            </ul>
          </div>

          {/* معلومات السيرفر */}
          <div className="system-section">
            <h2><FaServer /> معلومات السيرفر</h2>
            <ul>
              <li><FaDesktop /> نظام التشغيل: Ubuntu 22.04</li>
              <li><FaMicrochip /> المعالج: Intel Xeon 3.4GHz</li>
              <li><FaMemory /> الذاكرة العشوائية: 16GB</li>
              <li><FaHdd /> المساحة التخزينية: 1TB (مستعمل 430GB)</li>
              <li><FaCircle color="green" /> الحالة: يعمل بشكل طبيعي</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default SystemManagement;
