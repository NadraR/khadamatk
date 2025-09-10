from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.contenttypes.models import ContentType
from django.utils import timezone
from .models import Notification
from .serializers import NotificationSerializer, NotificationListSerializer, NotificationUpdateSerializer
from orders.models import Order

class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        content_type = ContentType.objects.get_for_model(user.__class__)
        
        qs = Notification.objects.filter(
            recipient_content_type=content_type,
            recipient_object_id=user.id
        )
        
        unread = self.request.query_params.get('unread')
        if unread and unread.lower() in ('1', 'true', 'yes'):
            qs = qs.filter(read_at__isnull=True)
        
        level = self.request.query_params.get('level')
        if level in dict(Notification.LEVEL_CHOICES):
            qs = qs.filter(level=level)
        
        return qs.order_by('-created_at')
    
    def _get_user_profile(self):
        user = self.request.user
        if hasattr(user, 'worker_profile'):
            return user.worker_profile
        elif hasattr(user, 'client_profile'):
            return user.client_profile
        return None


class NotificationDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return NotificationUpdateSerializer
        return NotificationSerializer
    
    def get_queryset(self):
        user = self.request.user
        content_type = ContentType.objects.get_for_model(user.__class__)
        return Notification.objects.filter(
            recipient_content_type=content_type,
            recipient_object_id=user.id
        )
    
    def _get_user_profile(self):
        user = self.request.user
        if hasattr(user, 'worker_profile'):
            return user.worker_profile
        elif hasattr(user, 'client_profile'):
            return user.client_profile
        return None


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def unread_count(request):
    user = request.user
    content_type = ContentType.objects.get_for_model(user.__class__)
    
    count = Notification.objects.filter(
        recipient_content_type=content_type,
        recipient_object_id=user.id,
        read_at__isnull=True
    ).count()
    
    return Response({'unread_count': count})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_read(request, pk):
    user = request.user
    content_type = ContentType.objects.get_for_model(user.__class__)
    
    notification = get_object_or_404(
        Notification,
        pk=pk,
        recipient_content_type=content_type,
        recipient_object_id=user.id
    )
    
    notification.mark_as_read()
    return Response({'status': 'ok', 'message': 'تم تحديد الإشعار كمقروء'})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_all_read(request):
    user = request.user
    content_type = ContentType.objects.get_for_model(user.__class__)
    
    notifications = Notification.objects.filter(
        recipient_content_type=content_type,
        recipient_object_id=user.id,
        read_at__isnull=True
    )
    
    count = notifications.count()
    notifications.update(read_at=timezone.now())
    
    return Response({
        'status': 'ok', 
        'message': f'تم تحديد {count} إشعارات كمقروءة',
        'count': count
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def notification_stats(request):
    user = request.user
    content_type = ContentType.objects.get_for_model(user.__class__)
    
    unread_count = Notification.objects.filter(
        recipient_content_type=content_type,
        recipient_object_id=user.id,
        read_at__isnull=True
    ).count()
    
    total_count = Notification.objects.filter(
        recipient_content_type=content_type,
        recipient_object_id=user.id
    ).count()
    
    level_stats = {}
    for level_code, level_name in Notification.LEVEL_CHOICES:
        count = Notification.objects.filter(
            recipient_content_type=content_type,
            recipient_object_id=user.id,
            level=level_code
        ).count()
        level_stats[level_code] = {
            'count': count,
            'display_name': level_name
        }
    
    return Response({
        'unread_count': unread_count,
        'total_count': total_count,
        'read_count': total_count - unread_count,
        'level_stats': level_stats
    })


def _get_user_profile_from_request(request):
    user = request.user
    if hasattr(user, 'worker_profile'):
        return user.worker_profile
    elif hasattr(user, 'client_profile'):
        return user.client_profile
    return None
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def notification_action(request, notification_id):
    """Handle accept/decline actions for notifications"""
    try:
        user = request.user
        content_type = ContentType.objects.get_for_model(user.__class__)
        
        notification = get_object_or_404(
            Notification,
            id=notification_id,
            recipient_content_type=content_type,
            recipient_object_id=user.id,
            requires_action=True,
            action_taken=False
        )
        
        action = request.data.get('action')  # 'accept' or 'decline'
        
        if action not in ['accept', 'decline']:
            return Response(
                {'error': 'Invalid action. Must be "accept" or "decline"'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if the notification is related to an order
        if notification.target and isinstance(notification.target, Order):
            order = notification.target
            
            # Verify user is the service provider
            if hasattr(order.service, 'provider') and order.service.provider != user:
                return Response(
                    {'error': 'You are not authorized to perform this action'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Update order status based on action
            if action == 'accept':
                if order.status == 'pending':
                    order.status = 'accepted'
                    order.save()
                    
                    # Mark notification action as taken
                    notification.take_action('accepted')
                    notification.mark_as_read()
                    
                    return Response({
                        'success': True,
                        'message': 'تم قبول الطلب بنجاح',
                        'order_status': 'accepted',
                        'notification': NotificationSerializer(notification).data
                    })
                else:
                    return Response(
                        {'error': 'Order is no longer pending'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            elif action == 'decline':
                if order.status == 'pending':
                    order.status = 'cancelled'
                    order.save()
                    
                    # Mark notification action as taken
                    notification.take_action('declined')
                    notification.mark_as_read()
                    
                    return Response({
                        'success': True,
                        'message': 'تم رفض الطلب',
                        'order_status': 'cancelled',
                        'notification': NotificationSerializer(notification).data
                    })
                else:
                    return Response(
                        {'error': 'Order is no longer pending'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
        
        return Response(
            {'error': 'This notification does not support actions'},
            status=status.HTTP_400_BAD_REQUEST
        )
        
    except Notification.DoesNotExist:
        return Response(
            {'error': 'Notification not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

