# backend/invoices/signals.py
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone
from orders.models import Order
from .models import Invoice
import logging

logger = logging.getLogger(__name__)

@receiver(post_save, sender=Order)
def handle_booking_status_change(sender, instance, created, **kwargs):
    """
    إدارة الفواتير تلقائياً عند تغيير حالة الحجز
    """
    if instance.status == 'completed':
        invoice_exists = Invoice.objects.filter(order=instance).exists()
        
        if not invoice_exists:
            try:
                # استخدام السعر المعروض من العميل أو السعر الأساسي للخدمة
                amount = instance.offered_price or instance.service.price
                
                # تحديد تاريخ الاستحقاق (7 أيام من تاريخ الاكتمال)
                due_date = timezone.now() + timezone.timedelta(days=7)
                
                Invoice.objects.create(
                    order=instance,
                    amount=amount,
                    status=Invoice.STATUS_UNPAID,
                    due_date=due_date,
                    notes=f"فاتورة للخدمة: {instance.service.title}"
                )
                logger.info(f"تم إنشاء فاتورة جديدة للحجز #{instance.id} بمبلغ {amount}")
                
            except AttributeError as e:
                logger.error(f"خطأ في إنشاء الفاتورة: {e}")
    
    elif instance.status in ['cancelled', 'pending']:
        try:
            invoice = Invoice.objects.get(order=instance)
            invoice.delete()
            logger.info(f"تم حذف فاتورة الحجز #{instance.id}")
        except Invoice.DoesNotExist:
            pass

@receiver(pre_save, sender=Invoice)
def handle_invoice_payment(sender, instance, **kwargs):
    """
    تحديث وقت الدفع تلقائياً عند تغيير حالة الفاتورة إلى مدفوعة
    """
    if instance.pk: 
        try:
            old_instance = Invoice.objects.get(pk=instance.pk)
            if old_instance.status != instance.STATUS_PAID and instance.status == instance.STATUS_PAID:
                instance.paid_at = timezone.now()
        except Invoice.DoesNotExist:
            pass