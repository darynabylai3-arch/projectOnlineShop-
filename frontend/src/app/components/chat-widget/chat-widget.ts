import {
  Component, OnInit, ViewChild, ElementRef,
  AfterViewChecked, ChangeDetectorRef, NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  time: string;
  reaction?: string;
}

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-widget.html',
  styleUrls: ['./chat-widget.css']
})
export class ChatWidgetComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesBox') messagesBox!: ElementRef;
  @ViewChild('inputRef') inputRef!: ElementRef;

  isOpen = false;
  isLoading = false;
  hasNew = false;
  text = '';
  messages: Message[] = [];

  // ── Quick suggestions shown before first message ──
  suggestions = [
    '🔥 Акции и скидки',
    '📦 Доставка',
    '↩️ Возврат товара',
    '💳 Оплата',
  ];

  // ── Reactions ──
  reactionEmojis = ['👍', '❤️', '😮'];

  constructor(
    private chatService: ChatService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit() {
    this.addMessage('assistant', '👋 Сәлем! Мен ShopMind ИИ-кеңесшісімін. Қалай көмектесе аламын?');
  }

  ngAfterViewChecked() {
    try {
      const el = this.messagesBox?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }

  private now(): string {
    return new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  }

  private addMessage(role: 'user' | 'assistant', content: string) {
    this.zone.run(() => {
      this.messages = [...this.messages, { role, content, time: this.now() }];
      this.cdr.detectChanges();
    });
  }

  toggle() {
    this.isOpen = !this.isOpen;
    this.hasNew = false;
    if (this.isOpen) setTimeout(() => this.inputRef?.nativeElement?.focus(), 120);
  }

  // ── Send chip suggestion as a message ──
  sendSuggestion(text: string) {
    this.text = text;
    this.send();
  }

  // ── React to assistant message ──
  react(msg: Message, emoji: string) {
    msg.reaction = msg.reaction === emoji ? undefined : emoji;
    this.cdr.detectChanges();
  }

  // ── Clear conversation ──
  clearChat() {
    this.messages = [];
    this.addMessage('assistant', '🧹 Чат очищен. Чем могу помочь?');
  }

  // ── Auto-resize textarea ──
  autoResize(event: Event) {
    const el = event.target as HTMLTextAreaElement;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 100) + 'px';
  }

  send() {
    const msg = this.text.trim();
    if (!msg || this.isLoading) return;

    this.addMessage('user', msg);
    this.text = '';

    // Reset textarea height
    setTimeout(() => {
      if (this.inputRef?.nativeElement) {
        this.inputRef.nativeElement.style.height = 'auto';
      }
    });

    this.isLoading = true;
    this.cdr.detectChanges();

    this.chatService.sendMessage(msg).subscribe({
      next: (res) => {
        this.zone.run(() => {
          this.addMessage('assistant', res.reply);
          this.isLoading = false;
          if (!this.isOpen) this.hasNew = true;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.zone.run(() => {
          console.error('Ошибка:', err);
          this.addMessage('assistant', '⚠️ Қате орын алды. Кейінірек қайталаңыз.');
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  onKey(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.send();
    }
  }
}