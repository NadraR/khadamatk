from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class AdminActionLog(models.Model):
    ACTION_CHOICES = [
        ('create', 'Create'),
        ('update', 'Update'),
        ('delete', 'Delete'),
        ('approve', 'Approve'),
        ('reject', 'Reject'),
    ]
    admin = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'is_staff': True})
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    target_model = models.CharField(max_length=50)
    target_id = models.PositiveIntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.admin.username} {self.action} {self.target_model}({self.target_id})"


class AdminNotification(models.Model):
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class PlatformSetting(models.Model):
    key = models.CharField(max_length=100, unique=True)
    value = models.TextField(blank=True, null=True)
    group = models.CharField(max_length=50, blank=True, null=True)  # general, policy, contact

    def __str__(self):
        return f"{self.group or 'general'}:{self.key}"