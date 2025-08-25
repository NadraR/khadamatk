from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from .models import WorkerProfile, ClientProfile

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        if instance.role == 'worker':
            WorkerProfile.objects.create(user=instance)
        elif instance.role == 'client':
            ClientProfile.objects.create(user=instance)