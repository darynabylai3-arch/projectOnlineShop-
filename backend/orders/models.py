from django.contrib.auth.models import User
from django.db import models
from products.models import Product

class Order(models.Model):
    STATUS = [('pending','Pending'), ('paid','Paid'), ('shipped','Shipped')]
    user       = models.ForeignKey(User, on_delete=models.CASCADE)
    status     = models.CharField(max_length=20, choices=STATUS, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    total      = models.DecimalField(max_digits=10, decimal_places=2, default=0)

class OrderItem(models.Model):
    order    = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product  = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    price    = models.DecimalField(max_digits=10, decimal_places=2)