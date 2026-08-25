import { Component, inject, OnInit, OnChanges, signal, Input, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './editor-area.html',
  styleUrl: './editor-area.css'
})
export class EditorComponent implements OnInit, OnChanges {
  private sanitizer = inject(DomSanitizer);
  
  @Input() selectedFilePath: string = '';
  @Input() selectedFileContent: string = '';
  
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

  getSafeHtml(): SafeHtml {
    const content = this.markdownContent();
    if (!content) {
      return this.sanitizer.bypassSecurityTrustHtml(
        `<div class="welcome-message"><h1>📄 Welcome</h1><p>Select a file to view its content</p></div>`
      );
    }
    const html = this.parseMarkdown(content);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  parseMarkdown(md: string): string {
    let html = md;

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

    return html;
  }
}