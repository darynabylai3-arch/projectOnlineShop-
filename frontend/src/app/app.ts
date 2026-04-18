import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChatWidgetComponent } from './components/chat-widget/chat-widget';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, ChatWidgetComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');

  constructor(private router: Router) {}

  isHome(): boolean {
    return this.router.url === '/' || this.router.url === '/products' || this.router.url.startsWith('/products');
  }
}