# backend/invoices/admin.py
from django.contrib import admin
from django.utils import timezone 
from django.utils.translation import gettext_lazy as _
from .models import Invoice

@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ['id', 'order', 'amount', 'status', 'issued_at', 'paid_at']
    list_filter = ['status', 'issued_at']
    search_fields = ['order__id', 'order__customer__username', 'order__customer__email']
    readonly_fields = ['issued_at', 'paid_at']
    actions = ['mark_as_paid']
    
    def mark_as_paid(self, request, queryset):
        updated_count = queryset.update(status=Invoice.STATUS_PAID, paid_at=timezone.now())
        self.message_user(request, _("تم تحديد {} فاتورة كمدفوعة").format(updated_count))
    mark_as_paid.short_description = _("تحديد الفواتير المحددة كمدفوعة")




