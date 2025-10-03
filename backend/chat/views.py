from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count, Max
from django.utils import timezone
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer, ConversationListSerializer
from orders.models import Order


class ConversationDetailView(generics.RetrieveAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        order_id = self.kwargs['order_id']
        order = get_object_or_404(Order, id=order_id)

        if order.status == 'cancelled':
            return Response(
                {'error': 'Cannot chat for cancelled orders'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not (self.request.user == order.customer or
                self.request.user == order.worker or
                (order.service.provider and self.request.user == order.service.provider) or
                self.request.user.is_staff):
            return Response(
                {'error': 'You do not have permission to access this conversation'},
                status=status.HTTP_403_FORBIDDEN
            )

        conversation, _ = Conversation.objects.get_or_create(order=order)
        return conversation


class MessageListCreateView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        order_id = self.kwargs['order_id']
        order = get_object_or_404(Order, id=order_id)

        if order.status == 'cancelled':
            return Message.objects.none()

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

        if order.status == 'cancelled':
            return Response(
                {'error': 'Cannot send messages for cancelled orders'},
                status=status.HTTP_400_BAD_REQUEST
            )

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
        unread_count = Message.objects.filter(
            Q(conversation__order__customer=user) | Q(conversation__order__worker=user)
        ).exclude(
            sender=user
        ).exclude(
            conversation__order__status='cancelled'
        ).filter(
            conversation__order__status__in=['accepted', 'completed', 'in_progress'],
            is_read=False
        ).count()

        return Response({
            'unread_count': min(unread_count, 99),
            'has_unread': unread_count > 0
        })
    except Exception as e:
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

        recent_messages = Message.objects.filter(
            Q(conversation__order__customer=user) | Q(conversation__order__worker=user)
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
        return Response({
            'recent_messages': [],
            'count': 0,
            'error': str(e)
        })


class MarkConversationReadView(APIView):
    """Mark all messages in a conversation as read"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, order_id):
        try:
            conversation = Conversation.objects.get(order_id=order_id)

            # Ensure user has access
            if request.user not in [conversation.order.customer, conversation.order.worker]:
                return Response({"error": "ليس لديك صلاحية لعرض هذه المحادثة"}, status=403)

            updated_count = conversation.messages.filter(
                is_read=False
            ).exclude(sender=request.user).update(
                is_read=True,
                read_at=timezone.now()
            )

            return Response({"success": True, "updated": updated_count})

        except Conversation.DoesNotExist:
            return Response({"error": "المحادثة غير موجودة"}, status=404)


class MarkAllMessagesReadView(APIView):
    """Mark all messages in all conversations as read"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        updated_count = Message.objects.filter(
            Q(conversation__order__customer=user) | Q(conversation__order__worker=user),
            is_read=False
        ).exclude(sender=user).update(
            is_read=True,
            read_at=timezone.now()
        )

        return Response({"success": True, "updated": updated_count})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_messages_as_read(request):
    """Mark messages as read for a specific order"""
    try:
        order_id = request.data.get('order_id')
        if not order_id:
            return Response({"error": "order_id is required"}, status=400)

        conversation = Conversation.objects.get(order_id=order_id)

        # Ensure user has access
        if request.user not in [conversation.order.customer, conversation.order.worker]:
            return Response({"error": "ليس لديك صلاحية لعرض هذه المحادثة"}, status=403)

        updated_count = conversation.messages.filter(
            is_read=False
        ).exclude(sender=request.user).update(
            is_read=True,
            read_at=timezone.now()
        )

        return Response({"success": True, "updated": updated_count})

    except Conversation.DoesNotExist:
        return Response({"error": "المحادثة غير موجودة"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_all_messages_as_read(request):
    """Mark all messages in all conversations as read"""
    try:
        user = request.user
        updated_count = Message.objects.filter(
            Q(conversation__order__customer=user) | Q(conversation__order__worker=user),
            is_read=False
        ).exclude(sender=user).update(
            is_read=True,
            read_at=timezone.now()
        )

        return Response({"success": True, "updated": updated_count})
    except Exception as e:
        return Response({"error": str(e)}, status=500)
