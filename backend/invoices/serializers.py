from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from .models import Invoice, WorkerEarnings
from orders.models import Order

class InvoiceSerializer(serializers.ModelSerializer):
    order_id = serializers.IntegerField(source='order.id', read_only=True)
    customer_name = serializers.CharField(source='order.customer.get_full_name', read_only=True)
    service_name = serializers.CharField(source='order.service.title', read_only=True)
    order_status = serializers.CharField(source='order.status', read_only=True)
    order_title = serializers.CharField(read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'order_id', 'amount', 'status', 'payment_method',
            'issued_at', 'paid_at', 'due_date', 'notes',
            'customer_name', 'service_name', 'order_status',
            'order_title', 'is_overdue'
        ]
        read_only_fields = ['id', 'issued_at', 'paid_at', 'order_title', 'is_overdue']

    def update(self, instance, validated_data):
        # امنع تغيير order_id
        validated_data.pop("order", None)
        return super().update(instance, validated_data)


class WorkerEarningsSerializer(serializers.ModelSerializer):
    invoice_id = serializers.IntegerField(source='invoice.id', read_only=True)
    order_id = serializers.IntegerField(source='invoice.order.id', read_only=True)
    service_name = serializers.CharField(source='invoice.order.service.title', read_only=True)
    customer_name = serializers.CharField(source='invoice.order.customer.get_full_name', read_only=True)
    
    class Meta:
        model = WorkerEarnings
        fields = [
            'id', 'invoice_id', 'order_id', 'gross_amount', 'platform_fee', 
            'net_earnings', 'created_at', 'service_name', 'customer_name'
        ]
        read_only_fields = ['id', 'created_at', 'platform_fee', 'net_earnings']

