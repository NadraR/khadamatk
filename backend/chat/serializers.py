from rest_framework import serializers
from .models import Conversation, Message
from orders.models import Order


class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    sender_full_name = serializers.SerializerMethodField()
    is_read = serializers.BooleanField(read_only=True)   # 🟢 جديد
    read_at = serializers.DateTimeField(read_only=True)  # 🟢 جديد
    
    class Meta:
        model = Message
        fields = [
            'id', 'message', 'sender_username', 'sender_full_name', 
            'timestamp', 'is_read', 'read_at'
        ]
        read_only_fields = ['id', 'timestamp', 'is_read', 'read_at']
    
    def get_sender_full_name(self, obj):
        return obj.sender.get_full_name() or obj.sender.username


class ConversationSerializer(serializers.ModelSerializer):
    """تفاصيل المحادثة مع كل الرسائل"""
    messages = MessageSerializer(many=True, read_only=True)
    order_id = serializers.IntegerField(source='order.id', read_only=True)
    
    class Meta:
        model = Conversation
        fields = ['id', 'order_id', 'created_at', 'messages']
        read_only_fields = ['id', 'created_at']


class ConversationListSerializer(serializers.ModelSerializer):
    """ملخص المحادثات للـ sidebar / القائمة"""
    order_id = serializers.IntegerField(source='order.id', read_only=True)
    order_title = serializers.CharField(source='order.service_type', read_only=True)
    other_participant = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    message_count = serializers.IntegerField(read_only=True)
    last_message_time = serializers.DateTimeField(read_only=True)
    unread_count = serializers.SerializerMethodField()  # 🟢 جديد
    
    class Meta:
        model = Conversation
        fields = [
            'id', 'order_id', 'order_title', 'other_participant', 
            'last_message', 'message_count', 'last_message_time',
            'created_at', 'unread_count'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_other_participant(self, obj):
        current_user = self.context['request'].user
        if obj.order.customer == current_user:
            other_user = obj.order.worker
        else:
            other_user = obj.order.customer
        
        return {
            'id': other_user.id if other_user else None,
            'name': other_user.get_full_name() or other_user.username if other_user else 'Unknown',
            'username': other_user.username if other_user else 'unknown'
        }
    
    def get_last_message(self, obj):
        last_message = obj.messages.order_by('-timestamp').first()
        if last_message:
            return {
                'message': last_message.message[:100] + ('...' if len(last_message.message) > 100 else ''),
                'sender': last_message.sender.get_full_name() or last_message.sender.username,
                'timestamp': last_message.timestamp,
                'is_from_current_user': last_message.sender == self.context['request'].user,
                'is_read': last_message.is_read   
            }
        return None
    
    def get_unread_count(self, obj):
        current_user = self.context['request'].user
        return obj.messages.filter(is_read=False).exclude(sender=current_user).count()
