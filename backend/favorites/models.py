from django.db import models
from django.conf import settings
from services.models import Service


class Favorite(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='favorites'
    )
    service = models.ForeignKey(
        Service,
        on_delete=models.CASCADE,
        related_name='favorited_by'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'service')
        verbose_name = 'Favorite'
        verbose_name_plural = 'Favorites'
    def __str__(self):
        return f"{self.user.username} - {self.service.title}"
