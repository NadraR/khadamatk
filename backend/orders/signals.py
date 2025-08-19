from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Order
from invoices.models import Invoice

@receiver(post_save, sender=Order)
def create_invoice_when_completed(sender, instance, created, **kwargs):
    if not created and instance.status == 'completed':
        if not Invoice.objects.filter(order=instance).exists():
            Invoice.objects.create(
                order=instance,
                total_amount=instance.service.price 
            )
