from django.urls import path
from .views import InvoiceViewSet, total_revenue

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
    path('total-revenue/', total_revenue, name='total-revenue'),
]
