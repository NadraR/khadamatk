from django.db import models
from django.utils import timezone
from django.conf import settings
from services.models import Service
from orders.models import Order

class Rating(models.Model):
    order = models.OneToOneField(
        Order, on_delete=models.CASCADE, related_name="rating", null=True, blank=True
    )
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name="ratings", null=True, blank=True)
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="ratings", null=True, blank=True
    )
    score = models.IntegerField()  # 1 to 5
    comment = models.TextField(default="No comment", blank=True)
    is_deleted = models.BooleanField(default=False)
    date_created = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["-date_created"]
        unique_together = ("service", "customer")

    def __str__(self):
        return f"{self.service.title} - {self.score}★ by {self.customer.username}"
