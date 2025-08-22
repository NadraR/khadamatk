from django.db import models
from django.utils import timezone
from django.conf import settings
from services.models import Service
from orders.models import Order

class Review(models.Model):
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name="reviews")
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="reviews", null=True, blank=True)
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    score = models.IntegerField()
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    is_deleted = models.BooleanField(default=False)

    class Meta:
        unique_together = ("service", "customer", "order")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.service.title} - {self.score}★ by {self.customer.username}"
