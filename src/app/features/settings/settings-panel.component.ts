import { Component, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService, Theme } from '../../core/services/settings.service';

@Component({
  selector: 'app-settings-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="settings-panel">
      <div class="settings-header">AYARLAR</div>

      <!-- Theme -->
      <div class="settings-section">
        <div class="settings-section-title">Renk Teması</div>
        <div class="theme-options">
          @for (t of themes; track t.id) {
            <button
              class="theme-btn"
              [class.active]="settings.theme() === t.id"
              (click)="settings.setTheme(t.id)">
              <span class="theme-dot" [style.background]="t.accent"></span>
              <div class="theme-label-group">
                <span class="theme-name">{{ t.label }}</span>
                <span class="theme-desc">{{ t.desc }}</span>
              </div>
              @if (settings.theme() === t.id) {
                <span class="theme-check">✓</span>
              }
            </button>
          }
        </div>
      </div>

      <!-- Font Size -->
      <div class="settings-section">
        <div class="settings-section-title">
          Yazı Boyutu
          <span class="settings-value">{{ settings.fontSize() }}px</span>
        </div>
        <div class="font-size-controls">
          <button class="font-btn" (click)="settings.setFontSize(settings.fontSize() - 1)"
            [disabled]="settings.fontSize() <= 11">−</button>
          <input
            type="range" min="11" max="18" step="1"
            class="font-slider"
            [value]="settings.fontSize()"
            (input)="settings.setFontSize(+$any($event.target).value)">
          <button class="font-btn" (click)="settings.setFontSize(settings.fontSize() + 1)"
            [disabled]="settings.fontSize() >= 18">+</button>
        </div>
        <div class="font-preview" [style.font-size]="settings.fontSize() + 'px'">
          <span class="preview-keyword">const</span>
          <span class="preview-var"> greeting</span>
          <span class="preview-op"> = </span>
          <span class="preview-string">"Merhaba Dünya"</span>
          <span class="preview-op">;</span>
        </div>
      </div>

      <!-- About -->
      <div class="settings-section">
        <div class="settings-section-title">Hakkında</div>
        <div class="about-card">
          <div class="about-row">
            <span class="about-key">Versiyon</span>
            <span class="about-val">v2.0.0</span>
          </div>
          <div class="about-row">
            <span class="about-key">Framework</span>
            <span class="about-val">Angular 21+ (Standalone)</span>
          </div>
          <div class="about-row">
            <span class="about-key">Mimari</span>
            <span class="about-val">Signals · SSR Ready</span>
          </div>
          <div class="about-row">
            <span class="about-key">Deploy</span>
            <span class="about-val">GitHub Pages</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      width: 100%;
      flex-shrink: 0;
      display: block;
      height: 100%;
    }
    .settings-panel {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--vs-panel, #252526);
      color: var(--vs-text, #cccccc);
      font-family: 'Segoe UI', Tahoma, sans-serif;
      font-size: var(--vs-font-size, 13px);
      overflow-y: auto;
    }
    .settings-panel::-webkit-scrollbar { width: 8px; }
    .settings-panel::-webkit-scrollbar-track { background: transparent; }
    .settings-panel::-webkit-scrollbar-thumb { background: #464647; border-radius: 4px; }

    .settings-header {
      padding: 10px 16px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.8px;
      color: var(--vs-muted, #858585);
      border-bottom: 1px solid var(--vs-border, #2b2b2b);
      text-transform: uppercase;
      flex-shrink: 0;
    }

    .settings-section {
      padding: 16px;
      border-bottom: 1px solid var(--vs-border, #2b2b2b);
    }

    .settings-section-title {
      font-size: 11px;
      font-weight: 600;
      color: var(--vs-muted, #858585);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .settings-value {
      font-weight: 700;
      color: var(--vs-accent, #007acc);
      font-size: 12px;
    }

    /* Theme Buttons */
    .theme-options {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .theme-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      background: rgba(255,255,255,0.03);
      border: 1px solid var(--vs-border, #3e3e42);
      border-radius: 4px;
      color: var(--vs-text, #cccccc);
      cursor: pointer;
      text-align: left;
      transition: all 0.15s;
      width: 100%;
    }
    .theme-btn:hover {
      background: var(--vs-hover, #2d2d30);
      border-color: var(--vs-muted, #555);
    }
    .theme-btn.active {
      border-color: var(--vs-accent, #007acc);
      background: rgba(0, 122, 204, 0.1);
    }
    .theme-dot {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      flex-shrink: 0;
      border: 2px solid rgba(255,255,255,0.2);
    }
    .theme-label-group { flex: 1; }
    .theme-name { display: block; font-size: 13px; font-weight: 500; }
    .theme-desc { display: block; font-size: 11px; color: var(--vs-muted, #858585); margin-top: 1px; }
    .theme-check { color: var(--vs-accent, #007acc); font-size: 14px; font-weight: 700; }

    /* Font Size */
    .font-size-controls {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
    }
    .font-btn {
      width: 28px;
      height: 28px;
      background: var(--vs-hover, #2d2d30);
      border: 1px solid var(--vs-border, #3e3e42);
      border-radius: 3px;
      color: var(--vs-text, #cccccc);
      font-size: 18px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
      flex-shrink: 0;
    }
    .font-btn:hover:not(:disabled) { border-color: var(--vs-accent, #007acc); color: var(--vs-accent, #007acc); }
    .font-btn:disabled { opacity: 0.3; cursor: not-allowed; }
    .font-slider {
      flex: 1;
      accent-color: var(--vs-accent, #007acc);
      cursor: pointer;
    }

    .font-preview {
      padding: 8px 12px;
      background: var(--vs-bg, #1e1e1e);
      border: 1px solid var(--vs-border, #2b2b2b);
      border-radius: 3px;
      font-family: 'Consolas', monospace;
      line-height: 1.5;
    }
    .preview-keyword { color: var(--vs-keyword, #569cd6); }
    .preview-var { color: #9cdcfe; }
    .preview-op { color: var(--vs-text, #cccccc); }
    .preview-string { color: var(--vs-string, #ce9178); }

    /* About */
    .about-card {
      background: rgba(255,255,255,0.03);
      border: 1px solid var(--vs-border, #2b2b2b);
      border-radius: 4px;
      overflow: hidden;
    }
    .about-row {
      display: flex;
      padding: 7px 12px;
      border-bottom: 1px solid var(--vs-border, #2b2b2b);
      gap: 12px;
    }
    .about-row:last-child { border-bottom: none; }
    .about-key {
      font-size: 11px;
      color: var(--vs-muted, #858585);
      min-width: 80px;
      flex-shrink: 0;
    }
    .about-val {
      font-size: 11px;
      color: var(--vs-teal, #4ec9b0);
      font-family: 'Consolas', monospace;
    }
  `]
})
export class SettingsPanelComponent {
  settings = inject(SettingsService);

  themes: { id: Theme; label: string; desc: string; accent: string }[] = [
    { id: 'dark-plus', label: 'Dark+ (Default Dark)', desc: 'VS Code varsayılan koyu tema', accent: '#007acc' },
    { id: 'monokai',   label: 'Monokai',              desc: 'Klasik editör renk teması',   accent: '#a6e22e' }
  ];
}
