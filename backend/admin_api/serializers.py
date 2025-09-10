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
    password = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone', 'is_active', 'is_staff', 'role', 'password']
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        # إضافة قيمة افتراضية للـ role إذا لم يتم توفيرها
        if 'role' not in validated_data:
            validated_data['role'] = 'client'
        user = User.objects.create(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

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
    admin_username = serializers.CharField(source='admin.username', read_only=True)
    
    class Meta:
        model = AdminNotification
        fields = ['id', 'admin', 'admin_username', 'title', 'message', 'type', 'is_read', 'created_at']

# ---------------- Platform Settings ----------------
class PlatformSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatformSetting
        fields = "__all__"