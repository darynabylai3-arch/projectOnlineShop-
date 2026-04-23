import os
import requests
from dotenv import load_dotenv
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import ChatMessage
from products.models import Product
from django.db.models import Q

load_dotenv()

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"


def search_products(query, limit=8):
    """Умный поиск товаров по всем категориям"""
    query_lower = query.lower()
    
    stop_words = ['i', 'want', 'to', 'buy', 'a', 'the', 'for', 'and', 'or', 'but', 'so', 'if', 'then', 'of', 'in', 'on', 'at', 'by', 'with', 'without', 'is', 'are', 'am', 'be', 'been', 'was', 'were', 'please', 'could', 'you', 'help', 'me', 'something', 'need', 'get', 'have', 'looking', 'для', 'на', 'в', 'с', 'по', 'к', 'у', 'же', 'вот', 'тот', 'та', 'этот', 'эта', 'это']
    
    keywords = [w for w in query_lower.split() if w not in stop_words and len(w) > 1]
    
    category_mapping = {
        'фитнес': 'Health, Beauty & Wellness',
        'спорт': 'Health, Beauty & Wellness',
        'тренировка': 'Health, Beauty & Wellness',
        'тренировку': 'Health, Beauty & Wellness',
        'здоровье': 'Health, Beauty & Wellness',
        'массаж': 'Health, Beauty & Wellness',
        'массажер': 'Health, Beauty & Wellness',
        'йога': 'Health, Beauty & Wellness',
        'упражнение': 'Health, Beauty & Wellness',
        'уход': 'Health, Beauty & Wellness',
        'красота': 'Health, Beauty & Wellness',
        'кожа': 'Health, Beauty & Wellness',
        'волосы': 'Health, Beauty & Wellness',
        'зубы': 'Health, Beauty & Wellness',
        'gym': 'Health, Beauty & Wellness',
        'fitness': 'Health, Beauty & Wellness',
        'yoga': 'Health, Beauty & Wellness',
        'health': 'Health, Beauty & Wellness',
        'wellness': 'Health, Beauty & Wellness',
        
        'умный': 'Smart Home',
        'умная': 'Smart Home',
        'умное': 'Smart Home',
        'дом': 'Smart Home',
        'лампа': 'Smart Home',
        'свет': 'Smart Home',
        'розетка': 'Smart Home',
        'камера': 'Smart Home',
        'датчик': 'Smart Home',
        'робот': 'Smart Home',
        'пылесос': 'Smart Home',
        'smart': 'Smart Home',
        'home': 'Smart Home',
        
        'гаджет': 'Gadgets & Tech Accessories',
        'наушники': 'Gadgets & Tech Accessories',
        'зарядка': 'Gadgets & Tech Accessories',
        'кабель': 'Gadgets & Tech Accessories',
        'мышь': 'Gadgets & Tech Accessories',
        'клавиатура': 'Gadgets & Tech Accessories',
        'чехол': 'Gadgets & Tech Accessories',
        'gadget': 'Gadgets & Tech Accessories',
        'accessories': 'Gadgets & Tech Accessories',
        
        'офис': 'Workspace & Office',
        'работа': 'Workspace & Office',
        'стол': 'Workspace & Office',
        'стул': 'Workspace & Office',
        'кресло': 'Workspace & Office',
        'office': 'Workspace & Office',
        'desk': 'Workspace & Office',
        
        'рюкзак': 'Lifestyle & Everyday Use',
        'сумка': 'Lifestyle & Everyday Use',
        'путешествие': 'Lifestyle & Everyday Use',
        'кофе': 'Lifestyle & Everyday Use',
        'еда': 'Lifestyle & Everyday Use',
        'вода': 'Lifestyle & Everyday Use',
        'бутылка': 'Lifestyle & Everyday Use',
    }

    detected_categories = []
    for kw in keywords:
        for ru_word, category in category_mapping.items():
            if ru_word in kw or kw in ru_word:
                detected_categories.append(category)
    
    detected_categories = list(set(detected_categories))
    print(f">>> Запрос: {query}")
    print(f">>> Ключевые слова: {keywords}")
    print(f">>> Определенные категории: {detected_categories}")
    
    search_filter = Q()
    
    for word in keywords:
        search_filter |= Q(name__icontains=word)
        search_filter |= Q(description__icontains=word)
    
    for category in detected_categories:
        search_filter |= Q(category__name__icontains=category)
    
    products = Product.objects.filter(search_filter, stock__gt=0)
    
    if not products.exists() and detected_categories:
        products = Product.objects.filter(category__name__in=detected_categories, stock__gt=0)
        print(f">>> Берем все товары из категорий {detected_categories}")

    if not products.exists():
        products = Product.objects.filter(stock__gt=0).order_by('-id')[:limit]
        print(f">>> Показываем популярные товары")
    else:
        products = products[:limit]
    
    print(f">>> Найдено товаров: {products.count()}")
    for p in products[:5]:
        print(f"    - {p.name} ({p.category.name if p.category else 'no category'})")
    
    return products


@api_view(["POST"])
@permission_classes([AllowAny])
def ai_chat(request):
    user_message = request.data.get("message", "").strip()
    if not user_message:
        return Response({"error": "Пустое сообщение"}, status=400)

    groq_api_key = os.getenv('GROQ_API_KEY')
    if not groq_api_key:
        return Response({"error": "GROQ_API_KEY not configured"}, status=500)

    print(f"\n{'='*50}")
    print(f"НОВЫЙ ЗАПРОС: {user_message}")
    print(f"{'='*50}")

    found_products = search_products(user_message)
    
    products_list = ""
    for p in found_products:
        price = int(p.price) if p.price else 0
        category = p.category.name if p.category else "Uncategorized"
        products_list += f"- {p.name} ({category}): {price}₸\n"
    
    if found_products:
        context = f"""Пользователь: "{user_message}"

Вот ТОВАРЫ ИЗ НАШЕГО МАГАЗИНА, которые подходят под запрос:
{products_list}

Пожалуйста, порекомендуй ЭТИ КОНКРЕТНЫЕ ТОВАРЫ пользователю.
Объясни, почему каждый товар хорош.
Укажи цены.
Спроси, что еще нужно.
Отвечай на ТОМ ЖЕ ЯЗЫКЕ, что и пользователь."""
    else:
        context = f"""Пользователь: "{user_message}"

К сожалению, я не нашел товаров по этому запросу.

Вежливо скажи об этом.
Предложи уточнить запрос (например: "умная лампа", "массажер", "наушники").
Отвечай на ТОМ ЖЕ ЯЗЫКЕ, что и пользователь."""

    try:
        response = requests.post(
            GROQ_API_URL,
            headers={
                "Authorization": f"Bearer {groq_api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": [
                    {"role": "system", "content": "Ты - консультант интернет-магазина ShopMind. Отвечай на языке пользователя. Всегда рекомендуй ТОВАРЫ ИЗ СПИСКА, который тебе дают. Не выдумывай товары, которых нет в списке."},
                    {"role": "user", "content": context}
                ],
                "max_tokens": 500,
                "temperature": 0.7,
            },
            timeout=30,
        )

        ai_reply = response.json()["choices"][0]["message"]["content"]
        print(f"\n>>> ОТВЕТ AI: {ai_reply[:200]}...")

        if request.user.is_authenticated:
            ChatMessage.objects.create(
                user=request.user,
                user_message=user_message,
                ai_reply=ai_reply
            )

        products_data = []
        for p in found_products:
            price = int(p.price) if p.price else 0
            products_data.append({
                "id": p.id,
                "name": p.name,
                "price": price,
                "category": p.category.name if p.category else None,
                "image": p.image.url if p.image else None
            })

        return Response({
            "reply": ai_reply,
            "products": products_data
        })

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