import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OrderItem {
  id: number;
  product: number;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  user: number;
  status: 'pending' | 'paid' | 'shipped';
  created_at: string;
  total: number;
  items: OrderItem[];
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private api = 'http://localhost:8000/api/orders';
  private http = inject(HttpClient);

  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.api}/`);
  }

  createOrder(items: { product_id: number; quantity: number }[]): Observable<Order> {
    return this.http.post<Order>(`${this.api}/`, { items });
  }
}