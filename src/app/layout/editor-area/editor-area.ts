import { Component, inject, OnInit, OnChanges, signal, Input, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';

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
    const html = marked(content) as string;
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}