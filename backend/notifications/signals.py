from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from orders.models import Order
from .models import Notification

@receiver(post_save, sender=Order)
def order_created_or_updated(sender, instance: Order, created, **kwargs):
    if kwargs.get('raw', False):
        return
    
    provider = getattr(instance.service, 'provider', None)
    customer_profile = getattr(instance.customer, 'client_profile', None)
    provider_profile = getattr(provider, 'worker_profile', None) if provider else None
    
    order_content_type = ContentType.objects.get_for_model(Order)
    order_url = f"/orders/{instance.id}/"

    if created:
        if provider_profile:
            _create_notification(
                recipient=provider_profile,
                actor=instance.customer,
                verb='order_created',
                message=f"طلب جديد رقم #{instance.id} من {instance.customer.username}",
                target=instance,
                url=order_url
            )
        
        if customer_profile:
            _create_notification(
                recipient=customer_profile,
                actor=None,
                verb='order_created_confirm',
                message=f"تم إنشاء طلبك رقم #{instance.id} بنجاح",
                target=instance,
                url=order_url
            )
    
    else:
        old_status = None
        if hasattr(instance, '_old_status'):
            old_status = instance._old_status
        
        if old_status != instance.status:
            if customer_profile:
                _create_notification(
                    recipient=customer_profile,
                    actor=provider,
                    verb='order_status_changed',
                    message=f"تم تغيير حالة طلبك #{instance.id} إلى {_get_status_display(instance.status)}",
                    target=instance,
                    url=order_url
                )
            
            if provider_profile:
                _create_notification(
                    recipient=provider_profile,
                    actor=instance.customer,
                    verb='order_status_changed_provider',
                    message=f"تم تغيير حالة الطلب #{instance.id} إلى {_get_status_display(instance.status)}",
                    target=instance,
                    url=order_url
                )


def _create_notification(recipient, actor, verb, message, target, url):
    Notification.objects.create(
        recipient=recipient,
        actor=actor,
        verb=verb,
        message=message,
        short_message=message[:100],
        target=target,
        url=url,
        level=_get_notification_level(verb)
    )


def _get_notification_level(verb):
    level_mapping = {
        'order_created': 'info',
        'order_created_confirm': 'success',
        'order_status_changed': 'info',
        'order_status_changed_provider': 'info',
        'order_cancelled': 'warning',
        'order_completed': 'success',
        'order_payment_failed': 'error',
    }
    return level_mapping.get(verb, 'info')


def _get_status_display(status):
    status_display = {
        'pending': 'قيد الانتظار',
        'accepted': 'مقبول',
        'in_progress': 'قيد التنفيذ',
        'completed': 'مكتمل',
        'cancelled': 'ملغي',
        'rejected': 'مرفوض',
    }
    return status_display.get(status, status)


@receiver(post_save, sender=Order)
def save_old_status(sender, instance, **kwargs):
    if instance.pk:
        try:
            old_instance = Order.objects.get(pk=instance.pk)
            instance._old_status = old_instance.status
        except Order.DoesNotExist:
            instance._old_status = None