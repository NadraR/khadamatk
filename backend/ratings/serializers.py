from rest_framework import serializers
from .models import Rating

class RatingSerializer(serializers.ModelSerializer):
    client_username = serializers.ReadOnlyField(source="client.username")
    date_created = serializers.DateTimeField(format="%Y-%m-%d %H:%M", read_only=True)

    class Meta:
        model = Rating
        fields = ["id", "order", "service", "client", "client_username", "score", "comment", "is_deleted", "date_created"]
        read_only_fields = ["client", "service", "order", "is_deleted"]

    def validate_score(self, value):
        if not (1 <= value <= 5):
            raise serializers.ValidationError("Score must be between 1 and 5")
        return value
