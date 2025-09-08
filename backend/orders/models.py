from django.db import models
from django.utils import timezone
from django.conf import settings
from services.models import Service

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending','Pending'),
        ('accepted','Accepted'),
        ('declined','Declined'),
        ('in_progress','In Progress'),
        ('completed','Completed'),
        ('cancelled','Cancelled')
    ]
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    worker = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='worker_orders')
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    description = models.TextField(blank=True)
    offered_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    location_lat = models.FloatField(null=True, blank=True)
    location_lng = models.FloatField(null=True, blank=True)
    location_address = models.TextField(blank=True, null=True)
    scheduled_time = models.DateTimeField(default=timezone.now)
    delivery_time = models.DateTimeField(null=True, blank=True, help_text="Expected delivery/completion time")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    decline_reason = models.TextField(blank=True, null=True)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Offer(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='offers')
    provider = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='offers')
    proposed_price = models.DecimalField(max_digits=10, decimal_places=2)
    accepted = models.BooleanField(default=False)
    date_created = models.DateTimeField(auto_now_add=True)

class Negotiation(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='negotiations')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_negotiations')
    message = models.TextField()
    proposed_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    date_created = models.DateTimeField(auto_now_add=True)

class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE)
    service = models.ForeignKey('services.Service', on_delete=models.CASCADE)
    scheduled_time = models.DateTimeField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Booking #{self.id} - {self.service.name}"
