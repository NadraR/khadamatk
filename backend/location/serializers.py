# location/serializers.py
from rest_framework import serializers
from django.contrib.gis.geos import Point
from .models import UserLocation

class UserLocationSerializer(serializers.ModelSerializer):
    lat = serializers.FloatField(
        write_only=True, 
        min_value=-90, 
        max_value=90, 
        required=False,
        help_text="خط العرض (من -90 إلى 90)"
    )
    lng = serializers.FloatField(
        write_only=True, 
        min_value=-180, 
        max_value=180, 
        required=False,
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