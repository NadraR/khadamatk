from django.db import models
from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.utils import timezone

class Notification(models.Model):
    LEVEL_CHOICES = [
        ('info', 'معلومات'),
        ('success', 'نجاح'),
        ('warning', 'تحذير'),
        ('error', 'خطأ'),
    ]
    
    # المستلم (Generic Foreign Key)
    recipient_content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    recipient_object_id = models.PositiveIntegerField()
    recipient = GenericForeignKey('recipient_content_type', 'recipient_object_id')
    
    # المسبب (يمكن أن يكون User أو None)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='actor_notifications'
    )
    
    verb = models.CharField(max_length=140, blank=True, verbose_name="نوع الحدث")
    message = models.TextField(blank=True, verbose_name="نص الإشعار")
    short_message = models.CharField(max_length=100, blank=True, verbose_name="رسالة مختصرة")
    level = models.CharField(max_length=10, choices=LEVEL_CHOICES, default='info', verbose_name="مستوى الأهمية")
    
    # الهدف (Generic Foreign Key)
    target_content_type = models.ForeignKey(
        ContentType,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='target_notifications'
    )
    target_object_id = models.PositiveIntegerField(null=True, blank=True)
    target = GenericForeignKey('target_content_type', 'target_object_id')
    
    url = models.CharField(max_length=512, blank=True, verbose_name="رابط")
    read_at = models.DateTimeField(null=True, blank=True, verbose_name="وقت القراءة")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="وقت الإنشاء")

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'إشعار'
        verbose_name_plural = 'الإشعارات'

    def __str__(self):
        return f"إشعار لـ {self.recipient} - {self.verb}"
    
    @property
    def is_read(self):
        return self.read_at is not None
    
    def mark_as_read(self):
        if not self.read_at:
            self.read_at = timezone.now()
            self.save()
    
    def mark_as_unread(self):
        if self.read_at:
            self.read_at = None
            self.save()