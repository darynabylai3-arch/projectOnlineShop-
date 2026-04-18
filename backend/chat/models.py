from django.db import models
from django.conf import settings
 
 
class ChatMessage(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="chat_messages"
    )
    user_message = models.TextField()
    ai_reply = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
 
    class Meta:
        ordering = ["created_at"]
        verbose_name = "Сообщение чата"
        verbose_name_plural = "Сообщения чата"
 
    def __str__(self):
        return f"{self.user.username} | {self.created_at:%Y-%m-%d %H:%M}"
