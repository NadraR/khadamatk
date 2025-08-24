from django.db import models
from django.core.validators import MinValueValidator
from django.utils import timezone

class Invoice(models.Model):
    STATUS_PAID = 'paid'
    STATUS_UNPAID = 'unpaid'
    STATUS_CHOICES = [
        (STATUS_PAID, 'تم الدفع'),
        (STATUS_UNPAID, 'لم يتم الدفع'),
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
    
    class Meta:
        verbose_name = 'فاتورة'
        verbose_name_plural = 'الفواتير'
        ordering = ['-issued_at']
    
    def __str__(self):
        return f'فاتورة #{self.id} - {self.booking}'
    
    def mark_as_paid(self):
        if self.status != self.STATUS_PAID:
            self.status = self.STATUS_PAID
            self.paid_at = timezone.now()
            self.save()