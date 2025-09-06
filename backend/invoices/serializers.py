from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from .models import Invoice
from orders.models import Order

class InvoiceSerializer(serializers.ModelSerializer):
    booking_id = serializers.IntegerField(source='booking.id', read_only=True)
    customer_name = serializers.CharField(source='booking.customer.get_full_name', read_only=True)
    service_name = serializers.CharField(source='booking.service.title', read_only=True)
    booking_status = serializers.CharField(source='booking.status', read_only=True)
    order_title = serializers.CharField(read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'booking_id', 'amount', 'status', 'payment_method',
            'issued_at', 'paid_at', 'due_date', 'notes',
            'customer_name', 'service_name', 'booking_status',
            'order_title', 'is_overdue'
        ]
        read_only_fields = ['id', 'issued_at', 'paid_at', 'order_title', 'is_overdue']

    def update(self, instance, validated_data):
        # امنع تغيير booking_id
        validated_data.pop("booking", None)
        return super().update(instance, validated_data)