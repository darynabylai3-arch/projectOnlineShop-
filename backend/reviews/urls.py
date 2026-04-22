from django.urls import path
from . import views

urlpatterns = [
    path('product/<int:product_id>/rating/', views.product_rating, name='product-rating'),
    path('product/<int:product_id>/my/', views.my_review, name='my-review'),
    path('mine/', views.UserReviewsView.as_view(), name='user-reviews'),
]