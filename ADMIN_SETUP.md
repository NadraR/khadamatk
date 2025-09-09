# إعداد لوحة الإدارة - Admin Panel Setup

## 📋 المتطلبات - Requirements

### Backend Requirements
- Python 3.8+
- Django 4.0+
- Django REST Framework
- PostgreSQL (أو SQLite للتطوير)

### Frontend Requirements
- Node.js 16+
- npm أو yarn
- React 18+

## 🚀 خطوات التشغيل - Setup Steps

### 1. تشغيل الباك إند - Backend Setup

```bash
# الانتقال لمجلد الباك إند
cd backend

# إنشاء virtual environment
python -m venv venv

# تفعيل virtual environment
# على Windows:
venv\Scripts\activate
# على Linux/Mac:
source venv/bin/activate

# تثبيت المتطلبات
pip install -r requirements.txt

# تشغيل migrations
python manage.py migrate

# إنشاء superuser
python manage.py createsuperuser

# تشغيل الخادم
python manage.py runserver
```

### 2. تشغيل الفرونت إند - Frontend Setup

```bash
# الانتقال لمجلد الفرونت إند
cd frontend

# تثبيت المتطلبات
npm install

# تشغيل الخادم
npm run dev
```

## 🔐 تسجيل الدخول - Login

1. افتح المتصفح واذهب إلى: `http://localhost:5173/admin/login`
2. استخدم بيانات superuser التي أنشأتها في الخطوة السابقة
3. بعد تسجيل الدخول بنجاح، ستتم إعادة توجيهك إلى لوحة التحكم

## 📊 الميزات المتاحة - Available Features

### لوحة التحكم الرئيسية - Main Dashboard
- ✅ إحصائيات شاملة (المستخدمين، الخدمات، الطلبات، الحجوزات)
- ✅ متوسط التقييمات
- ✅ عدد الفواتير
- ✅ حالة النظام (الخدمات النشطة، الحجوزات المعلقة، معدل النمو)
- ✅ الطلبات الأخيرة

### إدارة المستخدمين - Users Management
- ✅ عرض قائمة المستخدمين
- ✅ تفعيل/إلغاء تفعيل المستخدمين
- ✅ تعيين المستخدمين كموظفين
- ✅ البحث والفلترة

### إدارة الخدمات - Services Management
- ✅ عرض قائمة الخدمات
- ✅ إنشاء خدمات جديدة
- ✅ تعديل الخدمات
- ✅ تفعيل/إلغاء تفعيل الخدمات

### إدارة الطلبات - Orders Management
- ✅ عرض قائمة الطلبات
- ✅ تحديث حالة الطلبات
- ✅ تعيين مزودي الخدمات

### إدارة التقييمات - Reviews Management
- ✅ عرض التقييمات
- ✅ حذف التقييمات (soft delete)

### الإشعارات - Notifications
- ✅ عرض الإشعارات
- ✅ الإشعارات غير المقروءة
- ✅ تحديث حالة الإشعارات

### سجل الإجراءات - Action Logs
- ✅ عرض سجل جميع إجراءات الإدارة
- ✅ تتبع التغييرات

## 🔧 إعدادات API - API Configuration

### Endpoints المتاحة - Available Endpoints

```
# Authentication
POST /admin-api/login/          # تسجيل الدخول
POST /admin-api/register/       # إنشاء أدمن جديد
GET  /admin-api/me/             # معلومات المستخدم الحالي

# Dashboard
GET  /admin-api/stats/          # إحصائيات لوحة التحكم
GET  /admin-api/orders-trend/   # اتجاهات الطلبات
GET  /admin-api/recent-orders/  # الطلبات الأخيرة
GET  /admin-api/financial-report/ # التقرير المالي

# Users Management
GET    /admin-api/users/        # قائمة المستخدمين
POST   /admin-api/users/        # إنشاء مستخدم جديد
GET    /admin-api/users/{id}/   # مستخدم واحد
PATCH  /admin-api/users/{id}/   # تحديث مستخدم
DELETE /admin-api/users/{id}/   # حذف مستخدم
POST   /admin-api/users/{id}/activate/    # تفعيل مستخدم
POST   /admin-api/users/{id}/deactivate/  # إلغاء تفعيل مستخدم
POST   /admin-api/users/{id}/set_staff/   # تعيين كموظف

# Services Management
GET    /admin-api/services/     # قائمة الخدمات
POST   /admin-api/services/     # إنشاء خدمة جديدة
GET    /admin-api/services/{id}/ # خدمة واحدة
PATCH  /admin-api/services/{id}/ # تحديث خدمة
DELETE /admin-api/services/{id}/ # حذف خدمة
POST   /admin-api/services/{id}/toggle_active/ # تبديل حالة الخدمة

# Orders Management
GET    /admin-api/orders/       # قائمة الطلبات
GET    /admin-api/orders/{id}/  # طلب واحد
POST   /admin-api/orders/{id}/set_status/     # تحديث حالة الطلب
POST   /admin-api/orders/{id}/assign_provider/ # تعيين مزود خدمة

# Reviews Management
GET    /admin-api/reviews/      # قائمة التقييمات
POST   /admin-api/reviews/{id}/soft_delete/ # حذف تقييم

# Notifications
GET    /admin-api/notifications/ # قائمة الإشعارات
GET    /admin-api/notifications/unread/ # الإشعارات غير المقروءة
PATCH  /admin-api/notifications/{id}/ # تحديث إشعار

# Logs
GET    /admin-api/logs/         # سجل الإجراءات
```

## 🛡️ الأمان - Security

- ✅ JWT Authentication
- ✅ Superuser فقط يمكنه تسجيل الدخول
- ✅ Token expiration handling
- ✅ Automatic logout on token expiry
- ✅ CORS configuration
- ✅ Input validation

## 🐛 استكشاف الأخطاء - Troubleshooting

### مشاكل شائعة - Common Issues

1. **خطأ في الاتصال بالباك إند**
   - تأكد من تشغيل Django server على port 8000
   - تحقق من إعدادات proxy في vite.config.js

2. **خطأ في تسجيل الدخول**
   - تأكد من إنشاء superuser
   - تحقق من صحة بيانات تسجيل الدخول

3. **خطأ في تحميل البيانات**
   - تحقق من صحة token في localStorage
   - تأكد من تشغيل migrations

4. **مشاكل CORS**
   - تأكد من إعداد CORS في Django settings
   - تحقق من إعدادات proxy

## 📝 ملاحظات مهمة - Important Notes

- جميع البيانات محفوظة في قاعدة البيانات
- التقييمات المحذوفة تبقى في قاعدة البيانات (soft delete)
- جميع إجراءات الإدارة مسجلة في سجل الإجراءات
- النظام يدعم اللغة العربية بالكامل
- التصميم متجاوب لجميع أحجام الشاشات

## 🔄 التحديثات المستقبلية - Future Updates

- [ ] إضافة تقارير مفصلة
- [ ] إضافة إحصائيات متقدمة
- [ ] إضافة إدارة الفواتير
- [ ] إضافة إدارة الفئات
- [ ] إضافة إعدادات النظام
- [ ] إضافة تصدير البيانات

