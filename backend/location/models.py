from django.db import models
from django.conf import settings
from django.contrib.gis.db import models as gis_models


class UserLocation(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='locations',   # خليتها جمع
        verbose_name="المستخدم"
    )
    
    location = gis_models.PointField(
        srid=4326,
        null=True,
        blank=True,
        verbose_name="الموقع الجغرافي"
    )
    
    address = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name="العنوان المفصل"
    )
    
    city = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name="المدينة"
    )
    
    country = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        default="مصر",
        verbose_name="الدولة"
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاريخ الإنشاء")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="تاريخ التحديث")
    
    class Meta:
        verbose_name = 'موقع المستخدم'
        verbose_name_plural = 'مواقع المستخدمين'
        indexes = [
            gis_models.Index(fields=['location']),
        ]
    
    def __str__(self):
        return f"موقع {self.user.username} - {self.city or 'غير محدد'}"
    
    def get_lat_lng(self):
        """الحصول على الإحداثيات كـ tuple (lat, lng)"""
        if self.location:
            return (self.location.y, self.location.x)
        return (None, None)
