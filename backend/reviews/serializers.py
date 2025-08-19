from rest_framework import serializers
from .models import Review

class ReviewSerializer(serializers.ModelSerializer):
    client_username = serializers.ReadOnlyField(source="client.username")
    created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M", read_only=True)

    class Meta:
        model = Review
        fields = ["id", "service", "client", "client_username", "rating", "comment", "created_at"]
        read_only_fields = ["client"]

    def validate_rating(self, value):
        if not (1 <= value <= 5):
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value
