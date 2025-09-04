from django.db import models
from django.conf import settings
from django.contrib.gis.db import models as gis_models
from django.contrib.gis.geos import Point
from django.contrib.gis.db.models.functions import Distance
from django.core.cache import cache
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

class UserLocationManager(gis_models.Manager):
    def nearby(self, latitude, longitude, max_results=20, radius_km=10, exclude_user=None):
        """
        إرجاع المواقع الأقرب لنقطة معينة ضمن نصف قطر بالكيلومتر
        """
        point = Point(longitude, latitude, srid=4326)
        queryset = self.get_queryset().filter(
            location__isnull=False,
            location__distance_lte=(point, radius_km * 1000)  # تحويل كم إلى متر
        ).annotate(
            distance=Distance('location', point)
        ).select_related('user').order_by('distance')
        
        if exclude_user:
            queryset = queryset.exclude(user=exclude_user)
            
        return queryset[:max_results]
    
    def get_user_locations(self, user, location_type=None):
        """الحصول على مواقع مستخدم معينة مع إمكانية التصفية حسب النوع"""
        queryset = self.get_queryset().filter(user=user)
        if location_type:
            queryset = queryset.filter(location_type=location_type)
        return queryset.order_by('-created_at')
    
    def get_latest_location(self, user):
        """الحصول على آخر موقع للمستخدم"""
        try:
            return self.get_queryset().filter(user=user).latest('created_at')
        except UserLocation.DoesNotExist:
            return None


class UserLocation(models.Model):
    LOCATION_TYPES = (
        ('home', _('المنزل')),
        ('work', _('العمل')),
        ('favorite', _('المفضلة')),
        ('other', _('أخرى')),
    )
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='locations',
        verbose_name=_("المستخدم"),
        null=True,
        blank=True
    )
    
    name = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name=_("اسم الموقع"),
        help_text=_("اسم تعريفي للموقع مثل 'المنزل' أو 'العمل'")
    )
    
    location_type = models.CharField(
        max_length=20,
        choices=LOCATION_TYPES,
        default='other',
        verbose_name=_("نوع الموقع")

    )
    
    location = gis_models.PointField(
        srid=4326,
        null=True,
        blank=True,
        verbose_name=_("الموقع الجغرافي"),
        help_text=_("الإحداثيات الجغرافية للموقع")
    )
    
    address = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name=_("العنوان المفصل")
    )
    
    city = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name=_("المدينة")
    )
    
    country = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        default="مصر",
        verbose_name=_("الدولة")
    )
    
    is_primary = models.BooleanField(
        default=False,
        verbose_name=_("موقع رئيسي"),
        help_text=_("هل هذا الموقع الرئيسي للمستخدم؟")
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("تاريخ الإنشاء"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("تاريخ التحديث"))

    # مدير مخصص للاستعلامات الجغرافية
    objects = UserLocationManager()
    
    class Meta:
        verbose_name = _('موقع المستخدم')
        verbose_name_plural = _('مواقع المستخدمين')
        indexes = [
            models.Index(fields=['location']),
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['user', 'location_type']),
            models.Index(fields=['created_at']),
            models.Index(fields=['is_primary']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        location_name = self.name or self.get_location_type_display()
        user_name = self.user.username if self.user else "مستخدم غير مسجل"
        return f"{user_name} - {location_name} - {self.city or 'غير محدد'}"
    
    def save(self, *args, **kwargs):
        # إذا تم تعيين هذا الموقع كموقع رئيسي، إلغاء تعيين أي مواقع رئيسية أخرى للمستخدم
        if self.is_primary and self.user:
            UserLocation.objects.filter(user=self.user, is_primary=True).update(is_primary=False)
        super().save(*args, **kwargs)
    
    def get_lat_lng(self):
        """إرجاع (lat, lng) أو (None, None)"""
        if self.location:
            return (self.location.y, self.location.x)
        return (None, None)
    
    def get_formatted_address(self):
        """إرجاع عنوان منسق"""
        parts = []
        if self.address:
            parts.append(self.address)
        if self.city:
            parts.append(self.city)
        if self.country:
            parts.append(self.country)
        return ", ".join(parts) if parts else _("لا يوجد عنوان")
    
    def get_nearby_places(self, radius_km=5, place_type=''):
        """
        الحصول على أماكن قريبة باستخدام Google Places API
        """
        from django.conf import settings
        import requests
        
        # التحقق من وجود مفتاح API
        if not hasattr(settings, 'GOOGLE_PLACES_API_KEY') or not settings.GOOGLE_PLACES_API_KEY:
            return []
        
        lat, lng = self.get_lat_lng()
        if not lat or not lng:
            return []
        
        # مفتاح التخزين المؤقت
        cache_key = f'nearby_places_{lat}_{lng}_{radius_km}_{place_type}'
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return cached_data
        
        try:
            url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
            params = {
                'location': f'{lat},{lng}',
                'radius': radius_km * 1000,  # تحويل إلى أمتار
                'key': settings.GOOGLE_PLACES_API_KEY,
                'language': 'ar'
            }
            
            if place_type:
                params['type'] = place_type
            
            response = requests.get(url, params=params)
            data = response.json()
            
            if data.get('status') == 'OK':
                # معالجة النتائج وتخزين المعلومات المهمة فقط
                processed_results = []
                for place in data['results']:
                    processed_results.append({
                        'name': place.get('name'),
                        'vicinity': place.get('vicinity'),
                        'types': place.get('types', []),
                        'rating': place.get('rating'),
                        'user_ratings_total': place.get('user_ratings_total'),
                        'location': place['geometry']['location'] if 'geometry' in place else None,
                        'place_id': place.get('place_id')
                    })
                
                # تخزين النتائج لمدة ساعة (3600 ثانية)
                cache.set(cache_key, processed_results, 3600)
                return processed_results
            
        except Exception as e:
            logger.error(f"Error fetching nearby places: {e}")
        
        return []
    
    def get_distance_to(self, latitude, longitude, unit='km'):
        """
        حساب المسافة إلى موقع آخر
        """
        from django.contrib.gis.measure import D
        from django.contrib.gis.db.models.functions import Distance
        
        if not self.location:
            return None
        
        target_point = Point(longitude, latitude, srid=4326)
        distance_expr = Distance('location', target_point)
        
        # الحصول على المسافة
        result = UserLocation.objects.filter(pk=self.pk).annotate(
            distance=distance_expr
        ).first()
        
        if result and hasattr(result, 'distance'):
            if unit == 'km':
                return result.distance.km
            elif unit == 'm':
                return result.distance.m
            elif unit == 'mi':
                return result.distance.mi
        
        return None
    
    def get_static_map_url(self, width=300, height=200, zoom=15):
        """
        إنشاء رابط لخريطة ثابتة للموقع
        """
        from django.conf import settings
        
        if not self.location:
            return None
        
        lat, lng = self.get_lat_lng()
        if not lat or not lng:
            return None
        
        if not hasattr(settings, 'GOOGLE_MAPS_API_KEY') or not settings.GOOGLE_MAPS_API_KEY:
            return None
        
        base_url = "https://maps.googleapis.com/maps/api/staticmap"
        markers = f"color:red|label:L|{lat},{lng}"
        
        return f"{base_url}?center={lat},{lng}&zoom={zoom}&size={width}x{height}&markers={markers}&key={settings.GOOGLE_MAPS_API_KEY}"


class LocationShare(models.Model):
    """
    نموذج لمشاركة المواقع بين المستخدمين
    """
    shared_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='shared_locations',
        verbose_name=_("المشارك من")
    )
    
    shared_with = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='received_locations',
        verbose_name=_("المشارك مع")
    )
    
    location = models.ForeignKey(
        UserLocation,
        on_delete=models.CASCADE,
        verbose_name=_("الموقع")
    )
    
    can_edit = models.BooleanField(
        default=False,
        verbose_name=_("يستطيع التعديل")
    )
    
    expires_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("ينتهي في")
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("تاريخ الإنشاء"))
    
    class Meta:
        verbose_name = _('مشاركة موقع')
        verbose_name_plural = _('مشاركات المواقع')
        unique_together = ('shared_by', 'shared_with', 'location')
    
    def __str__(self):
        return f"{self.shared_by} → {self.shared_with} - {self.location}"
    
    def is_expired(self):
        """التحقق إذا انتهت صلاحية المشاركة"""
        from django.utils import timezone
        return self.expires_at and self.expires_at < timezone.now()
   
   