from django.db import models
from django.conf import settings
from django.utils import timezone
from services.models import Service

class Rating(models.Model):
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name="ratings")
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="ratings")
    score = models.PositiveSmallIntegerField()  # 1..5
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ("service", "customer")
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["service"]),
            models.Index(fields=["customer"]),
        ]

    def __str__(self):
        return f"{self.customer} → {self.service} : {self.score}"
