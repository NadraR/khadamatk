from django.contrib import admin
from django.contrib.contenttypes.models import ContentType
from .models import Notification

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_recipient', 'short_message', 'level', 'is_read', 'created_at')
    list_filter = ('level', 'read_at', 'created_at', 'recipient_content_type')
    search_fields = ('message', 'verb', 'recipient_object_id')
    readonly_fields = ('created_at',)
    date_hierarchy = 'created_at'
    list_per_page = 20
    
    fieldsets = (
        ('المستلم', {
            'fields': ('recipient_content_type', 'recipient_object_id')
        }),
        ('محتوى الإشعار', {
            'fields': ('actor', 'verb', 'message', 'short_message', 'level')
        }),
        ('الهدف والرابط', {
            'fields': ('target_content_type', 'target_object_id', 'url'),
            'classes': ('collapse',)
        }),
        ('الحالة والتوقيت', {
            'fields': ('read_at', 'created_at')
        }),
    )
    
    def get_recipient(self, obj):
        return str(obj.recipient) if obj.recipient else f"{obj.recipient_content_type} - {obj.recipient_object_id}"
    get_recipient.short_description = 'المستلم'
    
    def is_read(self, obj):
        return obj.read_at is not None
    is_read.boolean = True
    is_read.short_description = 'مقروء'