from django.urls import path
from .views import InvoiceViewSet, total_revenue, download_invoice

invoice_list = InvoiceViewSet.as_view({
    'get': 'list',      # GET /invoices/
    'post': 'create',   # POST /invoices/
})

invoice_detail = InvoiceViewSet.as_view({
    'get': 'retrieve',          # GET /invoices/<pk>/
    'put': 'update',            # PUT /invoices/<pk>/
    'patch': 'partial_update',  # PATCH /invoices/<pk>/
    'delete': 'destroy',        # DELETE /invoices/<pk>/
})

urlpatterns = [
    path('', invoice_list, name='invoice-list'),
    path('<int:pk>/', invoice_detail, name='invoice-detail'),
    path("total-revenue/", total_revenue, name="total-revenue"),
    path('<int:pk>/download/', download_invoice, name='invoice-download'),  # إضافة endpoint للتحميل
]
