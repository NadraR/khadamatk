from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from .models import Service
from notifications.models import Notification

@receiver(post_save, sender=Service)
def notify_service_created(sender, instance, created, **kwargs):
    if created:
        provider = instance.provider
        if provider:
            Notification.objects.create(
                user=provider,  # أو يمكن تعديل لاستهداف مسؤولين مثلاً
                actor=provider,
                verb='service_created',
                message=f"لقد قمت بإنشاء خدمة جديدة: {instance.title}",
                target_content_type=ContentType.objects.get_for_model(instance.__class__),
                target_object_id=instance.id,
                url=f"/services/{instance.id}/"
            )
