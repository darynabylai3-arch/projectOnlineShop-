import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  time: string;
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

  private addMessage(role: 'user' | 'assistant', content: string) {
    this.zone.run(() => {
      this.messages = [...this.messages, {
        role,
        content,
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
      }];
      this.cdr.detectChanges();
    });
  }

  toggle() {
    this.isOpen = !this.isOpen;
    this.hasNew = false;
    if (this.isOpen) setTimeout(() => this.inputRef?.nativeElement.focus(), 100);
  }

  send() {
    const msg = this.text.trim();
    if (!msg || this.isLoading) return;

    this.addMessage('user', msg);
    this.text = '';
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