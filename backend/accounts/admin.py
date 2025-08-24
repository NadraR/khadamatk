from django.contrib import admin
from .models import WorkerProfile, ClientProfile
from .forms import ClientProfileForm  # استدعاء الفورم الجديد

@admin.register(WorkerProfile)
class WorkerProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'job_title', 'hourly_rate', 'experience_years')
    list_filter = ('user__role',)
    search_fields = ('user__username', 'user__email', 'job_title')

@admin.register(ClientProfile)
class ClientProfileAdmin(admin.ModelAdmin):
    form = ClientProfileForm  # ربط الفورم بالـ Admin
    list_display = ('user', 'preferred_contact_method')
    list_filter = ('user__role',)
    search_fields = ('user__username', 'user__email')