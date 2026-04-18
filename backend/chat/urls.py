from django.urls import path
from . import views
 
urlpatterns = [
    path("ai/", views.ai_chat, name="ai-chat"),
    path("history/", views.chat_history, name="chat-history"),
]
 