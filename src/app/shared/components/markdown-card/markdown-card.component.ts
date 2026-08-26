import { Component, Input, Output, EventEmitter, inject, ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-markdown-card',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="md-card">
      <div class="md-card-header">
        <span class="md-card-icon">📄</span>
        <span class="md-card-title">{{ fileName }}</span>
        <button class="md-card-close" (click)="closed.emit()" title="Kapat">✕</button>
      </div>
      @if (loading) {
        <div class="md-card-loading">Yükleniyor...</div>
      } @else {
        <div class="md-card-body" [innerHTML]="html"></div>
      }
    </div>
  `,
  styles: [`
    .md-card {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--vs-bg, #1e1e1e);
      overflow: hidden;
    }
    .md-card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      background: var(--vs-hover, #2d2d30);
      border-bottom: 1px solid var(--vs-border, #3e3e42);
      flex-shrink: 0;
    }
    .md-card-icon { font-size: 13px; }
    .md-card-title {
      flex: 1;
      font-size: 12px;
      color: var(--vs-text, #cccccc);
      font-family: 'Consolas', monospace;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .md-card-close {
      background: none;
      border: none;
      color: var(--vs-muted, #858585);
      cursor: pointer;
      font-size: 14px;
      padding: 2px 6px;
      line-height: 1;
      border-radius: 2px;
      transition: all 0.15s;
    }
    .md-card-close:hover { color: #fff; background: #5a1d1d; }
    .md-card-loading {
      padding: 24px;
      text-align: center;
      color: var(--vs-muted, #858585);
      font-size: 12px;
    }
    .md-card-body {
      flex: 1;
      padding: 20px 24px;
      color: var(--vs-text, #cccccc);
      font-size: var(--vs-font-size, 13px);
      line-height: 1.7;
      overflow-y: auto;
      font-family: 'Segoe UI', Tahoma, sans-serif;
    }
    .md-card-body::-webkit-scrollbar { width: 8px; }
    .md-card-body::-webkit-scrollbar-track { background: transparent; }
    .md-card-body::-webkit-scrollbar-thumb { background: #464647; border-radius: 4px; }

    .md-card-body h1 {
      font-size: 1.5em;
      color: var(--vs-text, #cccccc);
      border-bottom: 1px solid var(--vs-border, #3e3e42);
      padding-bottom: 8px;
      margin: 0 0 16px;
      font-weight: 600;
    }
    .md-card-body h2 {
      font-size: 1.2em;
      color: var(--vs-teal, #4ec9b0);
      margin: 20px 0 8px;
      font-weight: 600;
    }
    .md-card-body h3 {
      font-size: 1.05em;
      color: var(--vs-text, #cccccc);
      margin: 16px 0 6px;
      font-weight: 600;
    }
    .md-card-body p { margin: 6px 0 10px; }
    .md-card-body hr {
      border: none;
      border-top: 1px solid var(--vs-border, #3e3e42);
      margin: 14px 0;
    }
    .md-card-body ul {
      padding-left: 22px;
      margin: 6px 0 10px;
    }
    .md-card-body li { margin-bottom: 4px; }
    .md-card-body a {
      color: var(--vs-accent, #007acc);
      text-decoration: none;
    }
    .md-card-body a:hover { text-decoration: underline; }
    .md-card-body code {
      background: rgba(255,255,255,0.08);
      padding: 2px 5px;
      border-radius: 3px;
      font-family: 'Consolas', monospace;
      font-size: 0.88em;
    }
    .md-card-body strong { color: #dcdcaa; font-weight: 600; }
    .md-card-body em { color: var(--vs-string, #ce9178); font-style: italic; }
  `]
})
export class MarkdownCardComponent {
  private sanitizer = inject(DomSanitizer);

  @Input() filePath = '';
  @Input() loading = false;
  @Input() set content(v: string) {
    this.html = this.sanitizer.bypassSecurityTrustHtml(this.parse(v));
  }
  @Output() closed = new EventEmitter<void>();

  html: SafeHtml = '';

  get fileName(): string {
    return this.filePath.split('/').pop() || this.filePath;
  }

  private parse(md: string): string {
    if (!md) return '';
    const lines = md.split('\n');
    const out: string[] = [];
    let inList = false;

    for (const raw of lines) {
      const line = raw.trimEnd();
      if (line.startsWith('### ')) {
        if (inList) { out.push('</ul>'); inList = false; }
        out.push(`<h3>${this.fmt(line.slice(4))}</h3>`);
      } else if (line.startsWith('## ')) {
        if (inList) { out.push('</ul>'); inList = false; }
        out.push(`<h2>${this.fmt(line.slice(3))}</h2>`);
      } else if (line.startsWith('# ')) {
        if (inList) { out.push('</ul>'); inList = false; }
        out.push(`<h1>${this.fmt(line.slice(2))}</h1>`);
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        if (!inList) { out.push('<ul>'); inList = true; }
        out.push(`<li>${this.fmt(line.slice(2))}</li>`);
      } else if (line.trim() === '---') {
        if (inList) { out.push('</ul>'); inList = false; }
        out.push('<hr>');
      } else if (line.trim() === '') {
        if (inList) { out.push('</ul>'); inList = false; }
      } else {
        if (inList) { out.push('</ul>'); inList = false; }
        out.push(`<p>${this.fmt(line)}</p>`);
      }
    }

    if (inList) out.push('</ul>');
    return out.join('\n');
  }

  private fmt(t: string): string {
    return t
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  }
}
