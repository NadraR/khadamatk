from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from orders.models import Order
from .models import Notification

@receiver(post_save, sender=Order)
def order_created_or_updated(sender, instance: Order, created, **kwargs):
    if kwargs.get('raw', False):
        return
    
    provider = getattr(instance.service, 'provider', None)
    customer = instance.customer
    
    order_content_type = ContentType.objects.get_for_model(Order)
    order_url = f"/orders/{instance.id}/"

    if created:
        # Notify the worker/provider about new order
        if provider:
            # Create location address from coordinates if available
            location_address = ""
            if instance.location_lat and instance.location_lng:
                location_address = f"الموقع: {instance.location_lat:.4f}, {instance.location_lng:.4f}"
            
            _create_notification(
                recipient=provider,
                actor=customer,
                verb='order_created',
                message=f"طلب جديد لخدمة '{instance.service.title}' من {customer.get_full_name() or customer.username}",
                target=instance,
                url=order_url,
                level='info',
                offered_price=instance.offered_price,
                service_name=instance.service.title,
                job_description=instance.description,  # The specific work details from the client
                location_lat=instance.location_lat,
                location_lng=instance.location_lng,
                location_address=location_address,
                requires_action=True  # Workers can accept/decline new orders
            )
        
        # Notify the customer that their order was created
        _create_notification(
            recipient=customer,
            actor=None,
            verb='order_created_confirm',
            message=f"تم إنشاء طلبك رقم #{instance.id} بنجاح",
            target=instance,
            url=order_url,
            level='success',
            offered_price=instance.offered_price,
            service_price=instance.service.price if hasattr(instance.service, 'price') else None,
            service_name=instance.service.title,
            job_description=instance.description or 'طلب جديد',  # Provide default value
            location_lat=instance.location_lat,
            location_lng=instance.location_lng,
            location_address=location_address,
            requires_action=False  # Customers don't need to take action on confirmation
        )
    
    else:
        # Handle status changes
        old_status = getattr(instance, '_old_status', None)
        
        if old_status and old_status != instance.status:
            # Notify customer about status changes
            status_messages = {
                'accepted': f"تم قبول طلبك رقم #{instance.id}! سيتم التواصل معك قريباً لتنسيق الموعد",
                'cancelled': f"تم إلغاء طلبك رقم #{instance.id}",
                'completed': f"تم إكمال طلبك رقم #{instance.id} بنجاح!",
                'in_progress': f"بدأ العمل على طلبك رقم #{instance.id}",
            }
            
            if instance.status in status_messages:
                level = 'success' if instance.status in ['accepted', 'completed'] else 'warning' if instance.status == 'cancelled' else 'info'
                
                _create_notification(
                    recipient=customer,
                    actor=provider,
                    verb=f'order_{instance.status}',
                    message=status_messages[instance.status],
                    target=instance,
                    url=order_url,
                    level=level
                )
            
            # Notify provider about status changes (except when they're the ones changing it)
            if provider and instance.status in ['cancelled']:
                provider_messages = {
                    'cancelled': f"تم إلغاء الطلب رقم #{instance.id} من قبل العميل",
                }
                
                _create_notification(
                    recipient=provider,
                    actor=customer,
                    verb=f'order_{instance.status}_provider',
                    message=provider_messages.get(instance.status, f"تم تغيير حالة الطلب #{instance.id} إلى {_get_status_display(instance.status)}"),
                    target=instance,
                    url=order_url,
                    level='warning' if instance.status == 'cancelled' else 'info'
                )


def _create_notification(recipient, actor, verb, message, target, url, level=None, offered_price=None, service_price=None, service_name=None, job_description=None, location_lat=None, location_lng=None, location_address=None, requires_action=False):
    if not level:
        level = _get_notification_level(verb)
    
    try:
        from django.contrib.contenttypes.models import ContentType
        
        # Get content type for recipient
        recipient_content_type = ContentType.objects.get_for_model(recipient)
        
        # Get content type for target if target is provided
        target_content_type = None
        target_object_id = None
        if target:
            target_content_type = ContentType.objects.get_for_model(target)
            target_object_id = target.id
        
        Notification.objects.create(
            recipient_content_type=recipient_content_type,
            recipient_object_id=recipient.id,
            actor=actor,
            verb=verb,
            message=message,
            short_message=message[:100],
            target_content_type=target_content_type,
            target_object_id=target_object_id,
            url=url,
            level=level,
            offered_price=offered_price,
            service_price=service_price,
            service_name=service_name,
            job_description=job_description,
            location_lat=location_lat,
            location_lng=location_lng,
            location_address=location_address,
            requires_action=requires_action
        )
    except Exception as e:
        print(f"Error creating notification: {e}")
        # Don't fail the order creation if notification fails


def _get_notification_level(verb):
    level_mapping = {
        'order_created': 'info',
        'order_created_confirm': 'success',
        'order_accepted': 'success',
        'order_cancelled': 'warning',
        'order_completed': 'success',
        'order_in_progress': 'info',
        'order_cancelled_provider': 'warning',
        'order_status_changed': 'info',
        'order_status_changed_provider': 'info',
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


@receiver(pre_save, sender=Order)
def save_old_status(sender, instance, **kwargs):
    if instance.pk:
        try:
            old_instance = Order.objects.get(pk=instance.pk)
            instance._old_status = old_instance.status
        except Order.DoesNotExist:
            instance._old_status = None    
    else:
        instance._old_status = None

