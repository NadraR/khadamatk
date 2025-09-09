# location/serializers.py
from rest_framework import serializers
from django.contrib.gis.geos import Point
from .models import UserLocation

class UserLocationSerializer(serializers.ModelSerializer):
    lat = serializers.FloatField(
        write_only=True, 
        min_value=-90, 
        max_value=90, 
        required=True,
        help_text="خط العرض (من -90 إلى 90)"
    )
    lng = serializers.FloatField(
        write_only=True, 
        min_value=-180, 
        max_value=180, 
        required=True,
        help_text="خط الطول (من -180 إلى 180)"
    )
    username = serializers.CharField(source='user.username', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_role = serializers.CharField(source='user.role', read_only=True)
    
    class Meta:
        model = UserLocation
        fields = [
            'id', 'user', 'username', 'user_email', 'user_role',
            'location', 'address', 'city', 'country',
            'building_number', 'apartment_number', 'floor_number', 
            'neighborhood', 'landmark', 'additional_details',
            'lat', 'lng', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.location:
            representation['lat'] = instance.location.y
            representation['lng'] = instance.location.x
        # إزالة الحقول write-only من العرض
        representation.pop('lat', None)
        representation.pop('lng', None)
        return representation
    
    def validate(self, data):
        """تحقق إضافي من البيانات"""
        lat = data.get('lat')
        lng = data.get('lng')
        
        if lat and lng:
            if not (-90 <= float(lat) <= 90) or not (-180 <= float(lng) <= 180):
                raise serializers.ValidationError({
                    "error": "الإحداثيات خارج النطاق المسموح"
                })
        
        return data
    
    def create(self, validated_data):
        lat = validated_data.pop('lat', None)
        lng = validated_data.pop('lng', None)
        
        if lat is not None and lng is not None:
            validated_data['location'] = Point(float(lng), float(lat), srid=4326)
        
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        lat = validated_data.pop('lat', None)
        lng = validated_data.pop('lng', None)
        
        if lat is not None and lng is not None:
            instance.location = Point(float(lng), float(lat), srid=4326)
        
        return super().update(instance, validated_data)
class ProviderSearchSerializer(serializers.Serializer):
    """Serializer للبحث عن مزودي الخدمة بالاسم"""
    lat = serializers.FloatField(
        required=True,
        min_value=-90,
        max_value=90,
        help_text="خط العرض"
    )
    lng = serializers.FloatField(
        required=True,
        min_value=-180,
        max_value=180,
        help_text="خط الطول"
    )
    radius = serializers.FloatField(
        required=False,
        default=50,
        min_value=1,
        max_value=500,
        help_text="نطاق البحث بالكيلومتر"
    )
    q = serializers.CharField(
        required=True,
        max_length=100,
        help_text="نص البحث (اسم مزود الخدمة)"
    )
    max_results = serializers.IntegerField(
        required=False,
        default=50,
        min_value=1,
        max_value=100,
        help_text="الحد الأقصى لعدد النتائج"
    )

    def validate(self, data):
        """تحقق من صحة البيانات"""
        lat = data.get('lat')
        lng = data.get('lng')
        q = data.get('q', '').strip()
        
        if not q:
            raise serializers.ValidationError({
                'q': 'نص البحث مطلوب'
            })
        
        if len(q) < 2:
            raise serializers.ValidationError({
                'q': 'نص البحث يجب أن يكون حرفين على الأقل'
            })
        
        return data


class ProviderSearchResultSerializer(serializers.Serializer):
    """Serializer لنتائج البحث عن مزودي الخدمة"""
    id = serializers.IntegerField()
    user_id = serializers.IntegerField()
    provider = serializers.DictField()
    location = serializers.DictField()
    distance_km = serializers.FloatField()
    services = serializers.ListField()
    services_count = serializers.IntegerField()
    rating = serializers.FloatField()
    worker_profile = serializers.DictField()
    created_at = serializers.DateTimeField()
    search_metadata = serializers.DictField()

