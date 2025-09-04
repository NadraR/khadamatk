from django.db import models

class ChatMessage(models.Model):
    session_id = models.CharField(max_length=255, db_index=True)
    sender = models.CharField(max_length=10, choices=(('user','user'),('bot','bot')))
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.session_id} | {self.sender}: {self.message[:40]}"
