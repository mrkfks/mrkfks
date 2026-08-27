import { Component, OnInit, OnDestroy, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../core/services/chat.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (sidebarMode) {
    <!-- Sidebar modu: activity bar'dan açılır, tam panel -->
    <div class="chat-sidebar">
      <div class="chat-header">
        <h3>AI Copilot</h3>
        <button class="btn-icon" (click)="clearChat()" title="Clear messages">🗑️</button>
      </div>

      <div class="chat-messages" data-chat-messages>
        @for (message of messages$(); track message.id) {
          <div class="message"
               [class.user]="message.sender === 'user'"
               [class.assistant]="message.sender === 'assistant'"
               [class.loading]="message.isLoading">
            <div class="message-avatar">{{ message.sender === 'user' ? '👤' : '🤖' }}</div>
            <div class="message-content">
              <div class="message-bubble">{{ message.content }}</div>
              <span class="message-time">{{ message.timestamp | date:'HH:mm' }}</span>
            </div>
          </div>
        }
        @if (isLoading$()) {
          <div class="loading-dots"><span></span><span></span><span></span></div>
        }
      </div>

      @if (errorMessage$()) {
        <div class="error-message">⚠️ {{ errorMessage$() }}</div>
      }

      <div class="chat-input-area">
        <form (ngSubmit)="sendMessage()" class="chat-form">
          <input [(ngModel)]="inputMessage" name="message" type="text"
            placeholder="Ask me anything..." class="chat-input"
            [disabled]="isLoading$()" (keydown.enter)="sendMessage()" autocomplete="off">
          <button type="submit" class="send-btn"
            [disabled]="!inputMessage.trim() || isLoading$()" title="Send (Enter)">📤</button>
        </form>
      </div>
    </div>
    } @else {
    <!-- Floating modu -->
    <div class="chat-widget-container" [class.open]="isOpen$()">
      <button class="chat-toggle-btn" (click)="toggleChat()"
        [attr.aria-label]="isOpen$() ? 'Close chat' : 'Open chat'"
        title="AI Copilot Chat (Ctrl+Shift+C)">
        <span class="chat-icon">💬</span>
        <span class="unread-badge" *ngIf="hasMessages$()">●</span>
      </button>

      @if (isOpen$()) {
      <div class="chat-panel">
        <div class="chat-header">
          <h3>AI Copilot</h3>
          <div class="header-actions">
            <button class="btn-icon" (click)="clearChat()" title="Clear messages">🗑️</button>
            <button class="btn-icon" (click)="toggleChat()" title="Close">✕</button>
          </div>
        </div>

        <div class="chat-messages" data-chat-messages>
          @for (message of messages$(); track message.id) {
            <div class="message"
                 [class.user]="message.sender === 'user'"
                 [class.assistant]="message.sender === 'assistant'"
                 [class.loading]="message.isLoading">
              <div class="message-avatar">{{ message.sender === 'user' ? '👤' : '🤖' }}</div>
              <div class="message-content">
                <div class="message-bubble">{{ message.content }}</div>
                <span class="message-time">{{ message.timestamp | date:'HH:mm' }}</span>
              </div>
            </div>
          }
          @if (isLoading$()) {
            <div class="loading-dots"><span></span><span></span><span></span></div>
          }
        </div>

        @if (errorMessage$()) {
          <div class="error-message">⚠️ {{ errorMessage$() }}</div>
        }

        <div class="chat-input-area">
          <form (ngSubmit)="sendMessage()" class="chat-form">
            <input [(ngModel)]="inputMessage" name="message" type="text"
              placeholder="Ask me anything..." class="chat-input"
              [disabled]="isLoading$()" (keydown.enter)="sendMessage()" autocomplete="off">
            <button type="submit" class="send-btn"
              [disabled]="!inputMessage.trim() || isLoading$()" title="Send (Enter)">📤</button>
          </form>
        </div>
      </div>
      }
    </div>
    }
  `,
  styles: [`
    :host {
      --chat-primary: #007acc;
      --chat-bg: #1e1e1e;
      --chat-border: #333333;
      --chat-text: #cccccc;
      --chat-user-bg: #0e639c;
      --chat-assistant-bg: #252526;
    }

    /* Sidebar modu */
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      flex-shrink: 0;
    }

    .chat-sidebar {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      background: var(--chat-bg);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 14px;
      overflow: hidden;
    }

    .chat-sidebar .chat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid var(--chat-border);
      background: #252526;
      flex-shrink: 0;
    }

    .chat-sidebar .chat-header h3 {
      margin: 0;
      color: var(--chat-text);
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .chat-sidebar .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .chat-sidebar .chat-input-area {
      padding: 10px;
      border-top: 1px solid var(--chat-border);
      background: #252526;
      flex-shrink: 0;
    }

    .chat-widget-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 14px;
    }

    /* Toggle Button */
    .chat-toggle-btn {
      position: relative;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: var(--chat-primary);
      color: white;
      border: none;
      cursor: pointer;
      font-size: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      transition: all 0.3s ease;
      z-index: 10000;
    }

    .chat-toggle-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 16px rgba(0, 122, 204, 0.4);
    }

    .chat-toggle-btn:active {
      transform: scale(0.95);
    }

    .unread-badge {
      position: absolute;
      top: 0;
      right: 0;
      width: 12px;
      height: 12px;
      background: #ff4444;
      border-radius: 50%;
      font-size: 8px;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    /* Chat Panel */
    .chat-panel {
      position: absolute;
      bottom: 80px;
      right: 0;
      width: 380px;
      height: 600px;
      background: var(--chat-bg);
      border: 1px solid var(--chat-border);
      border-radius: 8px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: slideUp 0.3s ease;
      z-index: 10001;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Header */
    .chat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid var(--chat-border);
      background: #252526;
      flex-shrink: 0;
    }

    .chat-header h3 {
      margin: 0;
      color: var(--chat-text);
      font-size: 16px;
      font-weight: 600;
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }

    .btn-icon {
      background: none;
      border: none;
      color: var(--chat-text);
      cursor: pointer;
      font-size: 16px;
      padding: 4px 8px;
      border-radius: 4px;
      transition: all 0.2s;
    }

    .btn-icon:hover {
      background: var(--chat-border);
    }

    /* Messages Area */
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .chat-messages::-webkit-scrollbar {
      width: 6px;
    }

    .chat-messages::-webkit-scrollbar-track {
      background: var(--chat-bg);
    }

    .chat-messages::-webkit-scrollbar-thumb {
      background: var(--chat-border);
      border-radius: 3px;
    }

    .chat-messages::-webkit-scrollbar-thumb:hover {
      background: #555555;
    }

    /* Message */
    .message {
      display: flex;
      gap: 8px;
      animation: messageIn 0.3s ease;
    }

    @keyframes messageIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .message.user {
      justify-content: flex-end;
    }

    .message-avatar {
      font-size: 20px;
      flex-shrink: 0;
    }

    .message.user .message-avatar {
      order: 2;
    }

    .message-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
      max-width: 80%;
    }

    .message.user .message-content {
      align-items: flex-end;
    }

    .message-bubble {
      padding: 10px 12px;
      border-radius: 8px;
      word-wrap: break-word;
      line-height: 1.4;
    }

    .message.user .message-bubble {
      background: var(--chat-user-bg);
      color: #ffffff;
      border-bottom-right-radius: 2px;
    }

    .message.assistant .message-bubble {
      background: var(--chat-assistant-bg);
      color: var(--chat-text);
      border-bottom-left-radius: 2px;
    }

    .message.loading .message-bubble {
      background: var(--chat-border);
    }

    .message-time {
      font-size: 11px;
      color: #666666;
      padding: 0 4px;
    }

    /* Loading Dots */
    .loading-dots {
      display: flex;
      gap: 4px;
      align-items: center;
      justify-content: center;
      padding: 8px;
    }

    .loading-dots span {
      width: 6px;
      height: 6px;
      background: var(--chat-border);
      border-radius: 50%;
      animation: bounce 1.4s infinite;
    }

    .loading-dots span:nth-child(2) {
      animation-delay: 0.2s;
    }

    .loading-dots span:nth-child(3) {
      animation-delay: 0.4s;
    }

    @keyframes bounce {
      0%, 80%, 100% { opacity: 0.3; }
      40% { opacity: 1; }
    }

    /* Error Message */
    .error-message {
      padding: 10px 12px;
      background: #5f1f1f;
      color: #ff9999;
      border-radius: 4px;
      margin: 8px 16px 0;
      font-size: 12px;
      flex-shrink: 0;
    }

    /* Input Area */
    .chat-input-area {
      padding: 12px;
      border-top: 1px solid var(--chat-border);
      background: #252526;
      flex-shrink: 0;
    }

    .chat-form {
      display: flex;
      gap: 8px;
      margin-bottom: 8px;
    }

    .chat-input {
      flex: 1;
      padding: 10px 12px;
      background: var(--chat-bg);
      color: var(--chat-text);
      border: 1px solid var(--chat-border);
      border-radius: 4px;
      font-size: 13px;
      outline: none;
      transition: all 0.2s;
    }

    .chat-input:focus {
      border-color: var(--chat-primary);
      box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.2);
    }

    .chat-input:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .send-btn {
      padding: 10px 14px;
      background: var(--chat-primary);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
      flex-shrink: 0;
    }

    .send-btn:hover:not(:disabled) {
      background: #1084d7;
    }

    .send-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Sidebar Mode */
    .sidebar-mode {
      position: relative;
      bottom: auto;
      right: auto;
      width: 100%;
      height: 100%;
    }

    .sidebar-mode .chat-panel {
      position: relative;
      bottom: auto;
      right: auto;
      width: 100%;
      height: 100%;
      border-radius: 0;
      box-shadow: none;
      border: none;
      border-right: 1px solid var(--chat-border);
      animation: none;
    }

    /* Responsive */
    @media (max-width: 600px) {
      .chat-panel {
        width: calc(100vw - 32px);
        height: 500px;
        bottom: 72px;
      }

      .message-content {
        max-width: 90%;
      }
    }
  `]
})
export class ChatWidgetComponent implements OnInit, OnDestroy {
  @Input() sidebarMode = false;
  inputMessage = '';

  // Service injection
  private chatService = inject(ChatService);
  private destroy$ = new Subject<void>();

  // Public observables for template
  messages$ = this.chatService.messages$;
  isOpen$ = this.chatService.isOpen$;
  isLoading$ = this.chatService.isLoading$;
  errorMessage$ = this.chatService.errorMessage$;
  hasMessages$ = this.chatService.hasMessages$;

  ngOnInit(): void {
    // Keyboard shortcut: Ctrl+Shift+C to open/close chat
    document.addEventListener('keydown', this.handleKeyboardShortcut.bind(this));
  }

  ngOnDestroy(): void {
    document.removeEventListener('keydown', this.handleKeyboardShortcut.bind(this));
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleChat(): void {
    this.chatService.toggleChat();
  }

  sendMessage(): void {
    if (!this.inputMessage.trim()) {
      return;
    }

    this.chatService.sendMessage(this.inputMessage)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.inputMessage = '';
        },
        error: (err: Error) => {
          console.error('Error sending message:', err);
        }
      });
  }

  useSuggestedPrompt(prompt: string): void {}

  clearChat(): void {
    if (confirm('Clear all messages?')) {
      this.chatService.clearMessages();
    }
  }

  private handleKeyboardShortcut(event: KeyboardEvent): void {
    if (event.ctrlKey && event.shiftKey && event.code === 'KeyC') {
      event.preventDefault();
      this.toggleChat();
    }
  }
}
