from rest_framework import serializers
from .models import Order, Offer, Negotiation

class OrderSerializer(serializers.ModelSerializer):
    # Service details
    service_name = serializers.CharField(source="service.title", read_only=True)
    service_id = serializers.IntegerField(source="service.id", read_only=True)
    service_price = serializers.DecimalField(source="service.price", read_only=True, max_digits=10, decimal_places=2)
    service_category = serializers.CharField(source="service.category", read_only=True)
    service_description = serializers.CharField(source="service.description", read_only=True)
    
    # Service Provider details - إضافة بيانات مقدم الخدمة
    provider_id = serializers.IntegerField(source="service.provider.id", read_only=True)
    provider_name = serializers.CharField(source="service.provider.username", read_only=True)
    provider_first_name = serializers.CharField(source="service.provider.first_name", read_only=True)
    provider_last_name = serializers.CharField(source="service.provider.last_name", read_only=True)
    provider_email = serializers.CharField(source="service.provider.email", read_only=True)
    provider_phone = serializers.CharField(source="service.provider.phone", read_only=True)
    provider_hourly_rate = serializers.DecimalField(source="service.provider.hourly_rate", read_only=True, max_digits=10, decimal_places=2)
    provider_rating = serializers.DecimalField(source="service.provider.rating", read_only=True, max_digits=3, decimal_places=2)
    
    # Customer details
    customer_name = serializers.CharField(source="customer.username", read_only=True)
    customer_email = serializers.CharField(source="customer.email", read_only=True)
    customer_phone = serializers.CharField(source="customer.phone", read_only=True)
    customer_first_name = serializers.CharField(source="customer.first_name", read_only=True)
    customer_last_name = serializers.CharField(source="customer.last_name", read_only=True)
    
    # Worker details (if assigned)
    worker_name = serializers.CharField(source="worker.username", read_only=True)
    worker_phone = serializers.CharField(source="worker.phone", read_only=True)
    
    class Meta:
        model = Order
        fields = "__all__"
        read_only_fields = ['customer', 'worker', 'created_at', 'updated_at']


class OfferSerializer(serializers.ModelSerializer):
    # Provider details
    provider_name = serializers.CharField(source="provider.username", read_only=True)
    provider_first_name = serializers.CharField(source="provider.first_name", read_only=True)
    provider_last_name = serializers.CharField(source="provider.last_name", read_only=True)
    provider_email = serializers.CharField(source="provider.email", read_only=True)
    provider_phone = serializers.CharField(source="provider.phone", read_only=True)
    provider_hourly_rate = serializers.DecimalField(source="provider.hourly_rate", read_only=True, max_digits=10, decimal_places=2)
    provider_rating = serializers.DecimalField(source="provider.rating", read_only=True, max_digits=3, decimal_places=2)
    
    # Order details
    order_id = serializers.IntegerField(source="order.id", read_only=True)
    order_status = serializers.CharField(source="order.status", read_only=True)
    order_description = serializers.CharField(source="order.description", read_only=True)
    
    class Meta:
        model = Offer
        fields = "__all__"
        read_only_fields = ['provider', 'order', 'created_at', 'updated_at']


class NegotiationSerializer(serializers.ModelSerializer):
    # Sender details
    sender_name = serializers.CharField(source="sender.username", read_only=True)
    sender_first_name = serializers.CharField(source="sender.first_name", read_only=True)
    sender_last_name = serializers.CharField(source="sender.last_name", read_only=True)
    sender_email = serializers.CharField(source="sender.email", read_only=True)
    sender_phone = serializers.CharField(source="sender.phone", read_only=True)
    
    # Order details
    order_id = serializers.IntegerField(source="order.id", read_only=True)
    order_status = serializers.CharField(source="order.status", read_only=True)
    order_description = serializers.CharField(source="order.description", read_only=True)
    
    # Customer details from order
    customer_name = serializers.CharField(source="order.customer.username", read_only=True)
    customer_first_name = serializers.CharField(source="order.customer.first_name", read_only=True)
    customer_last_name = serializers.CharField(source="order.customer.last_name", read_only=True)
    
    class Meta:
        model = Negotiation
        fields = "__all__"
        read_only_fields = ['sender', 'order', 'date_created']