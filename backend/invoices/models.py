from django.db import models
from django.core.validators import MinValueValidator
from django.utils import timezone

class Invoice(models.Model):
    STATUS_PAID = 'paid'
    STATUS_UNPAID = 'unpaid'
    STATUS_PENDING = 'pending'
    STATUS_OVERDUE = 'overdue'
    STATUS_CHOICES = [
        (STATUS_PAID, 'تم الدفع'),
        (STATUS_UNPAID, 'لم يتم الدفع'),
        (STATUS_PENDING, 'قيد الانتظار'),
        (STATUS_OVERDUE, 'متأخر'),
    ]
    
    PAYMENT_CASH = 'cash'
    PAYMENT_CARD = 'card'
    PAYMENT_WALLET = 'wallet'
    PAYMENT_BANK = 'bank'
    PAYMENT_CHOICES = [
        (PAYMENT_CASH, 'نقداً'),
        (PAYMENT_CARD, 'بطاقة ائتمان'),
        (PAYMENT_WALLET, 'محفظة إلكترونية'),
        (PAYMENT_BANK, 'تحويل بنكي'),
    ]
    
    booking = models.OneToOneField(
        'orders.Order', 
        on_delete=models.CASCADE,
        related_name='invoice',
        verbose_name='الحجز'
    )
    
    amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0.01)],
        verbose_name='المبلغ'
    )
    
    status = models.CharField(
        max_length=10, 
        choices=STATUS_CHOICES, 
        default=STATUS_UNPAID,
        verbose_name='حالة الفاتورة'
    )
    
    issued_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='تاريخ الإصدار'
    )
    
    paid_at = models.DateTimeField(
        null=True, 
        blank=True,
        verbose_name='تاريخ الدفع'
    )
    
    payment_method = models.CharField(
        max_length=10,
        choices=PAYMENT_CHOICES,
        null=True,
        blank=True,
        verbose_name='طريقة الدفع'
    )
    
    due_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='تاريخ الاستحقاق'
    )
    
    notes = models.TextField(
        blank=True,
        verbose_name='ملاحظات'
    )
    
    class Meta:
        verbose_name = 'فاتورة'
        verbose_name_plural = 'الفواتير'
        ordering = ['-issued_at']
    
    def __str__(self):
        return f'فاتورة #{self.id} - {self.booking}'
    
    def mark_as_paid(self, payment_method=None):
        if self.status != self.STATUS_PAID:
            self.status = self.STATUS_PAID
            self.paid_at = timezone.now()
            if payment_method:
                self.payment_method = payment_method
            self.save()
    
    @property
    def is_overdue(self):
        if self.due_date and self.status != self.STATUS_PAID:
            return timezone.now() > self.due_date
        return False
    
    @property
    def order_title(self):
        return f"طلب #{self.booking.id} - {self.booking.service.title if self.booking.service else 'خدمة محذوفة'}"