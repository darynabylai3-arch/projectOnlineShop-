import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { OrderService, Order } from '../../services/order';
import { ReviewService } from '../../services/review';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslateModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  activeTab: 'orders' | 'reviews' = 'orders';

  orders: Order[] = [];
  myReviews: any[] = [];

  ordersLoading = true;
  reviewsLoading = true;
  ordersError = '';

  private auth = inject(AuthService);
  private orderService = inject(OrderService);
  private reviewService = inject(ReviewService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private translate = inject(TranslateService);

  get username(): string {
    const token = localStorage.getItem('access');
    if (!token) return '';
    try {
      return JSON.parse(atob(token.split('.')[1])).username || '';
    } catch { return ''; }
  }

  get userInitial(): string {
    return this.username.charAt(0).toUpperCase();
  }

  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadOrders();
    this.loadReviews();
  }

  loadOrders() {
    this.ordersLoading = true;
    this.orderService.getMyOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.ordersLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.ordersError = this.translate.instant('PROFILE.LOAD_ERROR');
        this.ordersLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadReviews() {
    this.reviewsLoading = true;
    this.reviewService.getMyReviews().subscribe({
      next: (reviews) => {
        this.myReviews = reviews;
        this.reviewsLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.reviewsLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  statusLabel(status: string): string {
    const key = `PROFILE.STATUS_${status.toUpperCase()}`;
    const translated = this.translate.instant(key);
    return translated !== key ? translated : status;
  }

  statusClass(status: string): string {
    return `status-${status}`;
  }

  stars(n: number): string[] {
    return Array(5).fill('').map((_, i) => i < n ? '★' : '☆');
  }

  logout() {
    this.auth.logout();
  }
}