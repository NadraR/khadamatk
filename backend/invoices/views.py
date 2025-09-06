from rest_framework import viewsets, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.utils.translation import gettext_lazy as _
from .models import Invoice
from .serializers import InvoiceSerializer
from django.db.models import Sum

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    صلاحية للتحقق إذا كان المستخدم هو صاحب الفاتورة أو مدير
    """
    def has_object_permission(self, request, view, obj):
        return obj.booking.customer == request.user or request.user.is_staff

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Invoice.objects.all()
        return Invoice.objects.filter(booking__customer=self.request.user)
    
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
        invoices = Invoice.objects.filter(booking__customer=request.user)
        page = self.paginate_queryset(invoices)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(invoices, many=True)
        return Response(serializer.data)
    
@api_view(['GET'])
def total_revenue(request):
    revenue = Invoice.objects.filter(status="paid").aggregate(total=Sum("amount"))["total"] or 0
    return Response({"total_revenue": revenue})

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def invoice_stats(request):
    """Get invoice statistics for the current user"""
    user_invoices = Invoice.objects.filter(booking__customer=request.user)
    
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
        booking__customer=request.user,
        due_date__lt=timezone.now(),
        status__in=[Invoice.STATUS_UNPAID, Invoice.STATUS_PENDING]
    )
    
    serializer = InvoiceSerializer(overdue, many=True)
    return Response(serializer.data)