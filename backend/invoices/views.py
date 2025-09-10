from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.utils.translation import gettext_lazy as _
from .models import Invoice, WorkerEarnings
from .serializers import InvoiceSerializer, WorkerEarningsSerializer
from django.db.models import Sum

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    صلاحية للتحقق إذا كان المستخدم هو صاحب الفاتورة أو مدير
    """
    def has_object_permission(self, request, view, obj):
        return obj.order.customer == request.user or request.user.is_staff

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Invoice.objects.all()
        return Invoice.objects.filter(order__customer=self.request.user)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({
            "status": _("تم حذف الفاتورة بنجاح")
        })
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def mark_paid(self, request, pk=None):
        invoice = self.get_object()
        invoice.mark_as_paid()
        serializer = self.get_serializer(invoice)
        return Response({
            'status': _('تم الدفع بنجاح'),
            'invoice': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def my_invoices(self, request):
        """
        الحصول على فواتير المستخدم الحالي فقط
        """
        invoices = Invoice.objects.filter(order__customer=request.user)
        page = self.paginate_queryset(invoices)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(invoices, many=True)
        return Response(serializer.data)
    
@api_view(['GET'])
def total_revenue(request):
    revenue = Invoice.objects.filter(status="paid").aggregate(total=Sum("amount"))["total"] or 0
    return Response({"total_revenue": revenue})@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def invoice_stats(request):
    """Get invoice statistics for the current user"""
    user_invoices = Invoice.objects.filter(order__customer=request.user)
    
    stats = {
        'total_invoices': user_invoices.count(),
        'paid_invoices': user_invoices.filter(status=Invoice.STATUS_PAID).count(),
        'unpaid_invoices': user_invoices.filter(status=Invoice.STATUS_UNPAID).count(),
        'pending_invoices': user_invoices.filter(status=Invoice.STATUS_PENDING).count(),
        'overdue_invoices': user_invoices.filter(status=Invoice.STATUS_OVERDUE).count(),
        'total_amount': user_invoices.aggregate(total=Sum('amount'))['total'] or 0,
        'paid_amount': user_invoices.filter(status=Invoice.STATUS_PAID).aggregate(total=Sum('amount'))['total'] or 0,
    }
    
    return Response(stats)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def overdue_invoices(request):
    """Get overdue invoices for the current user"""
    from django.utils import timezone
    
    overdue = Invoice.objects.filter(
        order__customer=request.user,
        due_date__lt=timezone.now(),
        status__in=[Invoice.STATUS_UNPAID, Invoice.STATUS_PENDING]
    )
    
    serializer = InvoiceSerializer(overdue, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def worker_earnings(request):
    """Get earnings for the current worker"""
    if request.user.role != 'worker':
        return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    earnings = WorkerEarnings.objects.filter(worker=request.user).order_by('-created_at')
    serializer = WorkerEarningsSerializer(earnings, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def worker_earnings_summary(request):
    """Get earnings summary for the current worker"""
    if request.user.role != 'worker':
        return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    earnings = WorkerEarnings.objects.filter(worker=request.user)
    
    summary = {
        'total_earnings': earnings.aggregate(total=Sum('net_earnings'))['total'] or 0,
        'total_platform_fees': earnings.aggregate(total=Sum('platform_fee'))['total'] or 0,
        'total_gross_amount': earnings.aggregate(total=Sum('gross_amount'))['total'] or 0,
        'total_invoices': earnings.count(),
        'recent_earnings': WorkerEarningsSerializer(earnings[:5], many=True).data
    }
    
    return Response(summary)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_invoice_for_completed_orders(request):
    """Create invoices for completed orders that don't have invoices yet"""
    from orders.models import Order
    from django.utils import timezone
    
    try:
        # البحث عن الطلبات المكتملة بدون فواتير للمستخدم الحالي
        completed_orders = Order.objects.filter(
            customer=request.user,
            status='completed'
        ).exclude(
            id__in=Invoice.objects.values_list('order_id', flat=True)
        )
        
        created_invoices = []
        
        for order in completed_orders:
            try:
                # استخدام السعر المعروض من العميل أو السعر الأساسي للخدمة
                amount = order.offered_price or order.service.price or 100
                
                # تحديد تاريخ الاستحقاق (7 أيام من الآن)
                due_date = timezone.now() + timezone.timedelta(days=7)
                
                invoice = Invoice.objects.create(
                    order=order,
                    amount=amount,
                    status=Invoice.STATUS_UNPAID,
                    due_date=due_date,
                    notes=f"فاتورة للخدمة: {order.service.title}"
                )
                
                created_invoices.append({
                    'invoice_id': invoice.id,
                    'order_id': order.id,
                    'amount': str(amount),
                    'service_name': order.service.title
                })
                
            except Exception as e:
                print(f"Error creating invoice for order {order.id}: {e}")
        
        return Response({
            'message': f'تم إنشاء {len(created_invoices)} فاتورة بنجاح',
            'created_invoices': created_invoices
        })
        
    except Exception as e:
        return Response({
            'error': f'حدث خطأ: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def trigger_invoice_signal(request):
    """Manually trigger invoice creation signal for testing"""
    from orders.models import Order
    from invoices.signals import handle_booking_status_change
    
    try:
        order_id = request.data.get('order_id')
        if not order_id:
            return Response({'error': 'order_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get the order
        try:
            order = Order.objects.get(id=order_id, customer=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if invoice already exists
        existing_invoice = Invoice.objects.filter(order=order).first()
        if existing_invoice:
            return Response({
                'message': 'Invoice already exists',
                'invoice_id': existing_invoice.id,
                'amount': str(existing_invoice.amount)
            })
        
        # Manually trigger the signal
        handle_booking_status_change(Order, order, created=False)
        
        # Check if invoice was created
        new_invoice = Invoice.objects.filter(order=order).first()
        if new_invoice:
            return Response({
                'message': 'Invoice created successfully via signal',
                'invoice_id': new_invoice.id,
                'amount': str(new_invoice.amount),
                'status': new_invoice.status
            })
        else:
            return Response({
                'error': 'Signal did not create invoice'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    except Exception as e:
        return Response({
            'error': f'حدث خطأ: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

