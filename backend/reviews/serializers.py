from rest_framework import serializers
from .models import Review

class ReviewSerializer(serializers.ModelSerializer):
    customer_username = serializers.ReadOnlyField(source="customer.username")
    created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M", read_only=True)

    class Meta:
        model = Review
        fields = ["id", "service", "order", "customer", "customer_username", "score", "comment", "is_deleted", "created_at"]
        read_only_fields = ["customer", "service", "order", "is_deleted"]

    def validate_score(self, value):
        if not (1 <= value <= 5):
            raise serializers.ValidationError("Score must be between 1 and 5")
        return value
