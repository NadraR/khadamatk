from django.urls import path
from .views import InvoiceViewSet, total_revenue, invoice_stats, overdue_invoices

invoice_list = InvoiceViewSet.as_view({
    'get': 'list',
    'post': 'create',
})

invoice_detail = InvoiceViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy',
})

urlpatterns = [
    path('', invoice_list, name='invoice-list'),
    path('<int:pk>/', invoice_detail, name='invoice-detail'),
    path('<int:pk>/mark_paid/', InvoiceViewSet.as_view({'post': 'mark_paid'}), name='invoice-mark-paid'),
    path('my_invoices/', InvoiceViewSet.as_view({'get': 'my_invoices'}), name='my-invoices'),
    path('stats/', invoice_stats, name='invoice-stats'),
    path('overdue/', overdue_invoices, name='overdue-invoices'),
    path("total-revenue/", total_revenue, name="total-revenue"),
]
