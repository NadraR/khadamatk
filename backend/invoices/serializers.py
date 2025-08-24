from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from .models import Invoice
from orders.models import Order

class InvoiceSerializer(serializers.ModelSerializer):
    booking = serializers.PrimaryKeyRelatedField(queryset=Order.objects.all(), write_only=True)
    booking_id = serializers.IntegerField(source='booking.id', read_only=True)
    customer_name = serializers.CharField(source='booking.user.get_full_name', read_only=True)
    service_name_ar = serializers.CharField(source='booking.service.title_ar', read_only=True)
    service_name_en = serializers.CharField(source='booking.service.title_en', read_only=True)
    booking_status = serializers.CharField(source='booking.status', read_only=True)
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'booking', 'booking_id', 'amount', 'status',
            'issued_at', 'paid_at', 'customer_name',
            'service_name_ar', 'service_name_en', 'booking_status'
        ]
        read_only_fields = ['id', 'issued_at', 'paid_at']

    def update(self, instance, validated_data):
        validated_data.pop("booking", None)  # امنع تغييره
        return super().update(instance, validated_data)