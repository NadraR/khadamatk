from django.db import models
from django.utils import timezone
from django.conf import settings
from services.models import Service


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders'
    )
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    description = models.TextField(blank=True)
    offered_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    location_lat = models.FloatField(null=True, blank=True)
    location_lng = models.FloatField(null=True, blank=True)
    scheduled_time = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    is_deleted = models.BooleanField(default=False)
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order #{self.id} - {self.customer.get_username()}"


class Offer(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='offers')
    provider = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='offers'
    )
    proposed_price = models.DecimalField(max_digits=10, decimal_places=2)
    accepted = models.BooleanField(default=False)
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Offer #{self.id} by {self.provider.get_username()} on Order #{self.order.id}"


class Negotiation(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='negotiations')
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_negotiations'
    )
    message = models.TextField()
    proposed_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Negotiation #{self.id} by {self.sender.get_username()} on Order #{self.order.id}"
