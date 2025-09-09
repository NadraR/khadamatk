# backend/admin_api/views.py
from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from django.db.models import Avg, Sum, Count
from django.db.models.functions import TruncMonth
from django.utils.translation import gettext as _
from django.http import HttpResponse
import csv
import json

from services.models import Service, ServiceCategory
from orders.models import Order, Booking
from reviews.models import Review
from ratings.models import Rating
from invoices.models import Invoice

from .models import AdminActionLog, AdminNotification, PlatformSetting
from .serializers import (
    AdminUserSerializer, AdminServiceSerializer, AdminOrderSerializer,
    AdminReviewSerializer, AdminRatingSerializer, AdminInvoiceSerializer,
    AdminActionLogSerializer, AdminNotificationSerializer,
    AdminCategorySerializer, PlatformSettingSerializer
)
from .permissions import IsStaffOrSuperuser

User = get_user_model()

# helper function to log admin actions
def log_admin_action(user, action, target_model, target_id=None, notes=""):
    AdminActionLog.objects.create(
        admin=user,
        action=action,
        target_model=target_model,
        target_id=target_id,
        notes=notes
    )

# ---------------- Authentication ----------------
class AdminLoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response(
                {"detail": "Username and password required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = authenticate(username=username, password=password)
        
        # Only allow superuser (superadmin) to login
        if user and user.is_superuser:
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'role': 'superadmin',
                    'is_staff': user.is_staff,
                    'is_superuser': user.is_superuser,
                }
            })
        else:
            return Response(
                {"detail": "Only superadmin can login to admin panel."},
                status=status.HTTP_401_UNAUTHORIZED
            )

class AdminRegisterView(APIView):
    permission_classes = [IsStaffOrSuperuser]  # فقط السوبر أدمن يقدر ينشئ أدمن جديد
    
    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        role = 'superadmin'  # Always superadmin

        if not all([username, email, password]):
            return Response(
                {"detail": "Username, email and password required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if User.objects.filter(username=username).exists():
            return Response(
                {"detail": "Username already exists"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if User.objects.filter(email=email).exists():
            return Response(
                {"detail": "Email already exists"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password
        )
        
        log_admin_action(request.user, "create", "User", user.id, "admin_register")
        
        return Response({
            'message': 'Superadmin user created successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': 'superadmin',
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
            }
        }, status=status.HTTP_201_CREATED)

class AdminMeView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
            'date_joined': user.date_joined,
            'last_login': user.last_login,
            'role': 'superadmin' if user.is_superuser else 'admin'
        })

# ---------------- Users ----------------
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("id")
    serializer_class = AdminUserSerializer
    permission_classes = [IsStaffOrSuperuser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["username", "email"]

    @action(detail=True, methods=["post"])
    def activate(self, request, pk=None):
        user = self.get_object()
        user.is_active = True
        user.save()
        log_admin_action(request.user, "update", "User", user.id, "activate")
        return Response({"status": "activated"})

    @action(detail=True, methods=["post"])
    def deactivate(self, request, pk=None):
        user = self.get_object()
        user.is_active = False
        user.save()
        log_admin_action(request.user, "update", "User", user.id, "deactivate")
        return Response({"status": "deactivated"})

    @action(detail=True, methods=["post"])
    def set_staff(self, request, pk=None):
        user = self.get_object()
        is_staff = bool(request.data.get("is_staff", True))
        user.is_staff = is_staff
        user.save()
        log_admin_action(request.user, "update", "User", user.id, "set_staff")
        return Response({"status": "updated", "is_staff": user.is_staff})

# ---------------- Services ----------------
class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all().order_by("id")
    serializer_class = AdminServiceSerializer
    permission_classes = [IsStaffOrSuperuser]

    @action(detail=True, methods=["post"])
    def toggle_active(self, request, pk=None):
        service = self.get_object()
        service.is_active = not service.is_active
        service.save()
        log_admin_action(request.user, "update", "Service", service.id, "toggle_active")
        return Response({"is_active": service.is_active})

# ---------------- Categories ----------------
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = ServiceCategory.objects.all().order_by("name")
    serializer_class = AdminCategorySerializer
    permission_classes = [IsStaffOrSuperuser]

# ---------------- Orders ----------------
class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by("-date_created")
    serializer_class = AdminOrderSerializer
    permission_classes = [IsStaffOrSuperuser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["status", "customer__username", "service__title"]

    @action(detail=True, methods=["post"])
    def set_status(self, request, pk=None):
        order = self.get_object()
        status_value = request.data.get("status")
        if status_value not in ["pending", "accepted", "completed", "cancelled"]:
            return Response({"detail": "invalid status"}, status=status.HTTP_400_BAD_REQUEST)
        order.status = status_value
        order.save()
        log_admin_action(request.user, "update", "Order", order.id, f"set_status:{status_value}")
        return Response({"status": order.status})

    @action(detail=True, methods=["post"])
    def assign_provider(self, request, pk=None):
        provider_id = request.data.get("provider_id")
        if not provider_id:
            return Response({"detail": "provider_id required"}, status=status.HTTP_400_BAD_REQUEST)
        order = self.get_object()
        provider = User.objects.filter(id=provider_id).first()
        if not provider:
            return Response({"detail": "provider not found"}, status=status.HTTP_404_NOT_FOUND)
        service = order.service
        service.provider = provider
        service.save()
        log_admin_action(request.user, "update", "Order", order.id, f"assign_provider:{provider_id}")
        return Response({"assigned_provider": provider.id})

# ---------------- Reviews ----------------
class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all().order_by("-created_at")
    serializer_class = AdminReviewSerializer
    permission_classes = [IsStaffOrSuperuser]

    @action(detail=True, methods=["post"])
    def soft_delete(self, request, pk=None):
        review = self.get_object()
        review.is_deleted = True
        review.save()
        log_admin_action(request.user, "update", "Review", review.id, "soft_delete")
        return Response({"is_deleted": True})

# ---------------- Ratings ----------------
class RatingViewSet(viewsets.ModelViewSet):
    queryset = Rating.objects.all().order_by("-created_at")
    serializer_class = AdminRatingSerializer
    permission_classes = [IsStaffOrSuperuser]

# ---------------- Invoices ----------------
class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all().order_by("-issued_at")
    serializer_class = AdminInvoiceSerializer
    permission_classes = [IsStaffOrSuperuser]

    @action(detail=True, methods=["post"])
    def mark_paid(self, request, pk=None):
        invoice = self.get_object()
        from django.utils import timezone
        invoice.status = getattr(Invoice, "STATUS_PAID", "paid")
        invoice.paid_at = timezone.now()
        invoice.save()
        log_admin_action(request.user, "update", "Invoice", invoice.id, "mark_paid")
        return Response({"status": invoice.status, "paid_at": invoice.paid_at})

    @action(detail=False, methods=["get"])
    def export_csv(self, request):
        qs = self.get_queryset()
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="invoices.csv"'
        writer = csv.writer(response)
        writer.writerow(['ID', 'Booking', 'Amount', 'Status', 'Issued At', 'Paid At'])
        for inv in qs:
            writer.writerow([inv.id, getattr(inv.booking, 'id', None), inv.amount, inv.status, inv.issued_at, inv.paid_at])
        return response

# ---------------- Logs ----------------
class AdminActionLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AdminActionLog.objects.all().order_by("-timestamp")
    serializer_class = AdminActionLogSerializer
    permission_classes = [IsStaffOrSuperuser]

# ---------------- Notifications ----------------
# AdminNotificationViewSet moved to the end of the file

# ---------------- Stats ----------------
class AdminStatsView(APIView):
    permission_classes = [IsStaffOrSuperuser]

    def get(self, request):
        # إحصائيات الطلبات حسب الحالة
        orders_status = {
            'pending': Order.objects.filter(status='pending').count(),
            'accepted': Order.objects.filter(status='accepted').count(),
            'completed': Order.objects.filter(status='completed').count(),
            'cancelled': Order.objects.filter(status='cancelled').count(),
        }
        
        # إحصائيات الحجوزات حسب الحالة
        bookings_status = {
            'pending': Booking.objects.filter(status='pending').count(),
            'confirmed': Booking.objects.filter(status='confirmed').count(),
            'completed': Booking.objects.filter(status='completed').count(),
            'cancelled': Booking.objects.filter(status='cancelled').count(),
        }
        
        return Response({
            "users_count": User.objects.count(),
            "services_count": Service.objects.count(),
            "orders_count": Order.objects.count(),
            "bookings_count": Booking.objects.count(),
            "reviews_count": Review.objects.count(),
            "ratings_count": Rating.objects.count(),
            "invoices_count": Invoice.objects.count(),
            "avg_rating": Rating.objects.aggregate(avg=Avg("score"))["avg"] or 0,
            "orders_status": orders_status,
            "bookings_status": bookings_status,
        })

class FinancialReportView(APIView):
    permission_classes = [IsStaffOrSuperuser]

    def get(self, request):
        by_status = (Invoice.objects
                     .values("status")
                     .annotate(total=Sum("amount"), count=Count("id"))
                     .order_by())
        return Response({"by_status": list(by_status)})

class AdminMeView(APIView):
    permission_classes = [IsStaffOrSuperuser]

    def get(self, request):
        user = request.user
        role = "superadmin" if user.is_superuser else "admin"
        permissions = {
            "can_manage_users": user.is_superuser,
            "can_manage_services": True,
            "can_manage_orders": True,
            "can_view_logs": user.is_superuser,
            "can_manage_settings": user.is_superuser,
        }
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": role,
            "permissions": permissions,
        })

# ---------------- Platform Settings ----------------
class PlatformSettingViewSet(viewsets.ModelViewSet):
    queryset = PlatformSetting.objects.all().order_by("group", "key")
    serializer_class = PlatformSettingSerializer
    permission_classes = [IsStaffOrSuperuser]
    filter_backends = [filters.SearchFilter]
    search_fields = ["key", "group", "value"]


# ---------------- Orders Trend ----------------
class OrdersTrendView(APIView):
    permission_classes = [IsStaffOrSuperuser]

    def get(self, request):
        from django.utils import timezone
        from datetime import timedelta

        today = timezone.now().date()
        start_date = today - timedelta(days=180)  # آخر 6 شهور مثلاً

        orders = (
            Order.objects.filter(date_created__gte=start_date)
            .annotate(month=TruncMonth("date_created"))
            .values("month")
            .annotate(total=Count("id"))
            .order_by("month")
        )

        services = (
            Service.objects.filter(created_at__gte=start_date)
            .annotate(month=TruncMonth("created_at"))
            .values("month")
            .annotate(total=Count("id"))
            .order_by("month")
        )

        # ندمجهم في شكل مناسب للـ chart
        trend_data = []
        months = sorted({*orders.values_list("month", flat=True), *services.values_list("month", flat=True)})
        for m in months:
            month_name = m.strftime("%B")  # اسم الشهر بالانجليزي
            trend_data.append({
                "name": month_name,
                "orders": next((o["total"] for o in orders if o["month"] == m), 0),
                "services": next((s["total"] for s in services if s["month"] == m), 0),
            })

        return Response(trend_data)    


# ---------------- Recent Orders ----------------
class RecentOrdersView(APIView):
    permission_classes = [IsStaffOrSuperuser]

    def get(self, request):
        orders = Order.objects.select_related("customer", "service").order_by("-date_created")[:5]
        data = [
            {
                "id": o.id,
                "user": getattr(o.customer, "username", None),
                "service": getattr(o.service, "title", None),
                "status": o.get_status_display() if hasattr(o, "get_status_display") else o.status,
            }
            for o in orders
        ]
        return Response(data)

# ---------------- Settings ----------------
class SettingsViewSet(viewsets.ModelViewSet):
    queryset = PlatformSetting.objects.all()
    serializer_class = PlatformSettingSerializer
    permission_classes = [IsAuthenticated, IsStaffOrSuperuser]
    
    def get_queryset(self):
        return PlatformSetting.objects.all()
    
    def list(self, request):
        """الحصول على جميع الإعدادات"""
        settings = PlatformSetting.objects.all()
        serializer = self.get_serializer(settings, many=True)
        
        # تنظيم الإعدادات حسب المجموعة
        organized_settings = {
            'system': {},
            'security': {},
            'notifications': {},
            'appearance': {}
        }
        
        for setting in settings:
            if setting.group in organized_settings:
                organized_settings[setting.group][setting.key] = setting.value
        
        return Response(organized_settings)
    
    def retrieve(self, request, pk=None):
        """الحصول على إعداد محدد"""
        try:
            setting = PlatformSetting.objects.get(key=pk)
            serializer = self.get_serializer(setting)
            return Response(serializer.data)
        except PlatformSetting.DoesNotExist:
            return Response(
                {'error': 'الإعداد غير موجود'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    def update(self, request, pk=None):
        """تحديث إعداد محدد"""
        try:
            setting = PlatformSetting.objects.get(key=pk)
            setting.value = request.data.get('value', setting.value)
            setting.save()
            
            # تسجيل العملية
            log_admin_action(
                user=request.user,
                action='update_setting',
                target_model='PlatformSetting',
                target_id=setting.id,
                notes=f'تم تحديث الإعداد: {setting.key}'
            )
            
            serializer = self.get_serializer(setting)
            return Response(serializer.data)
        except PlatformSetting.DoesNotExist:
            return Response(
                {'error': 'الإعداد غير موجود'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['put'])
    def bulk(self, request):
        """تحديث عدة إعدادات"""
        try:
            import logging
            logger = logging.getLogger(__name__)
            logger.info(f"Bulk update request data: {request.data}")
            
            updated_settings = []
            
            for group, settings in request.data.items():
                logger.info(f"Processing group: {group}, settings: {settings}")
                for key, value in settings.items():
                    # تحويل القيم إلى string
                    str_value = str(value) if value is not None else ''
                    
                    setting, created = PlatformSetting.objects.get_or_create(
                        key=key,
                        defaults={'group': group, 'value': str_value}
                    )
                    if not created:
                        setting.value = str_value
                        setting.save()
                    updated_settings.append(setting)
                    logger.info(f"Updated setting: {group}.{key} = {str_value}")
            
            # تسجيل العملية
            try:
                log_admin_action(
                    user=request.user,
                    action='bulk_update_settings',
                    target_model='PlatformSetting',
                    target_id=None,  # لا نحتاج target_id للإعدادات المجمعة
                    notes=f'تم تحديث {len(updated_settings)} إعداد'
                )
            except Exception as log_error:
                import logging
                logger = logging.getLogger(__name__)
                logger.warning(f"Failed to log admin action: {log_error}")
            
            serializer = self.get_serializer(updated_settings, many=True)
            return Response({'message': 'تم تحديث الإعدادات بنجاح', 'settings': serializer.data})
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Bulk update error: {str(e)}")
            return Response(
                {'error': f'خطأ في تحديث الإعدادات: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['post'])
    def reset(self, request):
        """إعادة تعيين الإعدادات للقيم الافتراضية"""
        try:
            # القيم الافتراضية للإعدادات
            default_settings = {
                'system': {
                    'site_name': 'خدماتك',
                    'site_description': 'منصة الخدمات المنزلية',
                    'site_email': 'info@khadamatk.com',
                    'site_phone': '+966501234567',
                    'maintenance_mode': False,
                    'registration_enabled': True,
                    'email_verification': True,
                    'sms_verification': False
                },
                'security': {
                    'password_min_length': 8,
                    'session_timeout': 30,
                    'max_login_attempts': 5,
                    'two_factor_auth': False,
                    'ip_whitelist': '',
                    'ssl_enabled': True
                },
                'notifications': {
                    'email_notifications': True,
                    'sms_notifications': False,
                    'push_notifications': True,
                    'admin_notifications': True,
                    'user_notifications': True,
                    'order_notifications': True
                },
                'appearance': {
                    'theme': 'light',
                    'primary_color': '#0077ff',
                    'secondary_color': '#10b981',
                    'language': 'ar',
                    'rtl_enabled': True,
                    'logo_url': '',
                    'favicon_url': ''
                }
            }
            
            # حذف الإعدادات الموجودة
            PlatformSetting.objects.all().delete()
            
            # إنشاء الإعدادات الافتراضية
            for group, settings in default_settings.items():
                for key, value in settings.items():
                    PlatformSetting.objects.create(
                        key=key,
                        group=group,
                        value=value
                    )
            
            # تسجيل العملية
            log_admin_action(
                user=request.user,
                action='reset_settings',
                target_model='PlatformSetting',
                target_id=None,
                notes='تم إعادة تعيين جميع الإعدادات للقيم الافتراضية'
            )
            
            return Response({'message': 'تم إعادة تعيين الإعدادات بنجاح'})
        except Exception as e:
            return Response(
                {'error': f'خطأ في إعادة تعيين الإعدادات: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'])
    def export(self, request):
        """تصدير الإعدادات كملف JSON"""
        try:
            settings = PlatformSetting.objects.all()
            serializer = self.get_serializer(settings, many=True)
            
            response = HttpResponse(
                json.dumps(serializer.data, ensure_ascii=False, indent=2),
                content_type='application/json'
            )
            response['Content-Disposition'] = 'attachment; filename="settings.json"'
            return response
        except Exception as e:
            return Response(
                {'error': f'خطأ في تصدير الإعدادات: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['post'])
    def import_settings(self, request):
        """استيراد الإعدادات من ملف"""
        try:
            file = request.FILES.get('file')
            if not file:
                return Response(
                    {'error': 'لم يتم تحديد ملف'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # قراءة الملف
            content = file.read().decode('utf-8')
            settings_data = json.loads(content)
            
            # تحديث الإعدادات
            updated_count = 0
            for setting_data in settings_data:
                setting, created = PlatformSetting.objects.get_or_create(
                    key=setting_data['key'],
                    defaults={
                        'group': setting_data['group'],
                        'value': setting_data['value']
                    }
                )
                if not created:
                    setting.value = setting_data['value']
                    setting.save()
                updated_count += 1
            
            # تسجيل العملية
            log_admin_action(
                user=request.user,
                action='import_settings',
                target_model='PlatformSetting',
                target_id=None,
                notes=f'تم استيراد {updated_count} إعداد من ملف'
            )
            
            return Response({'message': f'تم استيراد {updated_count} إعداد بنجاح'})
        except Exception as e:
            return Response(
                {'error': f'خطأ في استيراد الإعدادات: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

# ---------------- Notifications ----------------
class AdminNotificationViewSet(viewsets.ModelViewSet):
    queryset = AdminNotification.objects.all().order_by('-created_at')
    serializer_class = AdminNotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return AdminNotification.objects.filter(admin=self.request.user).order_by('-created_at')
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        count = AdminNotification.objects.filter(
            admin=request.user, 
            is_read=False
        ).count()
        return Response({'unread_count': count})
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'message': 'تم تحديد الإشعار كمقروء'})
    
    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        AdminNotification.objects.filter(
            admin=request.user, 
            is_read=False
        ).update(is_read=True)
        return Response({'message': 'تم تحديد جميع الإشعارات كمقروءة'})