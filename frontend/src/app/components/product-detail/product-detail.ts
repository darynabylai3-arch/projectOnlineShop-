import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../services/product';
import { ReviewService, Review, ProductRating } from '../../services/review';
import { AuthService } from '../../services/auth';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslateModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail implements OnInit {
  product: Product | null = null;
  reviews: Review[] = [];
  rating: ProductRating | null = null;
  myReview: Review | null = null;

  reviewRating = 5;
  reviewText = '';
  reviewError = '';
  reviewLoading = false;
  editingReview = false;

  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private reviewService = inject(ReviewService);
  private auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  get isLoggedIn() { return this.auth.isLoggedIn(); }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productService.getById(id).subscribe(p => {
      this.product = p;
      this.cdr.detectChanges();
    });
    this.loadReviews(id);
    if (this.isLoggedIn) {
      this.loadMyReview(id);
    }
  }

  loadReviews(productId: number) {
    this.reviewService.getByProduct(productId).subscribe(reviews => {
      this.reviews = reviews;
      this.cdr.detectChanges();
    });
    this.reviewService.getRating(productId).subscribe(r => {
      this.rating = r;
      this.cdr.detectChanges();
    });
  }

  loadMyReview(productId: number) {
    this.reviewService.getMyReview(productId).subscribe(r => {
      this.myReview = r;
      if (r) {
        this.reviewRating = r.rating;
        this.reviewText = r.text;
      }
      this.cdr.detectChanges();
    });
  }

  stars(n: number): string[] {
    return Array(5).fill('').map((_, i) => i < n ? '★' : '☆');
  }

  avgStars(): string[] {
    const avg = Math.round(this.rating?.average || 0);
    return this.stars(avg);
  }

  submitReview() {
    if (!this.product) return;
    this.reviewLoading = true;
    this.reviewError = '';

    const payload = {
      product: this.product.id,
      rating: this.reviewRating,
      text: this.reviewText,
    };

    const request = this.myReview
      ? this.reviewService.update(this.myReview.id, { rating: this.reviewRating, text: this.reviewText })
      : this.reviewService.create(payload);

    request.subscribe({
      next: () => {
        this.reviewLoading = false;
        this.editingReview = false;
        this.loadReviews(this.product!.id);
        this.loadMyReview(this.product!.id);
      },
      error: (err) => {
        this.reviewLoading = false;
        this.reviewError = err.error?.detail || err.error?.non_field_errors?.[0] || 'Error submitting review';
        this.cdr.detectChanges();
      }
    });
  }

  deleteReview() {
    if (!this.myReview || !confirm('Delete your review?')) return;
    this.reviewService.delete(this.myReview.id).subscribe({
      next: () => {
        this.myReview = null;
        this.reviewRating = 5;
        this.reviewText = '';
        this.loadReviews(this.product!.id);
        this.cdr.detectChanges();
      }
    });
  }

  addToCart() {
    if (!this.product) return;
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find((i: any) => i.id === this.product!.id);
    if (existing) existing.qty++;
    else cart.push({ ...this.product, qty: 1 });
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Product added to your cart!');
  }

  getDiscount(product: any): number {
    if (!product.old_price || !product.price) return 0;
    if (product.old_price <= product.price) return 0;
    return Math.round((1 - product.price / product.old_price) * 100);
  }
}