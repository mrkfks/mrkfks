import { Injectable, inject, signal, effect, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'dark-plus' | 'monokai';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  theme = signal<Theme>('dark-plus');
  fontSize = signal<number>(13);

  constructor() {
    if (!this.isBrowser) return;
    this.loadFromStorage();
    effect(() => {
      this.applyToDOM();
      this.persist();
    });
  }

  setTheme(t: Theme): void { this.theme.set(t); }
  setFontSize(n: number): void { this.fontSize.set(Math.max(11, Math.min(18, n))); }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem('vsp-settings');
      if (raw) {
        const s = JSON.parse(raw);
        if (s.theme) this.theme.set(s.theme);
        if (s.fontSize) this.fontSize.set(s.fontSize);
      }
    } catch { /* corrupt storage */ }
    this.applyToDOM();
  }

  private persist(): void {
    try {
      localStorage.setItem('vsp-settings', JSON.stringify({
        theme: this.theme(),
        fontSize: this.fontSize()
      }));
    } catch { /* storage full */ }
  }

  applyToDOM(): void {
    if (!this.isBrowser) return;
    const r = document.documentElement;
    const mk = this.theme() === 'monokai';
    r.style.setProperty('--vs-bg',        mk ? '#272822' : '#1e1e1e');
    r.style.setProperty('--vs-panel',     mk ? '#383830' : '#252526');
    r.style.setProperty('--vs-text',      mk ? '#f8f8f2' : '#cccccc');
    r.style.setProperty('--vs-accent',    mk ? '#a6e22e' : '#007acc');
    r.style.setProperty('--vs-teal',      mk ? '#66d9e8' : '#4ec9b0');
    r.style.setProperty('--vs-border',    mk ? '#49483e' : '#2b2b2b');
    r.style.setProperty('--vs-muted',     mk ? '#75715e' : '#858585');
    r.style.setProperty('--vs-hover',     mk ? '#3e3d32' : '#2d2d30');
    r.style.setProperty('--vs-actbar',    mk ? '#2d2d2a' : '#333333');
    r.style.setProperty('--vs-string',    mk ? '#e6db74' : '#ce9178');
    r.style.setProperty('--vs-keyword',   mk ? '#f92672' : '#569cd6');
    r.style.setProperty('--vs-font-size', `${this.fontSize()}px`);
  }
}
