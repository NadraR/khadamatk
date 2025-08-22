from rest_framework import serializers
from .models import Order, Offer, Negotiation

class OrderSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source="service.title", read_only=True)
    customer_name = serializers.CharField(source="customer.username", read_only=True)
    class Meta:
        model = Order
        fields = "__all__"

class OfferSerializer(serializers.ModelSerializer):
    provider_name = serializers.CharField(source="provider.username", read_only=True)
    class Meta:
        model = Offer
        fields = "__all__"

class NegotiationSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source="sender.username", read_only=True)
    class Meta:
        model = Negotiation
        fields = "__all__"
