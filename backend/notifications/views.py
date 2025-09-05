from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.contenttypes.models import ContentType
from django.utils import timezone
from .models import Notification
from .serializers import NotificationSerializer, NotificationListSerializer, NotificationUpdateSerializer

class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user_profile = self._get_user_profile()
        if not user_profile:
            return Notification.objects.none()
        
        content_type = ContentType.objects.get_for_model(user_profile.__class__)
        
        qs = Notification.objects.filter(
            recipient_content_type=content_type,
            recipient_object_id=user_profile.id
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
        user_profile = self._get_user_profile()
        if not user_profile:
            return Notification.objects.none()
        
        content_type = ContentType.objects.get_for_model(user_profile.__class__)
        return Notification.objects.filter(
            recipient_content_type=content_type,
            recipient_object_id=user_profile.id
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
    user_profile = _get_user_profile_from_request(request)
    if not user_profile:
        return Response({'unread_count': 0})
    
    content_type = ContentType.objects.get_for_model(user_profile.__class__)
    
    count = Notification.objects.filter(
        recipient_content_type=content_type,
        recipient_object_id=user_profile.id,
        read_at__isnull=True
    ).count()
    
    return Response({'unread_count': count})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_read(request, pk):
    user_profile = _get_user_profile_from_request(request)
    if not user_profile:
        return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    content_type = ContentType.objects.get_for_model(user_profile.__class__)
    
    notification = get_object_or_404(
        Notification,
        pk=pk,
        recipient_content_type=content_type,
        recipient_object_id=user_profile.id
    )
    
    notification.mark_as_read()
    return Response({'status': 'ok', 'message': 'تم تحديد الإشعار كمقروء'})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_all_read(request):
    user_profile = _get_user_profile_from_request(request)
    if not user_profile:
        return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    content_type = ContentType.objects.get_for_model(user_profile.__class__)
    
    notifications = Notification.objects.filter(
        recipient_content_type=content_type,
        recipient_object_id=user_profile.id,
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
    user_profile = _get_user_profile_from_request(request)
    if not user_profile:
        return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    content_type = ContentType.objects.get_for_model(user_profile.__class__)
    
    unread_count = Notification.objects.filter(
        recipient_content_type=content_type,
        recipient_object_id=user_profile.id,
        read_at__isnull=True
    ).count()
    
    total_count = Notification.objects.filter(
        recipient_content_type=content_type,
        recipient_object_id=user_profile.id
    ).count()
    
    level_stats = {}
    for level_code, level_name in Notification.LEVEL_CHOICES:
        count = Notification.objects.filter(
            recipient_content_type=content_type,
            recipient_object_id=user_profile.id,
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