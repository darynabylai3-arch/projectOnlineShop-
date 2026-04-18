from django.contrib import admin
from .models import ChatMessage
 
 
@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ("user", "short_message", "created_at")
    list_filter = ("created_at",)
    search_fields = ("user__username", "user_message")
    readonly_fields = ("user", "user_message", "ai_reply", "created_at")
 
    def short_message(self, obj):
        return obj.user_message[:60] + "..." if len(obj.user_message) > 60 else obj.user_message
    short_message.short_description = "Сообщение"
 