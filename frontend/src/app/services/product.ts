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

export interface Category {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private api = 'http://localhost:8000/api/products';
  private catApi = 'http://localhost:8000/api/categories';
  private http = inject(HttpClient);
  private headers = { headers: { 'Accept': 'application/json' } };

  getAll()               { return this.http.get<Product[]>(this.api + '/', this.headers); }
  getById(id: number)    { return this.http.get<Product>(`${this.api}/${id}/`, this.headers); }
  create(data: FormData) { return this.http.post<Product>(this.api + '/', data); }
  update(id: number, data: FormData) { return this.http.patch<Product>(`${this.api}/${id}/`, data); }
  delete(id: number)     { return this.http.delete(`${this.api}/${id}/`); }

  getAllCategories()            { return this.http.get<Category[]>(this.catApi + '/', this.headers); }
  createCategory(name: string) { return this.http.post<Category>(this.catApi + '/', { name }); }
  deleteCategory(id: number)   { return this.http.delete(`${this.catApi}/${id}/`); }
}