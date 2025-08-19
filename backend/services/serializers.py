from rest_framework import serializers
from .models import Service, ServiceCategory
from reviews.serializers import ReviewSerializer

# ---------- Categories ----------
class ServiceCategorySerializer(serializers.ModelSerializer):
    created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M", read_only=True)
    
    class Meta:
        model = ServiceCategory
        fields = ["id", "name", "created_at"]

# ---------- Services ----------
class ServiceSerializer(serializers.ModelSerializer):
    category = ServiceCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=ServiceCategory.objects.filter(is_deleted=False),
        source="category",
        write_only=True
    )
    provider_username = serializers.ReadOnlyField(source="provider.username")
    rating_avg = serializers.FloatField(read_only=True)
    rating_count = serializers.IntegerField(read_only=True)
    currency = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M", read_only=True)

    class Meta:
        model = Service
        fields = [
            "id", "title", "description", "provider", "provider_username",
            "category", "category_id", "city", "price", "currency", "is_active",
            "created_at", "rating_avg", "rating_count"
        ]

    def get_currency(self, obj):
        return "EGP"

# ---------- Service Details with Reviews ----------
class ServiceDetailSerializer(ServiceSerializer):
    reviews = ReviewSerializer(many=True, read_only=True)

    class Meta(ServiceSerializer.Meta):
        fields = ServiceSerializer.Meta.fields + ["reviews"]
