import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Review {
  id: number;
  product: number;
  user: number;
  username: string;
  rating: number;
  text: string;
  created_at: string;
}

export interface ProductRating {
  product_id: number;
  average: number;
  count: number;
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private api = 'http://localhost:8000/api';
  private http = inject(HttpClient);

  getByProduct(productId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.api}/reviews/?product=${productId}`);
  }

  getRating(productId: number): Observable<ProductRating> {
    return this.http.get<ProductRating>(`${this.api}/reviews/product/${productId}/rating/`);
  }

  getMyReview(productId: number): Observable<Review | null> {
    return this.http.get<Review | null>(`${this.api}/reviews/product/${productId}/my/`);
  }

  create(data: { product: number; rating: number; text: string }): Observable<Review> {
    return this.http.post<Review>(`${this.api}/reviews/`, data);
  }

  update(id: number, data: { rating: number; text: string }): Observable<Review> {
    return this.http.patch<Review>(`${this.api}/reviews/${id}/`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/reviews/${id}/`);
  }

  getMyReviews(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/reviews/mine/`);
  }
}