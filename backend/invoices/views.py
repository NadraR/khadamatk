from rest_framework import viewsets, permissions
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from django.utils.translation import gettext_lazy as _
from django.http import HttpResponse, Http404
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
        return Invoice.objects.filter(booking__user=self.request.user)
    
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
        invoices = Invoice.objects.filter(booking__user=request.user)
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
def download_invoice(request, pk):
    """
    تحميل فاتورة بصيغة PDF وهمي (يمكن تطويره لاحقًا لإصدار PDF حقيقي)
    """
    try:
        invoice = Invoice.objects.get(pk=pk)
        pdf_content = f"فاتورة #{invoice.id}\nالمبلغ: {invoice.amount}\nالحالة: {invoice.status}".encode('utf-8')
        
        response = HttpResponse(pdf_content, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="invoice-{invoice.id}.pdf"'
        return response
    except Invoice.DoesNotExist:
        raise Http404("Invoice not found")
