from django.db import models
from django.contrib.auth import get_user_model
from services.models import Service
from orders.models import Order
from reviews.models import Review
from ratings.models import Rating

User = get_user_model()

# سجل تحكم الأدمن (Actions Logs)
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
    target_model = models.CharField(max_length=50)   # ex: User, Service, Order
    target_id = models.PositiveIntegerField()        # id للعنصر المتأثر
    timestamp = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.admin.username} {self.action} {self.target_model}({self.target_id})"
    

# إشعارات الأدمن
class AdminNotification(models.Model):
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
