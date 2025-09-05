from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count, Max
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer, ConversationListSerializer
from orders.models import Order

class ConversationDetailView(generics.RetrieveAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        order_id = self.kwargs['order_id']
        order = get_object_or_404(Order, id=order_id)
        
        # Check if user can access this order
        if not (self.request.user == order.client or 
                self.request.user == order.worker or 
                self.request.user.is_staff):
            return Response(
                {'error': 'You do not have permission to access this conversation'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        conversation, created = Conversation.objects.get_or_create(order=order)
        return conversation


class MessageListCreateView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        order_id = self.kwargs['order_id']
        order = get_object_or_404(Order, id=order_id)
        
        # Check if user can access this order
        if not (self.request.user == order.client or 
                self.request.user == order.worker or 
                self.request.user.is_staff):
            return Message.objects.none()
        
        conversation, _ = Conversation.objects.get_or_create(order=order)
        return Message.objects.filter(conversation=conversation).order_by('timestamp')

    def perform_create(self, serializer):
        order_id = self.kwargs['order_id']
        order = get_object_or_404(Order, id=order_id)
        
        # Check if user can access this order
        if not (self.request.user == order.client or 
                self.request.user == order.worker or 
                self.request.user.is_staff):
            return Response(
                {'error': 'You do not have permission to send messages to this conversation'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        conversation, _ = Conversation.objects.get_or_create(order=order)
        serializer.save(conversation=conversation, sender=self.request.user)


class UserConversationsView(generics.ListAPIView):
    """Get all conversations for the current user"""
    serializer_class = ConversationListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Get all conversations where the user is either client or worker
        conversations = Conversation.objects.filter(
            Q(order__client=user) | Q(order__worker=user)
        ).annotate(
            message_count=Count('messages'),
            last_message_time=Max('messages__timestamp')
        ).order_by('-last_message_time')
        
        return conversations


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_unread_message_count(request):
    """Get the count of unread messages for the current user"""
    user = request.user
    
    # For now, we'll consider all messages as potentially unread
    # In a real implementation, you'd track read status per user
    unread_count = Message.objects.filter(
        Q(conversation__order__client=user) | Q(conversation__order__worker=user)
    ).exclude(sender=user).count()
    
    # You can also implement a more sophisticated system with read receipts
    # by adding a 'read_by' field to messages or creating a separate ReadReceipt model
    
    return Response({
        'unread_count': min(unread_count, 99),  # Cap at 99 for display
        'has_unread': unread_count > 0
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_recent_messages(request):
    """Get recent messages preview for the current user"""
    user = request.user
    limit = int(request.GET.get('limit', 5))
    
    # Get recent messages from conversations the user is part of
    recent_messages = Message.objects.filter(
        Q(conversation__order__client=user) | Q(conversation__order__worker=user)
    ).exclude(sender=user).select_related(
        'sender', 'conversation__order'
    ).order_by('-timestamp')[:limit]
    
    messages_data = []
    for message in recent_messages:
        messages_data.append({
            'id': message.id,
            'message': message.message[:100] + ('...' if len(message.message) > 100 else ''),
            'sender_name': message.sender.get_full_name() or message.sender.username,
            'timestamp': message.timestamp,
            'order_id': message.conversation.order.id,
            'conversation_id': message.conversation.id
        })
    
    return Response({
        'recent_messages': messages_data,
        'count': len(messages_data)
    })
