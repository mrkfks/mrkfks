import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

export interface TelegramMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private botToken = '8773082745:AAEYAyenJT6v4ZSSUe0yKcyFZH15R0-k2os';
  private chatId = localStorage.getItem('telegram_chat_id') || '';
  private apiUrl = 'https://api.telegram.org/bot' + this.botToken;

  private messagesSubject = new BehaviorSubject<TelegramMessage[]>([]);
  messages$ = this.messagesSubject.asObservable();

  private messages: TelegramMessage[] = [];
  private pollInterval: any;
  private updateOffset = 0;

  constructor(private http: HttpClient) {
    this.loadMessages();
    this.startPolling();
  }

  loadMessages(): void {
    const stored = localStorage.getItem('telegram_messages');
    if (stored) {
      this.messages = JSON.parse(stored).map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp)
      }));
      this.messagesSubject.next([...this.messages]);
    }
  }

  saveMessages(): void {
    localStorage.setItem('telegram_messages', JSON.stringify(this.messages));
  }

  setChatId(id: string): void {
    this.chatId = id;
    localStorage.setItem('telegram_chat_id', id);
  }

  getChatId(): string {
    return this.chatId;
  }

  sendMessage(text: string): Observable<any> {
    if (!this.chatId) {
      throw new Error('Chat ID not set. Run /start command in Telegram bot first.');
    }

    const url = `${this.apiUrl}/sendMessage`;
    const params = {
      chat_id: this.chatId,
      text: text,
      parse_mode: 'Markdown'
    };

    // Add to local messages immediately
    const message: TelegramMessage = {
      id: Date.now().toString(),
      text: text,
      sender: 'user',
      timestamp: new Date()
    };

    this.messages.push(message);
    this.saveMessages();
    this.messagesSubject.next([...this.messages]);

    return this.http.post(url, params);
  }

  startPolling(): void {
    this.pollInterval = setInterval(() => {
      this.getUpdates();
    }, 2000); // Poll every 2 seconds
  }

  stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }

  private getUpdates(): void {
    const url = `${this.apiUrl}/getUpdates?offset=${this.updateOffset}&timeout=30`;

    this.http.get<any>(url).subscribe({
      next: (response) => {
        if (response.ok && response.result && response.result.length > 0) {
          response.result.forEach((update: any) => {
            this.updateOffset = update.update_id + 1;

            // Extract chat ID from message if not set
            if (update.message) {
              const newChatId = update.message.chat.id.toString();
              if (!this.chatId) {
                this.setChatId(newChatId);
              }

              // Add incoming message
              if (update.message.text && update.message.from.id !== 6088077258) {
                // 6088077258 is usually the bot's ID, but check your bot's ID
                const message: TelegramMessage = {
                  id: update.message.message_id.toString(),
                  text: update.message.text,
                  sender: 'bot',
                  timestamp: new Date(update.message.date * 1000)
                };

                // Check if message already exists
                if (!this.messages.find(m => m.id === message.id)) {
                  this.messages.push(message);
                  this.saveMessages();
                  this.messagesSubject.next([...this.messages]);
                }
              }
            }
          });
        }
      },
      error: (err) => {
        console.error('Polling error:', err);
      }
    });
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }
}
