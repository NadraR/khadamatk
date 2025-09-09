# backend/invoices/signals.py
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone
from orders.models import Order
from .models import Invoice, WorkerEarnings
import logging

logger = logging.getLogger(__name__)

@receiver(post_save, sender=Order)
def handle_booking_status_change(sender, instance, created, **kwargs):
    """
    إدارة الفواتير تلقائياً عند تغيير حالة الحجز
    """
    logger.info(f"Signal triggered for Order {instance.id}: status={instance.status}, created={created}")
    
    if instance.status == 'completed':
        invoice_exists = Invoice.objects.filter(order=instance).exists()
        logger.info(f"Invoice exists for order {instance.id}: {invoice_exists}")
        
        if not invoice_exists:
            try:
                # استخدام السعر المعروض من العميل أو السعر الأساسي للخدمة
                amount = instance.offered_price or instance.service.price
                logger.info(f"Creating invoice for order {instance.id} with amount: {amount}")
                
                # تحديد تاريخ الاستحقاق (7 أيام من تاريخ الاكتمال)
                due_date = timezone.now() + timezone.timedelta(days=7)
                
                invoice = Invoice.objects.create(
                    order=instance,
                    amount=amount,
                    status=Invoice.STATUS_UNPAID,
                    due_date=due_date,
                    notes=f"فاتورة للخدمة: {instance.service.title}"
                )
                logger.info(f"تم إنشاء فاتورة جديدة للحجز #{instance.id} بمبلغ {amount}, Invoice ID: {invoice.id}")
                
            except Exception as e:
                logger.error(f"خطأ في إنشاء الفاتورة: {e}")
                logger.error(f"Order details: id={instance.id}, status={instance.status}, service={instance.service}")
    
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


@receiver(post_save, sender=Invoice)
def create_worker_earnings(sender, instance, created, **kwargs):
    """
    إنشاء أرباح العامل عند دفع الفاتورة
    """
    if not created and instance.status == Invoice.STATUS_PAID:
        # التحقق من وجود أرباح سابقة
        earnings_exists = WorkerEarnings.objects.filter(invoice=instance).exists()
        
        if not earnings_exists and instance.order.worker:
            try:
                # إنشاء أرباح العامل
                WorkerEarnings.objects.create(
                    worker=instance.order.worker,
                    invoice=instance,
                    gross_amount=instance.amount
                )
                logger.info(f"تم إنشاء أرباح للعامل {instance.order.worker.id} من الفاتورة {instance.id}")
            except Exception as e:
                logger.error(f"خطأ في إنشاء أرباح العامل للفاتورة {instance.id}: {e}")