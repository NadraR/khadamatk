from django.db import models

# Create your models here.
from django.db import models
from django.conf import settings
from orders.models import Order

class Conversation(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name="conversation")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Conversation for Order #{self.order.id}"


class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.sender.username} in Order {self.conversation.order.id}"
