from django.db import models
from django.contrib.auth.models import User

class PasswordReset(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Reset token for {self.user.username}"
    
    class Meta:
        verbose_name = "Password Reset"
        verbose_name_plural = "Password Resets"