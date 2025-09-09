from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    actor_username = serializers.CharField(source='actor.username', read_only=True)
    actor_full_name = serializers.SerializerMethodField(read_only=True)
    target_repr = serializers.SerializerMethodField()
    recipient_username = serializers.SerializerMethodField(read_only=True)
    recipient_full_name = serializers.SerializerMethodField(read_only=True)
    time_since = serializers.SerializerMethodField(read_only=True)
    target_url = serializers.SerializerMethodField(read_only=True)
    order_id = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Notification
        fields = [
            'id',
            'recipient',
            'recipient_username',
            'recipient_full_name',
            'actor',
            'actor_username',
            'actor_full_name',
            'verb',
            'message',
            'short_message',
            'level',
            'url',
            'target_url',
            'target_repr',
            'order_id',
            'offered_price',
            'service_price',
            'service_name',
            'job_description',
            'location_lat',
            'location_lng', 
            'location_address',
            'requires_action',
            'action_taken',
            'action_type',
            'action_taken_at',
            'is_read',
            'created_at',
            'time_since'
        ]
        read_only_fields = [
            'id',
            'recipient',
            'recipient_username',
            'recipient_full_name',
            'actor',
            'actor_username',
            'actor_full_name',
            'verb',
            'message',
            'short_message',
            'level',
            'url',
            'target_url',
            'target_repr',
            'is_read',
            'created_at',
            'time_since'
        ]

    def get_actor_full_name(self, obj):
        if obj.actor:
            try:
                full_name = f"{obj.actor.first_name} {obj.actor.last_name}".strip()
                return full_name if full_name else obj.actor.username
            except Exception:
                return obj.actor.username
        return None

    def get_recipient_username(self, obj):
        if obj.recipient and hasattr(obj.recipient, 'user'):
            return obj.recipient.user.username
        elif obj.recipient and hasattr(obj.recipient, 'username'):
            return obj.recipient.username
        return None

    def get_recipient_full_name(self, obj):
        if obj.recipient and hasattr(obj.recipient, 'user'):
            try:
                user = obj.recipient.user
                full_name = f"{user.first_name} {user.last_name}".strip()
                return full_name if full_name else user.username
            except Exception:
                return getattr(obj.recipient, 'username', None)
        return None

    def get_target_repr(self, obj):
        if obj.target:
            try:
                if hasattr(obj.target, 'get_notification_display'):
                    return obj.target.get_notification_display()
                elif hasattr(obj.target, 'title'):
                    return obj.target.title
                elif hasattr(obj.target, 'name'):
                    return obj.target.name
                return str(obj.target)
            except Exception:
                return None
        return None

    def get_target_url(self, obj):
        if obj.target and obj.target_content_type:
            try:
                model_name = obj.target_content_type.model
                target_id = obj.target_object_id
                
                if model_name == 'order':
                    return f"/orders/{target_id}/"
                elif model_name == 'service':
                    return f"/services/{target_id}/"
                elif model_name == 'review':
                    return f"/reviews/{target_id}/"
                elif model_name == 'payment':
                    return f"/payments/{target_id}/"
            except Exception:
                pass
        return obj.url

    def get_order_id(self, obj):
        """Extract order ID if the target is an Order"""
        if obj.target and obj.target_content_type:
            try:
                model_name = obj.target_content_type.model
                if model_name == 'order':
                    return obj.target_object_id
            except Exception:
                pass
        return None

    def get_time_since(self, obj):
        from django.utils import timezone
        from django.utils.timesince import timesince
        
        if obj.created_at:
            now = timezone.now()
            try:
                time_str = timesince(obj.created_at, now)
                arabic_translation = {
                    'second': 'ثانية', 'seconds': 'ثواني',
                    'minute': 'دقيقة', 'minutes': 'دقائق',
                    'hour': 'ساعة', 'hours': 'ساعات',
                    'day': 'يوم', 'days': 'أيام',
                    'week': 'أسبوع', 'weeks': 'أسابيع',
                    'month': 'شهر', 'months': 'شهور',
                    'year': 'سنة', 'years': 'سنوات',
                    'ago': 'منذ'
                }
                
                for eng, arb in arabic_translation.items():
                    time_str = time_str.replace(eng, arb)
                
                return time_str
            except Exception:
                return "غير معروف"
        return None

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        
        level_display = {
            'info': 'معلومات',
            'success': 'نجاح',
            'warning': 'تحذير',
            'error': 'خطأ'
        }
        
        if representation.get('level') in level_display:
            representation['level_display'] = level_display[representation['level']]
        
        if instance.target_content_type:
            representation['target_type'] = instance.target_content_type.model
        
        return representation


class NotificationListSerializer(serializers.ModelSerializer):
    actor_username = serializers.CharField(source='actor.username', read_only=True)
    time_since = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Notification
        fields = [
            'id',
            'actor_username',
            'verb',
            'short_message',
            'level',
            'url',
            'is_read',
            'created_at',
            'time_since'
        ]
        read_only_fields = fields

    def get_time_since(self, obj):
        from django.utils import timezone
        from django.utils.timesince import timesince
        
        if obj.created_at:
            return timesince(obj.created_at, timezone.now())
        return None


class NotificationUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['is_read']
    
    def update(self, instance, validated_data):
        if validated_data.get('is_read') and not instance.read_at:
            instance.mark_as_read()
        elif not validated_data.get('is_read') and instance.read_at:
            instance.mark_as_unread()
        return instance