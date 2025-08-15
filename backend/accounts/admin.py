from django.contrib import admin
from .models import Profile

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone', 'job_title', 'get_role')
    list_filter = ('user__role',)

    def get_role(self, obj):
        return obj.user.role
    get_role.short_description = 'Role'
