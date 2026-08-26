import { Component, inject, Input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TabBarComponent } from './tab-bar.component';
import { TabStateService, Tab } from '../../core/services/tab-state.service';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, TabBarComponent],
  templateUrl: './editor-area.html',
  styleUrl: './editor-area.css'
})
export class EditorComponent {
  private sanitizer = inject(DomSanitizer);
  
  @Input() activeTab: Tab | null = null;

  getSafeHtml(): SafeHtml {
    if (!this.activeTab) {
      return this.sanitizer.bypassSecurityTrustHtml(
        `<div class="welcome-message"><h1>📄 Welcome</h1><p>Select a file to view its content</p></div>`
      );
    }

    if (this.activeTab.isLoading) {
      return this.sanitizer.bypassSecurityTrustHtml(
        `<div class="welcome-message"><h1>⏳ Loading...</h1><p>${this.activeTab.name}</p></div>`
      );
    }

    const content = this.activeTab.content;
    if (!content) {
      return this.sanitizer.bypassSecurityTrustHtml(
        `<div class="welcome-message"><h1>📄 ${this.activeTab.name}</h1><p>No content available</p></div>`
      );
    }

    // Parse markdown only if type is markdown
    if (this.activeTab.type === 'markdown') {
      const html = this.parseMarkdown(content);
      return this.sanitizer.bypassSecurityTrustHtml(html);
    }

    // For other types, show as pre-formatted text
    return this.sanitizer.bypassSecurityTrustHtml(
      `<pre style="background-color: #1e1e1e; border: 1px solid #3e3e42; padding: 12px; border-radius: 4px; overflow-x: auto; margin: 8px 0;"><code style="color: #d4d4d4; font-family: Consolas, Monaco, monospace; font-size: 12px;">${this.escapeHtml(content)}</code></pre>`
    );
  }

  private parseMarkdown(md: string): string {
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

  private escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }
}