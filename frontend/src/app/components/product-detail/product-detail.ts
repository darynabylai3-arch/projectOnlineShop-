import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../services/product';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail implements OnInit {
  product: Product | null = null;
  relatedProducts: Product[] = [];
  qty = 1;
  selectedImage: string | null = null;
  
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productService.getById(id).subscribe(p => {
      this.product = p;
      this.selectedImage = p.image;
      this.loadRelatedProducts(p.category);
      this.cdr.detectChanges();
    });
  }

  loadRelatedProducts(category: string) {
    this.productService.getByCategory(category).subscribe(products => {
      this.relatedProducts = products.filter(p => p.id !== this.product?.id).slice(0, 4);
      this.cdr.detectChanges();
    });
  }

  getDiscount(): number {
    if (!this.product?.old_price || !this.product?.price) return 0;
    return Math.round((1 - this.product.price / this.product.old_price) * 100);
  }

  getStars(rating: number): string[] {
    const full = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    const stars = [];
    for (let i = 0; i < full; i++) stars.push('★');
    if (hasHalf) stars.push('½');
    while (stars.length < 5) stars.push('☆');
    return stars;
  }

  getTimeLeft(): string {
    const hours = Math.floor(Math.random() * 12) + 1;
    const minutes = Math.floor(Math.random() * 60);
    return `${hours}ч ${minutes}м`;
  }

  incrementQty() {
    if (this.product && this.qty < this.product.stock) {
      this.qty++;
    }
  }

  decrementQty() {
    if (this.qty > 1) {
      this.qty--;
    }
  }

  validateQty() {
    if (this.product) {
      if (this.qty < 1) this.qty = 1;
      if (this.qty > this.product.stock) this.qty = this.product.stock;
    }
  }

  addToCart() {
    if (!this.product) return;
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find((i: any) => i.id === this.product!.id);
    if (existing) {
      existing.qty += this.qty;
    } else {
      cart.push({ ...this.product, qty: this.qty });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`✅ ${this.product.name} добавлен в корзину! (${this.qty} шт.)`);
  }

  shareTelegram() {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=Посмотрите%20товар%20${encodeURIComponent(this.product?.name || '')}`, '_blank');
  }

  shareWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${this.product?.name} - ${window.location.href}`)}`, '_blank');
  }

  shareVK() {
    window.open(`https://vk.com/share.php?url=${encodeURIComponent(window.location.href)}`, '_blank');
  }
}
