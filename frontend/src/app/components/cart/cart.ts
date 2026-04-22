import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { OrderService } from '../../services/order';
import { AuthService } from '../../services/auth';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart implements OnInit {
  items: any[] = [];
  isLoading = false;
  orderSuccess = false;
  orderError = '';

  private orderService = inject(OrderService);
  private auth = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    this.items = JSON.parse(localStorage.getItem('cart') || '[]');
  }

  get total(): number {
    return this.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  }

  get totalItems(): number {
    return this.items.reduce((sum, i) => sum + i.qty, 0);
  }

  increase(item: any) {
    item.qty++;
    this.save();
  }

  decrease(item: any) {
    if (item.qty > 1) item.qty--;
    else this.remove(item);
    this.save();
  }

  remove(item: any) {
    this.items = this.items.filter(i => i.id !== item.id);
    this.save();
  }

  save() {
    localStorage.setItem('cart', JSON.stringify(this.items));
  }

  checkout() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.isLoading = true;
    this.orderError = '';

    const orderItems = this.items.map(i => ({
      product_id: i.id,
      quantity: i.qty,
    }));

    this.orderService.createOrder(orderItems).subscribe({
      next: (order) => {
        this.isLoading = false;
        this.orderSuccess = true;
        localStorage.removeItem('cart');
        this.items = [];
        setTimeout(() => this.router.navigate(['/profile']), 2000);
      },
      error: (err) => {
        this.isLoading = false;
        this.orderError = err.error?.error || 'Failed to place order. Please try again.';
      }
    });
  }
}