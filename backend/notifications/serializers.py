from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    actor_username = serializers.CharField(source='actor.username', read_only=True)
    target_repr = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = ['id','user','actor','actor_username','verb','message','level','url','is_read','created_at','target_repr']
        read_only_fields = ['user','actor','created_at','target_repr']

    def get_target_repr(self, obj):
        if obj.target:
            try:
                return str(obj.target)
            except Exception:
                return None
        return None
