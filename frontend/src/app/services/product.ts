import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  stock: number;
  category: number;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private api = 'http://localhost:8000/api/products';
  private http = inject(HttpClient);

  getAll()               { return this.http.get<Product[]>(this.api + '/'); }
  getById(id: number)    { return this.http.get<Product>(`${this.api}/${id}/`); }
  create(data: FormData) { return this.http.post<Product>(this.api + '/', data); }
  update(id: number, data: FormData) { return this.http.patch<Product>(`${this.api}/${id}/`, data); }
  delete(id: number)     { return this.http.delete(`${this.api}/${id}/`); }
}