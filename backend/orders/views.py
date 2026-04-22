from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from .models import Order, OrderItem
from .serializers import OrderSerializer
from products.models import Product

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Order.objects.prefetch_related('items__product').all()
        return Order.objects.prefetch_related('items__product').filter(
            user=self.request.user
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        """
        Accept cart items from frontend and create a real Order with OrderItems.
        Expected body:
        {
          "items": [
            {"product_id": 1, "quantity": 2},
            ...
          ]
        }
        """
        items_data = request.data.get('items', [])

        if not items_data:
            return Response(
                {'error': 'Cart is empty.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            order = Order.objects.create(
                user=request.user,
                status='pending',
                total=0
            )

            total = 0
            for item in items_data:
                product_id = item.get('product_id')
                quantity = int(item.get('quantity', 1))

                try:
                    product = Product.objects.get(id=product_id)
                except Product.DoesNotExist:
                    order.delete()
                    return Response(
                        {'error': f'Product {product_id} not found.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                if product.stock < quantity:
                    order.delete()
                    return Response(
                        {'error': f'Not enough stock for "{product.name}". Available: {product.stock}'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=quantity,
                    price=product.price
                )

                product.stock -= quantity
                product.save()

                total += product.price * quantity

            order.total = total
            order.save()

        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)