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
  categories: any[] = [];
  selectedCategory: any = null;
  searchQuery = '';
  sortMode = 'default';
  viewMode: 'grid' | 'list' = 'grid';
  loading = true;

  private wishlist: Set<number> = new Set(
    JSON.parse(localStorage.getItem('wishlist') || '[]')
  );

  isWished(id: number): boolean {
    return this.wishlist.has(id);
  }

  toggleWish(id: number) {
    if (this.wishlist.has(id)) {
      this.wishlist.delete(id);
    } else {
      this.wishlist.add(id);
    }
    localStorage.setItem('wishlist', JSON.stringify([...this.wishlist]));
    this.cdr.detectChanges();
  }

  get wishlistCount(): number {
    return this.wishlist.size;
  }

  getDiscount(p: any): number {
    if (!p.old_price || !p.price) return 0;
    return Math.round((1 - p.price / p.old_price) * 100);
  }

  get filteredCount(): number {
    return this.products.length;
  }

  get isAdmin() { return this.auth.isAdmin(); }
  get isLoggedIn() { return this.auth.isLoggedIn(); }

  get username() {
    const token = localStorage.getItem('access');
    if (!token) return '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.username;
    } catch {
      return '';
    }
  }

  logout() { this.auth.logout(); }

  get cartCount(): number {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    return cart.reduce((sum: number, i: any) => sum + (i.qty || 0), 0);
  }

  ngOnInit() {
    this.http.get<any[]>('http://localhost:8000/api/products/', {
      headers: { 'Accept': 'application/json' },
      withCredentials: true
    }).subscribe({
      next: (data) => {
        this.allProducts = [...data];
        this.categories = [...new Set(data.map(p => p.category))];
        this.loading = false;
        this.applyFilters();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('ERROR:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  selectCategory(cat: any) {
    this.selectedCategory = cat;
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.allProducts];

    if (this.selectedCategory !== null) {
      filtered = filtered.filter(p => p.category === this.selectedCategory);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    switch (this.sortMode) {
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name_asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
        break;
      case 'newest':
        filtered.sort((a, b) =>
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
        break;
      default:
        break;
    }

    this.products = filtered;
    this.cdr.detectChanges();
  }
}

