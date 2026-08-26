import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabStateService } from '../../core/services/tab-state.service';

@Component({
  selector: 'app-status-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="status-bar">
      <!-- Left Section -->
      <div class="status-section left">
        <!-- Branch Info -->
        <div class="status-item">
          <span class="icon">⎇</span>
          <span class="text">main</span>
        </div>

        <!-- File Info -->
        @if (activeTab() === null) {
          <div class="status-item">
            <span class="text">No file selected</span>
          </div>
        } @else {
          <div class="status-item">
            <span class="text">{{ activeTab()?.name }} • Line 1, Col 1</span>
          </div>
        }
      </div>

      <!-- Center Section -->
      <div class="status-section center">
        <span class="status-text">👋 Angular 21 Portfolio • VS Code Theme</span>
      </div>

      <!-- Right Section -->
      <div class="status-section right">
        <!-- Language Mode -->
        @if (activeTab()) {
          <div class="status-item">
            <span class="text">{{ getLanguageMode(activeTab()?.type) }}</span>
          </div>
        }

        <!-- Encoding -->
        <div class="status-item">
          <span class="text">UTF-8</span>
        </div>

        <!-- Line Endings -->
        <div class="status-item">
          <span class="text">LF</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .status-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 24px;
      background: #007acc;
      color: #ffffff;
      padding: 0;
      font-size: 12px;
      user-select: none;
      border-top: 1px solid #3e3e42;
    }

    .status-section {
      display: flex;
      align-items: center;
      gap: 0;
    }

    .status-section.left {
      flex: 0 1 auto;
      padding-left: 8px;
    }

    .status-section.center {
      flex: 1;
      justify-content: center;
      padding: 0 8px;
    }

    .status-section.right {
      flex: 0 1 auto;
      padding-right: 8px;
    }

    .status-item {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 0 8px;
      height: 24px;
      cursor: pointer;
      border-right: 1px solid rgba(255, 255, 255, 0.1);
      white-space: nowrap;
      transition: background 0.2s ease;
    }

    .status-item:last-child {
      border-right: none;
    }

    .status-item:hover {
      background: rgba(0, 0, 0, 0.15);
    }

    .status-item:active {
      background: rgba(0, 0, 0, 0.2);
    }

    .icon {
      font-size: 11px;
      opacity: 0.9;
    }

    .text {
      font-weight: 500;
      letter-spacing: 0.3px;
    }

    .status-text {
      font-size: 11px;
      opacity: 0.95;
    }
  `]
})
export class StatusBarComponent {
  private tabService = inject(TabStateService);

  activeTab = this.tabService.activeTab$;

  getLanguageMode(type?: 'markdown' | 'json' | 'config'): string {
    switch (type) {
      case 'markdown':
        return 'Markdown';
      case 'json':
        return 'JSON';
      default:
        return 'Plaintext';
    }
  }
}
