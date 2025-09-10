from django.urls import path
from .views import InvoiceViewSet, total_revenue, invoice_stats, overdue_invoices, worker_earnings, worker_earnings_summary, create_invoice_for_completed_orders, trigger_invoice_signal

# نحدد الـ as_view لكل نوع
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
    path('<int:pk>/mark_paid/', InvoiceViewSet.as_view({'post': 'mark_paid'}), name='invoice-mark-paid'),
    path('my_invoices/', InvoiceViewSet.as_view({'get': 'my_invoices'}), name='my-invoices'),
    path('stats/', invoice_stats, name='invoice-stats'),
    path('overdue/', overdue_invoices, name='overdue-invoices'),
    path("total-revenue/", total_revenue, name="total-revenue"),
    path('worker/earnings/', worker_earnings, name='worker-earnings'),
    path('worker/earnings/summary/', worker_earnings_summary, name='worker-earnings-summary'),
    path('create-missing/', create_invoice_for_completed_orders, name='create-missing-invoices'),
    path('trigger-signal/', trigger_invoice_signal, name='trigger-invoice-signal'),
]
