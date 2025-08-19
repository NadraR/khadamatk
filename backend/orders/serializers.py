from rest_framework import serializers
from .models import Order, Offer, Negotiation
from users.models import User
from services.models import Service

# ---------- Offers ----------
class OfferSerializer(serializers.ModelSerializer):
    provider_username = serializers.ReadOnlyField(source="provider.username")
    date_created = serializers.DateTimeField(format="%Y-%m-%d %H:%M", read_only=True)

    class Meta:
        model = Offer
        fields = ["id", "order", "provider", "provider_username", "proposed_price", "accepted", "date_created"]
        read_only_fields = ["provider", "accepted"]

# ---------- Negotiations ----------
class NegotiationSerializer(serializers.ModelSerializer):
    sender_username = serializers.ReadOnlyField(source="sender.username")
    date_created = serializers.DateTimeField(format="%Y-%m-%d %H:%M", read_only=True)

    class Meta:
        model = Negotiation
        fields = ["id", "order", "sender", "sender_username", "message", "proposed_price", "date_created"]
        read_only_fields = ["sender"]

# ---------- Orders ----------
class OrderSerializer(serializers.ModelSerializer):
    client_username = serializers.ReadOnlyField(source="client.username")
    offers = OfferSerializer(many=True, read_only=True)
    negotiations = NegotiationSerializer(many=True, read_only=True)
    date_created = serializers.DateTimeField(format="%Y-%m-%d %H:%M", read_only=True)

    class Meta:
        model = Order
        fields = [
            "id", "client", "client_username", "service", "description",
            "offered_price", "location_lat", "location_lng", "scheduled_time",
            "status", "is_deleted", "date_created", "offers", "negotiations"
        ]
        read_only_fields = ["client", "status", "is_deleted", "offers", "negotiations"]
