# orders/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Order
from invoices.models import Invoice
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

# 1️⃣ إنشاء فاتورة لما الطلب يكتمل - Temporarily disabled
# @receiver(post_save, sender=Order)
def create_invoice_when_completed_disabled(sender, instance, created, **kwargs):
    if not created and instance.status == 'completed':
        if not Invoice.objects.filter(order=instance).exists():
            Invoice.objects.create(
                order=instance,
                total_amount=instance.service.price
            )

# 2️⃣ غلق الشات لما الطلب يكتمل أو يُلغى
@receiver(post_save, sender=Order)
def close_chat_on_order_complete(sender, instance, **kwargs):
    if instance.status in ['completed', 'cancelled']:
        channel_layer = get_channel_layer()
        if channel_layer is not None:
            async_to_sync(channel_layer.group_send)(
                f'chat_{instance.id}',
                {
                    'type': 'order_closed',
                    'order_id': instance.id,
                }
            )
