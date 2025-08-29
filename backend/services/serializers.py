from rest_framework import serializers
from .models import Service, ServiceCategory, Favorite
from reviews.serializers import ReviewSerializer
from django.db.models import Avg, Count

class ServiceCategorySerializer(serializers.ModelSerializer):
    created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M", read_only=True)
    class Meta:
        model = ServiceCategory
        fields = ["id", "name", "created_at"]

class ServiceSerializer(serializers.ModelSerializer):
    category = ServiceCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=ServiceCategory.objects.filter(is_deleted=False),
        source="category",
        write_only=True
    )
    provider_username = serializers.ReadOnlyField(source="provider.username")
    provider_location = serializers.SerializerMethodField()  
    rating_avg = serializers.FloatField(read_only=True)
    rating_count = serializers.IntegerField(read_only=True)
    currency = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M", read_only=True)

    class Meta:
        model = Service
        fields = [
            "id", "title", "description", "provider", "provider_username",
            "category", "category_id", "city", "price", "currency", "is_active",
            "created_at", "rating_avg", "rating_count", "provider_location"
        ]

    def get_currency(self, obj):
        return "EGP"
    
    def get_provider_location(self, obj):
        """إرجاع موقع المزود إذا كان متاحاً"""
        if hasattr(obj.provider, 'workerprofile') and obj.provider.workerprofile.location:
            return {
                "lat": obj.provider.workerprofile.location.y,
                "lng": obj.provider.workerprofile.location.x
            }
        elif obj.location:  
            return {
                "lat": obj.location.y,
                "lng": obj.location.x
            }
        return None

class ServiceDetailSerializer(ServiceSerializer):
    reviews = ReviewSerializer(many=True, read_only=True)
    class Meta(ServiceSerializer.Meta):
        fields = ServiceSerializer.Meta.fields + ["reviews"]

class FavoriteSerializer(serializers.ModelSerializer):
    service_title = serializers.ReadOnlyField(source="service.title")
    service_price = serializers.ReadOnlyField(source="service.price")
    class Meta:
        model = Favorite
        fields = ["id", "service", "service_title", "service_price", "created_at"]
        read_only_fields = ["created_at"]

class ServiceSearchSerializer(ServiceSerializer):
    distance_km = serializers.FloatField(read_only=True)
    in_favorites = serializers.SerializerMethodField()
    
    class Meta(ServiceSerializer.Meta):
        fields = ServiceSerializer.Meta.fields + ["distance_km", "in_favorites"]

    def get_in_favorites(self, obj):
        user = self.context.get("request").user if self.context.get("request") else None
        if user and user.is_authenticated:
            return obj.favorited_by.filter(user=user).exists()
        return False
