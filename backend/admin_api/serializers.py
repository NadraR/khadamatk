# admin_api/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from services.models import Service
from orders.models import Order
from reviews.models import Review
from ratings.models import Rating
# from invoices.models import Invoice  # Temporarily disabled - invoices app incomplete
from .models import AdminActionLog

User = get_user_model()

# ---------------- Users ----------------
class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # عرض أهم الحقول اللي الإدارة ممكن تحتاجها
        fields = ['id', 'username', 'email', 'is_active', 'is_staff', 'role']

# ---------------- Services ----------------
class AdminServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
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
    user_name = serializers.CharField(source='user.username', read_only=True)
    class Meta:
        model = Review
        fields = '__all__'

# ---------------- Ratings ----------------
class AdminRatingSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    class Meta:
        model = Rating
        fields = '__all__'

# ---------------- Invoices - Temporarily disabled ----------------
# class AdminInvoiceSerializer(serializers.ModelSerializer):
#     order_id = serializers.IntegerField(source='order.id', read_only=True)
#     class Meta:
#         model = Invoice
#         fields = '__all__'
class AdminActionLogSerializer(serializers.ModelSerializer):
    admin_username = serializers.CharField(source="admin.username", read_only=True)

    class Meta:
        model = AdminActionLog
        fields = ["id", "admin", "admin_username", "action", "target_model", "target_id", "timestamp", "notes"]
