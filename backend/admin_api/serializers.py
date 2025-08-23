from rest_framework import serializers
from .models import AdminActionLog, AdminNotification

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
