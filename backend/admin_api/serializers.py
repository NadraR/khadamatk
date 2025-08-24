from rest_framework import serializers
from .models import AdminActionLog, AdminNotification
from django.contrib.auth import get_user_model
from services.models import Service
from orders.models import Order
from reviews.models import Review
from ratings.models import Rating


User = get_user_model()
class AdminActionLogSerializer(serializers.ModelSerializer):
    admin_name = serializers.CharField(source='admin.username', read_only=True)

    class Meta:
        model = AdminActionLog
        fields = ['id', 'admin', 'admin_name', 'action', 'target_model', 'target_id', 'timestamp', 'notes']


class AdminNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminNotification
        fields = ['id', 'title', 'message', 'is_read', 'created_at']

from rest_framework import serializers
from .models import AdminActionLog, AdminNotification

class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_staff']
class AdminActionLogSerializer(serializers.ModelSerializer):
    admin_name = serializers.CharField(source='admin.username', read_only=True)

    class Meta:
        model = AdminActionLog
        fields = ['id', 'admin', 'admin_name', 'action', 'target_model', 'target_id', 'timestamp', 'notes']


class AdminNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminNotification
        fields = ['id', 'title', 'message', 'is_read', 'created_at']
        fields = '__all__'

class AdminServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'

class AdminOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'

class AdminReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = '__all__'

class AdminRatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rating
        fields = '__all__'
  
