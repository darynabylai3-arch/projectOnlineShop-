import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private api = 'http://localhost:8000/api/chat/ai/';
  private http = inject(HttpClient);

  sendMessage(message: string) {
    return this.http.post<{reply: string}>(this.api, { message });
  }
}