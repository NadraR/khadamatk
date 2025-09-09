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
from django.db.models.functions import TruncDay, TruncMonth, TruncYear
from django.utils import timezone
from datetime import timedelta
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
def log_admin_action(user, action, target_model, target_id, notes=""):
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
class AdminNotificationViewSet(viewsets.ModelViewSet):
    queryset = AdminNotification.objects.all().order_by("-created_at")
    serializer_class = AdminNotificationSerializer
    permission_classes = [IsStaffOrSuperuser]

    @action(detail=False, methods=["get"])
    def unread(self, request):
        notifs = self.queryset.filter(is_read=False)
        serializer = self.get_serializer(notifs, many=True)
        return Response(serializer.data)

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
        interval = request.GET.get("interval", "month")  # default: month
        today = timezone.now().date()
        
        # تحديد الفترة
        if interval == "day":
            start_date = today - timedelta(days=30)  # آخر 30 يوم
            trunc_func = TruncDay
        elif interval == "year":
            start_date = today - timedelta(days=365*2)  # آخر سنتين
            trunc_func = TruncYear
        else:  # month
            start_date = today - timedelta(days=180)  # آخر 6 شهور
            trunc_func = TruncMonth

        orders = (
            Order.objects.filter(date_created__gte=start_date)
            .annotate(period=trunc_func("date_created"))
            .values("period")
            .annotate(total=Count("id"))
            .order_by("period")
        )

        services = (
            Service.objects.filter(created_at__gte=start_date)
            .annotate(period=trunc_func("created_at"))
            .values("period")
            .annotate(total=Count("id"))
            .order_by("period")
        )

        # دمج البيانات في شكل مناسب للـ chart
        trend_data = []
        periods = sorted({*orders.values_list("period", flat=True), *services.values_list("period", flat=True)})
        for p in periods:
            name = ""
            if interval == "day":
                name = p.strftime("%d %b")       # 08 Sep
            elif interval == "month":
                name = p.strftime("%B %Y")      # September 2025
            else:  # year
                name = p.strftime("%Y")         # 2025

            trend_data.append({
                "name": name,
                "orders": next((o["total"] for o in orders if o["period"] == p), 0),
                "services": next((s["total"] for s in services if s["period"] == p), 0),
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
