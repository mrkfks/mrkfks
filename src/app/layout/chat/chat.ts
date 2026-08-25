import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, TelegramMessage } from './chat.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  messages: TelegramMessage[] = [];
  messageText = '';
  isLoading = false;
  chatId = '';
  showChatIdPrompt = false;
  inputChatId = '';

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.chatId = this.chatService.getChatId();
    if (!this.chatId) {
      this.showChatIdPrompt = true;
    }

    this.chatService.messages$.subscribe(messages => {
      this.messages = messages;
      this.scrollToBottom();
    });
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      if (this.messagesContainer && this.messagesContainer.nativeElement) {
        this.messagesContainer.nativeElement.scrollTop = 
          this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Scroll error:', err);
    }
  }

  setChatId(): void {
    if (this.inputChatId.trim()) {
      this.chatService.setChatId(this.inputChatId.trim());
      this.chatId = this.inputChatId;
      this.showChatIdPrompt = false;
      this.inputChatId = '';
    }
  }

  sendMessage(): void {
    if (!this.messageText.trim()) return;
    if (!this.chatId) {
      alert('Please set Chat ID first');
      return;
    }

    this.isLoading = true;
    const text = this.messageText;
    this.messageText = '';

    this.chatService.sendMessage(text).subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Send error:', error);
        this.isLoading = false;
        alert('Failed to send message. Check console for details.');
      }
    });
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  getCategoryColor(sender: string): string {
    return sender === 'user' ? '#007acc' : '#9cdcfe';
  }

  ngOnDestroy(): void {
    this.chatService.stopPolling();
  }
}
