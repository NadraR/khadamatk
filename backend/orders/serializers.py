from rest_framework import serializers
from .models import Order, Offer, Negotiation

class OrderSerializer(serializers.ModelSerializer):
    # Service details
    service_name = serializers.CharField(source="service.title", read_only=True)
    service_id = serializers.IntegerField(source="service.id", read_only=True)
    service_price = serializers.DecimalField(source="service.price", read_only=True, max_digits=10, decimal_places=2)
    service_category = serializers.CharField(source="service.category", read_only=True)
    service_description = serializers.CharField(source="service.description", read_only=True)
    
    # Customer details
    customer_name = serializers.CharField(source="customer.username", read_only=True)
    customer_email = serializers.CharField(source="customer.email", read_only=True)
    customer_phone = serializers.CharField(source="customer.phone", read_only=True)
    customer_first_name = serializers.CharField(source="customer.first_name", read_only=True)
    customer_last_name = serializers.CharField(source="customer.last_name", read_only=True)
    
    # Worker details (if assigned)
    worker_name = serializers.CharField(source="worker.username", read_only=True)
    
    class Meta:
        model = Order
        fields = "__all__"
        read_only_fields = ['customer', 'worker', 'created_at', 'updated_at']

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
