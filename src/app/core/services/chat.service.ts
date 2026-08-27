import { Injectable, inject, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { signal, computed, effect } from '@angular/core';
import { Subject, Observable, throwError } from 'rxjs';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService implements OnDestroy {
  private http = inject(HttpClient);

  private readonly botToken = '8773082745:AAEYAyenJT6v4ZSSUe0yKcyFZH15R0-k2os';
  private readonly chatId = '8851872237';
  private readonly apiUrl = `https://api.telegram.org/bot${this.botToken}`;
  private updateOffset = 0;
  private pollInterval?: ReturnType<typeof setInterval>;

  private messagesSignal = signal<ChatMessage[]>([]);
  private isOpenSignal = signal(false);
  private isLoadingSignal = signal(false);
  private errorMessageSignal = signal<string | null>(null);

  messages$ = computed(() => this.messagesSignal());
  isOpen$ = computed(() => this.isOpenSignal());
  isLoading$ = computed(() => this.isLoadingSignal());
  errorMessage$ = computed(() => this.errorMessageSignal());
  hasMessages$ = computed(() => this.messagesSignal().length > 0);

  private messageReceived$ = new Subject<ChatMessage>();
  messageReceived = this.messageReceived$.asObservable();

  constructor() {
    this.initializeChat();
    this.setupAutoScroll();
    this.startPolling();
  }

  private initializeChat(): void {
    this.messagesSignal.set([{
      id: 'welcome',
      sender: 'assistant',
      content: '👋 Hi! I\'m your AI Copilot. Ask me about my experience, projects, or technologies!',
      timestamp: new Date(),
    }]);
  }

  private setupAutoScroll(): void {
    effect(() => {
      const messages = this.messages$();
      if (messages.length > 0) {
        setTimeout(() => {
          const el = document.querySelector('[data-chat-messages]');
          if (el) el.scrollTop = el.scrollHeight;
        }, 0);
      }
    });
  }

  private startPolling(): void {
    // Önce mevcut offset'i al, eski mesajları gösterme
    this.http.get<any>(`${this.apiUrl}/getUpdates?limit=1`).subscribe({
      next: (res) => {
        if (res.result?.length) {
          this.updateOffset = res.result[res.result.length - 1].update_id + 1;
        }
        this.pollInterval = setInterval(() => this.getUpdates(), 3000);
      },
      error: () => {
        this.pollInterval = setInterval(() => this.getUpdates(), 3000);
      }
    });
  }

  private getUpdates(): void {
    this.http.get<any>(`${this.apiUrl}/getUpdates?offset=${this.updateOffset}&timeout=5`).subscribe({
      next: (res) => {
        if (!res.ok || !res.result?.length) return;
        const knownIds = new Set(this.messagesSignal().map(m => m.id));

        res.result.forEach((update: any) => {
          this.updateOffset = update.update_id + 1;
          const msg = update.message;
          if (!msg?.text) return;

          // Sadece belirlenen chat'ten gelen cevapları göster
          if (msg.chat.id.toString() !== this.chatId) return;

          const msgId = msg.message_id.toString();
          if (knownIds.has(msgId)) return;

          const incoming: ChatMessage = {
            id: msgId,
            sender: 'assistant',
            content: msg.text,
            timestamp: new Date(msg.date * 1000),
          };
          this.addMessage(incoming);
          this.messageReceived$.next(incoming);
        });
      },
      error: () => {} // polling hataları sessizce yoksay
    });
  }

  toggleChat(): void { this.isOpenSignal.set(!this.isOpenSignal()); }
  openChat(): void { this.isOpenSignal.set(true); }
  closeChat(): void { this.isOpenSignal.set(false); }

  sendMessage(content: string): Observable<{ content: string }> {
    if (!content.trim() || this.isLoadingSignal()) return throwError(() => new Error('Invalid'));

    this.addMessage({
      id: `user-${Date.now()}`,
      sender: 'user',
      content: content.trim(),
      timestamp: new Date(),
    });

    this.isLoadingSignal.set(true);
    this.errorMessageSignal.set(null);

    return new Observable(observer => {
      this.http.post(`${this.apiUrl}/sendMessage`, {
        chat_id: this.chatId,
        text: content,
        parse_mode: 'Markdown'
      }).subscribe({
        next: () => {
          this.isLoadingSignal.set(false);
          observer.next({ content });
          observer.complete();
        },
        error: () => {
          this.isLoadingSignal.set(false);
          this.errorMessageSignal.set('Mesaj gönderilemedi. Lütfen tekrar deneyin.');
          observer.error(new Error('Send failed'));
        }
      });
    });
  }

  clearMessages(): void {
    this.messagesSignal.set([]);
    this.errorMessageSignal.set(null);
  }

  ngOnDestroy(): void {
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.messageReceived$.complete();
  }

  private addMessage(msg: ChatMessage): void {
    this.messagesSignal.set([...this.messagesSignal(), msg]);
  }
}

