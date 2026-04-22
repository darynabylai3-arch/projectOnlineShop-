import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart implements OnInit {
  items: any[] = [];

  ngOnInit() {
    this.items = JSON.parse(localStorage.getItem('cart') || '[]');
  }

  get total(): number {
    return this.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  }

  get totalItems(): number {
    return this.items.reduce((sum, i) => sum + i.qty, 0);
  }

  increase(item: any) {
    item.qty++;
    this.save();
  }

  decrease(item: any) {
    if (item.qty > 1) item.qty--;
    else this.remove(item);
    this.save();
  }

  remove(item: any) {
    this.items = this.items.filter(i => i.id !== item.id);
    this.save();
  }

  save() {
    localStorage.setItem('cart', JSON.stringify(this.items));
  }

  checkout() {
    alert('Заказ оформлен! Спасибо 🎉');
    localStorage.removeItem('cart');
    this.items = [];
  }
}