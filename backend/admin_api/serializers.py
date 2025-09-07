from rest_framework import serializers
from django.contrib.auth import get_user_model
from services.models import Service, ServiceCategory
from orders.models import Order
from reviews.models import Review
from ratings.models import Rating
from invoices.models import Invoice
from .models import AdminActionLog, AdminNotification, PlatformSetting

User = get_user_model()

# ---------------- Users ----------------
class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_active', 'is_staff', 'role', 'phone']

# ---------------- Services ----------------
class AdminServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'

class AdminCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceCategory
        fields = '__all__'

# ---------------- Orders ----------------
class AdminOrderSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.username', read_only=True)
    service_name = serializers.CharField(source='service.title', read_only=True)

    class Meta:
        model = Order
        fields = '__all__'

# ---------------- Reviews ----------------
class AdminReviewSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.username', read_only=True)
    service_name = serializers.CharField(source='service.title', read_only=True)

    class Meta:
        model = Review
        fields = '__all__'

# ---------------- Ratings ----------------
class AdminRatingSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.username', read_only=True)
    service_name = serializers.CharField(source='service.title', read_only=True)

    class Meta:
        model = Rating
        fields = '__all__'

# ---------------- Invoices ----------------
class AdminInvoiceSerializer(serializers.ModelSerializer):
    booking_id = serializers.IntegerField(source='booking.id', read_only=True)

    class Meta:
        model = Invoice
        fields = '__all__'

# ---------------- Logs ----------------
class AdminActionLogSerializer(serializers.ModelSerializer):
    admin_username = serializers.CharField(source="admin.username", read_only=True)

    class Meta:
        model = AdminActionLog
        fields = ["id", "admin", "admin_username", "action", "target_model", "target_id", "timestamp", "notes"]

# ---------------- Notifications ----------------
class AdminNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminNotification
        fields = "__all__"

# ---------------- Platform Settings ----------------
class PlatformSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatformSetting
        fields = "__all__"