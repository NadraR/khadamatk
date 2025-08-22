from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from reviews.models import Review
from .models import Rating

@receiver(post_save, sender=Review)
def upsert_rating_from_review(sender, instance: Review, created, **kwargs):
    if instance.is_deleted:
        return
    Rating.objects.update_or_create(
        service=instance.service, customer=instance.customer,
        defaults={"score": instance.score}
    )

@receiver(post_delete, sender=Review)
def remove_rating_when_review_deleted(sender, instance: Review, **kwargs):
    Rating.objects.filter(service=instance.service, customer=instance.customer).delete()
