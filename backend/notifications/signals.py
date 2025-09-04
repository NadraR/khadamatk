from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from orders.models import Order

from .models import Notification

# Order created
@receiver(post_save, sender=Order)
def order_created_or_updated(sender, instance: Order, created, **kwargs):
    # إذا تم إنشاء الطلب
    if created:
        # notify provider(s) logic: simplest = notify service.provider if exists
        provider = getattr(instance.service, 'provider', None)
        if provider:
            Notification.objects.create(
                user=provider,
                actor=instance.customer,
                verb='order_created',
                message=f"تلقى طلب جديد رقم {instance.id} من {instance.customer.username}",
                target_content_type=ContentType.objects.get_for_model(instance.__class__),
                target_object_id=instance.id,
                url=f"/orders/{instance.id}/"  # واجهة فرونت
            )
        # notify customer too (confirmation)
        Notification.objects.create(
            user=instance.customer,
            actor=None,
            verb='order_created_confirm',
            message=f"تم إنشاء طلبك رقم {instance.id}.",
            target_content_type=ContentType.objects.get_for_model(instance.__class__),
            target_object_id=instance.id,
            url=f"/orders/{instance.id}/"
        )
    else:
        # تحديث حالة الطلب
        # سنبعت إشعار للعميل عند تغيير الحالة
        Notification.objects.create(
            user=instance.customer,
            actor=None,
            verb='order_status_changed',
            message=f"حالة طلبك #{instance.id} تغيّرت → {instance.status}",
            target_content_type=ContentType.objects.get_for_model(instance.__class__),
            target_object_id=instance.id,
            url=f"/orders/{instance.id}/"
        )
        # لو المقبول أو مكتمل: نخبر المزود
        provider = getattr(instance.service, 'provider', None)
        if provider:
            Notification.objects.create(
                user=provider,
                actor=None,
                verb='order_status_changed_provider',
                message=f"الطلب #{instance.id} الخاص بك تغيّرت حالته إلى {instance.status}",
                target_content_type=ContentType.objects.get_for_model(instance.__class__),
                target_object_id=instance.id,
                url=f"/orders/{instance.id}/"
            )
