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
        
        # Check if order is cancelled - no chat allowed
        if order.status == 'cancelled':
            return Response(
                {'error': 'Cannot chat for cancelled orders'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user can access this order
        if not (self.request.user == order.customer or 
                self.request.user == order.worker or
                (order.service.provider and self.request.user == order.service.provider) or 
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
        
        # Check if order is cancelled - no chat allowed
        if order.status == 'cancelled':
            return Message.objects.none()
        
        # Check if user can access this order
        if not (self.request.user == order.customer or 
                self.request.user == order.worker or
                (order.service.provider and self.request.user == order.service.provider) or 
                self.request.user.is_staff):
            return Message.objects.none()
        
        conversation, _ = Conversation.objects.get_or_create(order=order)
        return Message.objects.filter(conversation=conversation).order_by('timestamp')

    def perform_create(self, serializer):
        order_id = self.kwargs['order_id']
        order = get_object_or_404(Order, id=order_id)
        
        # Check if order is cancelled - no messages allowed
        if order.status == 'cancelled':
            return Response(
                {'error': 'Cannot send messages for cancelled orders'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user can access this order
        if not (self.request.user == order.customer or 
                self.request.user == order.worker or
                (order.service.provider and self.request.user == order.service.provider) or 
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
        # Get all conversations where the user is either customer, worker, or service provider
        # Exclude cancelled orders
        conversations = Conversation.objects.filter(
            Q(order__customer=user) | Q(order__worker=user) | Q(order__service__provider=user)
        ).exclude(
            order__status='cancelled'
        ).filter(
            order__status__in=['accepted', 'completed', 'in_progress']
        ).annotate(
            message_count=Count('messages'),
            last_message_time=Max('messages__timestamp')
        ).order_by('-last_message_time')
        
        return conversations


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_unread_message_count(request):
    """Get the count of unread messages for the current user"""
    try:
        user = request.user
        
        # For now, we'll consider all messages as potentially unread
        # In a real implementation, you'd track read status per user
        # Exclude messages from cancelled orders
        unread_count = Message.objects.filter(
            Q(conversation__order__customer=user) | Q(conversation__order__service__provider=user)
        ).exclude(
            sender=user
        ).exclude(
            conversation__order__status='cancelled'
        ).filter(
            conversation__order__status__in=['accepted', 'completed', 'in_progress']
        ).count()
        
        # You can also implement a more sophisticated system with read receipts
        # by adding a 'read_by' field to messages or creating a separate ReadReceipt model
        
        return Response({
            'unread_count': min(unread_count, 99),  # Cap at 99 for display
            'has_unread': unread_count > 0
        })
    except Exception as e:
        print(f"Error in get_unread_message_count: {str(e)}")
        return Response({
            'unread_count': 0,
            'has_unread': False,
            'error': str(e)
        })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_recent_messages(request):
    """Get recent messages preview for the current user"""
    try:
        user = request.user
        limit = int(request.GET.get('limit', 5))
        
        # Get recent messages from conversations the user is part of
        recent_messages = Message.objects.filter(
            Q(conversation__order__customer=user) | Q(conversation__order__service__provider=user)
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
    except Exception as e:
        print(f"Error in get_recent_messages: {str(e)}")
        return Response({
            'recent_messages': [],
            'count': 0,
            'error': str(e)
        })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_messages_as_read(request):
    """Mark all messages in a conversation as read for the current user"""
    try:
        user = request.user
        order_id = request.data.get('order_id')
        
        if not order_id:
            return Response({
                'error': 'order_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get the conversation for this order
        try:
            order = Order.objects.get(id=order_id)
            conversation = Conversation.objects.get(order=order)
        except (Order.DoesNotExist, Conversation.DoesNotExist):
            return Response({
                'error': 'Order or conversation not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check if user can access this conversation
        if not (user == order.customer or 
                user == order.worker or
                (order.service.provider and user == order.service.provider) or 
                user.is_staff):
            return Response({
                'error': 'You do not have permission to access this conversation'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # For now, we'll just return success since we don't have read tracking yet
        # In a real implementation, you'd update a read status field
        return Response({
            'success': True,
            'message': 'Messages marked as read'
        })
        
    except Exception as e:
        print(f"Error in mark_messages_as_read: {str(e)}")
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_all_messages_as_read(request):
    """Mark all messages as read for the current user"""
    try:
        user = request.user
        
        # For now, we'll just return success since we don't have read tracking yet
        # In a real implementation, you'd update a read status field for all conversations
        return Response({
            'success': True,
            'message': 'All messages marked as read'
        })
        
    except Exception as e:
        print(f"Error in mark_all_messages_as_read: {str(e)}")
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


