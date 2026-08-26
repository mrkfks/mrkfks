import { Injectable } from '@angular/core';
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
export class ChatService {
  private messagesSignal = signal<ChatMessage[]>([]);
  private isOpenSignal = signal(false);
  private isLoadingSignal = signal(false);
  private errorMessageSignal = signal<string | null>(null);

  // Public computed signals for template
  messages$ = computed(() => this.messagesSignal());
  isOpen$ = computed(() => this.isOpenSignal());
  isLoading$ = computed(() => this.isLoadingSignal());
  errorMessage$ = computed(() => this.errorMessageSignal());
  hasMessages$ = computed(() => this.messagesSignal().length > 0);

  // Observable stream
  private messageReceived$ = new Subject<ChatMessage>();
  messageReceived = this.messageReceived$.asObservable();

  constructor() {
    this.initializeChat();
    this.setupAutoScroll();
  }

  private initializeChat(): void {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      sender: 'assistant',
      content: '👋 Hi! I\'m your AI Copilot. Ask me about my experience, projects, or technologies!',
      timestamp: new Date(),
      isLoading: false
    };
    this.messagesSignal.set([welcomeMessage]);
  }

  private setupAutoScroll(): void {
    effect(() => {
      const messages = this.messages$();
      if (messages.length > 0) {
        setTimeout(() => {
          const chatContainer = document.querySelector('[data-chat-messages]');
          if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
          }
        }, 0);
      }
    });
  }

  toggleChat(): void {
    this.isOpenSignal.set(!this.isOpenSignal());
  }

  openChat(): void {
    this.isOpenSignal.set(true);
  }

  closeChat(): void {
    this.isOpenSignal.set(false);
  }

  sendMessage(content: string): Observable<{ content: string }> {
    if (!content.trim()) {
      return throwError(() => new Error('Message cannot be empty'));
    }

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: content.trim(),
      timestamp: new Date(),
      isLoading: false
    };

    this.addMessage(userMessage);

    const loadingId = `loading-${Date.now()}`;
    const loadingMessage: ChatMessage = {
      id: loadingId,
      sender: 'assistant',
      content: '...',
      timestamp: new Date(),
      isLoading: true
    };

    this.addMessage(loadingMessage);
    this.isLoadingSignal.set(true);

    // Simulate response after delay
    return new Observable(observer => {
      setTimeout(() => {
        this.removeMessage(loadingId);
        this.isLoadingSignal.set(false);

        const aiResponse: ChatMessage = {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          content: `Thanks for your message! I received: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
          timestamp: new Date(),
          isLoading: false
        };

        this.addMessage(aiResponse);
        this.messageReceived$.next(aiResponse);

        observer.next({ content: aiResponse.content });
        observer.complete();
      }, 800);
    });
  }

  private addMessage(message: ChatMessage): void {
    const updated = [...this.messagesSignal(), message];
    this.messagesSignal.set(updated);
  }

  private removeMessage(messageId: string): void {
    const updated = this.messagesSignal().filter(m => m.id !== messageId);
    this.messagesSignal.set(updated);
  }

  clearMessages(): void {
    this.messagesSignal.set([]);
    this.errorMessageSignal.set(null);
  }
}
