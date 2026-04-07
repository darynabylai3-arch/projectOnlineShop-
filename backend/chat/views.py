import anthropic
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from products.models import Product

client = anthropic.Anthropic()

class ChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_message = request.data.get('message', '')

        products = Product.objects.values('name', 'price', 'description')[:20]
        catalog  = '\n'.join(f"- {p['name']}: ${p['price']} — {p['description']}"
                             for p in products)

        message = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=512,
            system=f"""Ты — ShopMind AI, дружелюбный помощник интернет-магазина.
Помогай покупателям находить товары. Отвечай кратко.
Каталог товаров:\n{catalog}""",
            messages=[{"role": "user", "content": user_message}]
        )
        return Response({'reply': message.content[0].text})