import { Component, inject, OnInit, OnChanges, signal, Input, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { timeout } from 'rxjs/operators';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editor-area.html',
  styleUrl: './editor-area.css'
})
export class EditorComponent implements OnInit, OnChanges {
  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);
  
  @Input() selectedFilePath: string = '';
  @Input() selectedFileContent: string = '';
  @ViewChild('editorTextarea') editorTextarea?: ElementRef<HTMLTextAreaElement>;
  @ViewChild('imageInput') imageInput?: ElementRef<HTMLInputElement>;
  
  isEditMode = false;
  markdownContent = signal<string>('');

  ngOnChanges(changes: SimpleChanges) {
    // selectedFileContent değiştiğinde markdownContent'i güncelle
    if (changes['selectedFileContent']) {
      this.markdownContent.set(this.selectedFileContent || '');
    }
  }

  ngOnInit() {
    // Sadece client-side tarafında veri yükle
    if (typeof window === 'undefined') return;
    
    // Başlangıçta boş sayfa göster
    this.markdownContent.set('');
  }

  insertFormat(format: string) {
    const textarea = this.editorTextarea?.nativeElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = this.markdownContent();
    const selectedText = text.substring(start, end) || 'metni gir';

    let formatted = '';
    let cursorOffset = 0;

    switch (format) {
      case 'bold':
        formatted = `**${selectedText}**`;
        cursorOffset = selectedText === 'metni gir' ? 2 : formatted.length;
        break;
      case 'italic':
        formatted = `*${selectedText}*`;
        cursorOffset = selectedText === 'metni gir' ? 1 : formatted.length;
        break;
      case 'h1':
        formatted = `# ${selectedText}\n`;
        cursorOffset = formatted.length;
        break;
      case 'h2':
        formatted = `## ${selectedText}\n`;
        cursorOffset = formatted.length;
        break;
      case 'h3':
        formatted = `### ${selectedText}\n`;
        cursorOffset = formatted.length;
        break;
      case 'ul':
        formatted = `- ${selectedText}\n`;
        cursorOffset = formatted.length;
        break;
      case 'ol':
        formatted = `1. ${selectedText}\n`;
        cursorOffset = formatted.length;
        break;
      case 'link':
        formatted = `[${selectedText}](url)`;
        cursorOffset = formatted.length - 5;
        break;
      case 'code':
        formatted = `\`\`\`\n${selectedText}\n\`\`\``;
        cursorOffset = formatted.length;
        break;
      case 'quote':
        formatted = `> ${selectedText}\n`;
        cursorOffset = formatted.length;
        break;
      case 'align-left':
        formatted = `<div style="text-align: left;">${selectedText}</div>\n`;
        cursorOffset = formatted.length;
        break;
      case 'align-center':
        formatted = `<div style="text-align: center;">${selectedText}</div>\n`;
        cursorOffset = formatted.length;
        break;
      case 'align-right':
        formatted = `<div style="text-align: right;">${selectedText}</div>\n`;
        cursorOffset = formatted.length;
        break;
      case 'line':
        formatted = `---\n`;
        cursorOffset = formatted.length;
        break;
      case 'table':
        formatted = `| Başlık 1 | Başlık 2 |\n|----------|----------|\n| Veri 1   | Veri 2   |\n`;
        cursorOffset = formatted.length;
        break;
    }

    const newText = text.substring(0, start) + formatted + text.substring(end);
    this.markdownContent.set(newText);

    // Cursor konumunu ayarla
    setTimeout(() => {
      if (textarea) {
        textarea.selectionStart = textarea.selectionEnd = start + cursorOffset;
        textarea.focus();
      }
    });
  }

  handleKeydown(event: KeyboardEvent) {
    const textarea = this.editorTextarea?.nativeElement;
    if (!textarea) return;

    // Ctrl+B için bold
    if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
      event.preventDefault();
      this.insertFormat('bold');
    }
    // Ctrl+I için italic
    if ((event.ctrlKey || event.metaKey) && event.key === 'i') {
      event.preventDefault();
      this.insertFormat('italic');
    }
  }

  saveFile() {
    if (!this.isEditMode || !this.selectedFilePath) return;
    
    this.http.put(`/api/files/content/${encodeURIComponent(this.selectedFilePath)}`, { 
      content: this.markdownContent() 
    }).subscribe({
      next: () => alert('Dosya başarıyla kaydedildi!'),
      error: (err) => alert('Dosya kaydedilemedi: ' + err.message)
    });
  }

  getSafeHtml(): SafeHtml {
    const markdown = this.markdownContent();
    const html = this.parseMarkdown(markdown);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  parseMarkdown(md: string): string {
    let html = md;

    // Escape HTML special characters first
    html = html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Revert escaped markdown markers
    html = html.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

    // Headings
    html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');

    // Horizontal line
    html = html.replace(/^---$/gm, '<hr>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Images
    html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; margin: 16px 0; border-radius: 4px; border: 1px solid #3e3e42;">');

    // Links
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" style="color: #569cd6; text-decoration: none;">$1</a>');

    // Code blocks
    html = html.replace(/```([\s\S]*?)```/g, '<pre style="background-color: #1e1e1e; border: 1px solid #3e3e42; padding: 12px; border-radius: 4px; overflow-x: auto; margin: 8px 0;"><code style="color: #d4d4d4; font-family: Consolas, Monaco, monospace; font-size: 12px;">$1</code></pre>');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code style="background-color: #3e3e42; padding: 2px 6px; border-radius: 3px; font-family: Consolas, Monaco, monospace; font-size: 12px; color: #ce9178;">$1</code>');

    // Block quotes
    html = html.replace(/^> (.*?)$/gm, '<blockquote style="border-left: 4px solid #569cd6; padding-left: 12px; margin: 8px 0; color: #858585;">$1</blockquote>');

    // Line breaks
    html = html.replace(/\n/g, '<br>');

    // Alignment divs
    html = html.replace(/<div style="text-align: (left|center|right);">(.*?)<\/div>/g, '<div style="text-align: $1;">$2</div>');

    // Tables (simple support)
    html = html.replace(/\|(.*?)\|/g, (match) => {
      const cells = match.split('|').filter(c => c.trim());
      if (cells.length > 0) {
        return '<tr>' + cells.map(c => `<td style="border: 1px solid #3e3e42; padding: 8px;">${c.trim()}</td>`).join('') + '</tr>';
      }
      return match;
    });

    // Wrap table rows in table
    if (html.includes('<tr>')) {
      html = html.replace(/(<tr>.*?<\/tr>)/gs, '<table style="border-collapse: collapse; margin: 16px 0;">$1</table>');
    }

    return html;
  }

  openImageUpload() {
    this.imageInput?.nativeElement?.click();
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;

    // Dosya boyutu kontrol et (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('Fotoğraf boyutu 10MB\'dan küçük olmalıdır!');
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      const base64String = e.target?.result as string;
      
      // Backend'e base64 gönder
      this.http.post<any>('/api/upload', { 
        imageData: base64String.split(',')[1], // base64 kısmını al
        filename: file.name 
      }).subscribe({
        next: (response) => {
          if (response.success && response.data?.url) {
            const imageMarkdown = `![${file.name}](${response.data.url})\n`;
            const textarea = this.editorTextarea?.nativeElement;
            
            if (textarea) {
              const start = textarea.selectionStart;
              const text = this.markdownContent();
              const newText = text.substring(0, start) + imageMarkdown + text.substring(start);
              this.markdownContent.set(newText);
              
              setTimeout(() => {
                if (textarea) {
                  textarea.selectionStart = textarea.selectionEnd = start + imageMarkdown.length;
                  textarea.focus();
                }
              });
            }
          }
        },
        error: (err) => {
          console.error('Image upload error:', err);
          alert('Fotoğraf yüklenemedi: ' + (err.error?.message || err.statusText || 'Bilinmeyen hata'));
        }
      });
    };
    
    reader.onerror = () => {
      alert('Fotoğraf okunamadı!');
    };
    
    reader.readAsDataURL(file);

    // Input'u reset et
    input.value = '';
  }
}