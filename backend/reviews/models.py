from django.db import models
from django.utils import timezone
from django.conf import settings


class Review(models.Model):
    service = models.ForeignKey(
        "services.Service",  
        on_delete=models.CASCADE,
        related_name="reviews",
    )
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reviews", null=True, blank=True
    )
    rating = models.IntegerField()  # 1 to 5
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    is_deleted = models.BooleanField(default=False)  # Soft delete

    class Meta:
        ordering = ["-created_at"]
        unique_together = ("service", "customer")  # كل زبون يعمل ريفيو واحد بس لكل خدمة

    def __str__(self):
        return f"{self.service.title} - {self.rating}★ by {self.customer.username}"
