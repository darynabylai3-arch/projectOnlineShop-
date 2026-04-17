import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class Api {
  private base = 'http://localhost:8000/api';
  private http = inject(HttpClient);

  // Товары
  getProducts() {
    return this.http.get<any[]>(`${this.base}/products/`);
  }

  getProduct(id: number) {
    return this.http.get<any>(`${this.base}/products/${id}/`);
  }

  // Заказы
  getOrders() {
    return this.http.get<any[]>(`${this.base}/orders/`);
  }

  createOrder(data: any) {
    return this.http.post(`${this.base}/orders/`, data);
  }
}