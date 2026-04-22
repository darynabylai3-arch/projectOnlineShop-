from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Avg
from .models import Review
from .serializers import ReviewSerializer

class ReviewViewSet(viewsets.ModelViewSet):
    """Full CRUD for reviews — CBV style."""
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = Review.objects.select_related('user', 'product')
        product_id = self.request.query_params.get('product')
        if product_id:
            qs = qs.filter(product_id=product_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsAuthenticated()]
        return [IsAuthenticatedOrReadOnly()]


@api_view(['GET'])
@permission_classes([IsAuthenticatedOrReadOnly])
def product_rating(request, product_id):
    """FBV: return average rating + count for a product."""
    reviews = Review.objects.filter(product_id=product_id)
    count = reviews.count()
    avg = reviews.aggregate(avg=Avg('rating'))['avg'] or 0
    return Response({
        'product_id': product_id,
        'average': round(avg, 1),
        'count': count,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_review(request, product_id):
    """FBV: get current user's review for a product."""
    try:
        review = Review.objects.get(product_id=product_id, user=request.user)
        return Response(ReviewSerializer(review).data)
    except Review.DoesNotExist:
        return Response(None)


class UserReviewsView(APIView):
    """CBV: list all reviews written by the authenticated user."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        reviews = Review.objects.filter(user=request.user).select_related('product')
        data = []
        for r in reviews:
            data.append({
                'id': r.id,
                'product_id': r.product_id,
                'product_name': r.product.name,
                'rating': r.rating,
                'text': r.text,
                'created_at': r.created_at.isoformat(),
            })
        return Response(data)