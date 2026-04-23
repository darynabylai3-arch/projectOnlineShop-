import requests
import environ
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import ChatMessage

env = environ.Env()
environ.Env.read_env()

GROQ_API_KEY = env('GROQ_API_KEY')

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

SYSTEM_PROMPT = """Ты — дружелюбный ИИ-консультант интернет-магазина ShopMind.
Твои задачи:
- Помогать пользователям найти нужные товары
- Отвечать на вопросы о заказах, доставке, возврате товара
- Давать рекомендации на основе запросов пользователя
Правила:
- Отвечай на языке пользователя (казахский/русский/английский)
- Будь вежливым и позитивным
- Держи ответы краткими (2-4 предложения)
"""


@api_view(["POST"])
@permission_classes([AllowAny])
def ai_chat(request):
    user_message = request.data.get("message", "").strip()
    if not user_message:
        return Response({"error": "Пустое сообщение"}, status=400)

    groq_api_key = settings.GROQ_API_KEY
    if not groq_api_key:
        return Response({"error": "GROQ_API_KEY not configured"}, status=500)

    print(f">>> Получено сообщение: {user_message}")

    try:
        response = requests.post(
            GROQ_URL,
            headers={
                "Authorization": f"Bearer {groq_api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_message},
                ],
                "max_tokens": 500,
                "temperature": 0.7,
            },
            timeout=30,
        )

        print(f">>> Groq статус: {response.status_code}")

        if response.status_code != 200:
            return Response(
                {"error": f"Groq ошибка: {response.status_code} — {response.text}"},
                status=502
            )

        ai_reply = response.json()["choices"][0]["message"]["content"]
        print(f">>> ИИ ответил: {ai_reply[:80]}")

        if request.user.is_authenticated:
            ChatMessage.objects.create(
                user=request.user,
                user_message=user_message,
                ai_reply=ai_reply
            )

        return Response({"reply": ai_reply})

    except requests.Timeout:
        print(">>> ТАЙМАУТ!")
        return Response({"error": "Таймаут"}, status=504)
    except Exception as e:
        print(f">>> ОШИБКА: {e}")
        return Response({"error": str(e)}, status=500)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def chat_history(request):
    messages = ChatMessage.objects.filter(
        user=request.user
    ).order_by("created_at")[:50]

    data = [
        {
            "user_message": msg.user_message,
            "ai_reply": msg.ai_reply,
            "created_at": msg.created_at.isoformat(),
        }
        for msg in messages
    ]
    return Response(data)