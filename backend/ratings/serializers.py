from rest_framework import serializers
from .models import Rating

class RatingSerializer(serializers.ModelSerializer):
    customer_username = serializers.ReadOnlyField(source="customer.username")

    class Meta:
        model = Rating
        fields = ["id", "service", "customer", "customer_username", "score", "created_at"]
        read_only_fields = ["id", "customer", "created_at"]
