import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private auth = inject(AuthService);

  allProducts: any[] = [];
  products: any[] = [];
  categories: number[] = [];
  selectedCategory: number | null = null;
  searchQuery = '';

  get isAdmin() { return this.auth.isAdmin(); }
  get isLoggedIn() { return this.auth.isLoggedIn(); }
  get username() {
    const token = localStorage.getItem('access');
    if (!token) return '';
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.username;
  }

  logout() { this.auth.logout(); }

  ngOnInit() {
    this.http.get<any[]>('http://localhost:8000/api/products/', {
      headers: { 'Accept': 'application/json' },
      withCredentials: true
    }).subscribe({
      next: (data) => {
        this.allProducts = [...data];
        this.categories = [...new Set(data.map(p => p.category))];
        this.applyFilters();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('ERROR:', err)
    });
  }

  selectCategory(cat: number | null) {
    this.selectedCategory = cat;
    this.applyFilters();
  }
  get cartCount() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  return cart.reduce((sum: number, i: any) => sum + i.qty, 0);
}

  applyFilters() {
    let filtered = [...this.allProducts];
    if (this.selectedCategory !== null) {
      filtered = filtered.filter(p => p.category === this.selectedCategory);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(q));
    }
    this.products = filtered;
    this.cdr.detectChanges();
  }
}