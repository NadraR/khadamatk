from django.db import models
from django.utils import timezone
from django.conf import settings


class ServiceCategory(models.Model):
    """Type of service (e.g., Plumbing, Carpentry)."""
    name = models.CharField(max_length=120, unique=True)
    created_at = models.DateTimeField(default=timezone.now)
    is_deleted = models.BooleanField(default=False)  # Soft delete

    def __str__(self):
        return self.name


class Service(models.Model):
    """A service offered by a provider (linked to a User)."""
    provider = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="services",
        null=True,            
        blank=True,
    )
    category = models.ForeignKey(
        ServiceCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="services",
    )
    title = models.CharField(max_length=200, null=True, blank=True)  
    description = models.TextField(blank=True, null=True)           
    city = models.CharField(max_length=120, blank=True, null=True)   
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        default=0.00  
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    is_deleted = models.BooleanField(default=False)  # Soft delete

    def __str__(self):
        return f"{self.title} — {self.provider.username if self.provider else 'No Provider'}"
