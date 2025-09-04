from rest_framework import serializers
from .models import Conversation, Message
from orders.models import Order

class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    
    class Meta:
        model = Message
        fields = ['id', 'message', 'sender_username', 'timestamp']
        read_only_fields = ['id', 'timestamp']

class ConversationSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    order_id = serializers.IntegerField(source='order.id', read_only=True)
    
    class Meta:
        model = Conversation
        fields = ['id', 'order_id', 'created_at', 'messages']
        read_only_fields = ['id', 'created_at']