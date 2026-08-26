import { Component, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabStateService } from '../../core/services/tab-state.service';
import { computed } from '@angular/core';

@Component({
  selector: 'app-tab-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tab-bar">
      <!-- Tab List -->
      <div class="tab-list" #tabContainer>
        @for (tab of tabs$(); track tab.id) {
          <div class="tab" [class.active]="tab.isActive" (click)="selectTab(tab.id)">
            <!-- File Icon -->
            <span class="tab-icon">
              @switch(tab.type) {
                @case('markdown') {
                  📝
                }
                @case('json') {
                  ⚙️
                }
                @default {
                  📄
                }
              }
            </span>

            <!-- Tab Name -->
            <span class="tab-name">{{ tab.name }}</span>

            <!-- Dirty Indicator -->
            @if (tab.isDirty) {
              <span class="dirty-dot">●</span>
            }

            <!-- Close Button -->
            <button 
              class="tab-close"
              (click)="closeTab($event, tab.id)"
              title="Close (Ctrl+W)">
              ✕
            </button>
          </div>
        }
      </div>

      <!-- Tab Actions -->
      <div class="tab-actions">
        <button class="action-btn" title="New File">
          ➕
        </button>
        <button 
          class="action-btn"
          (click)="closeAllTabs()"
          title="Close All Tabs">
          🗑️
        </button>
      </div>
    </div>
  `,
  styles: [`
    .tab-bar {
      display: flex;
      align-items: center;
      height: 35px;
      background: #1e1e1e;
      border-bottom: 1px solid #3e3e42;
      gap: 0;
      overflow: hidden;
      user-select: none;
    }

    .tab-list {
      display: flex;
      flex: 1;
      overflow-x: auto;
      overflow-y: hidden;
      gap: 0;
      padding: 0;
      margin: 0;
    }

    .tab-list::-webkit-scrollbar {
      height: 8px;
    }

    .tab-list::-webkit-scrollbar-track {
      background: transparent;
    }

    .tab-list::-webkit-scrollbar-thumb {
      background: #464647;
      border-radius: 4px;
    }

    .tab-list::-webkit-scrollbar-thumb:hover {
      background: #535354;
    }

    .tab {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 0 12px;
      height: 35px;
      min-width: 120px;
      max-width: 200px;
      background: #2d2d30;
      border: 1px solid #3e3e42;
      border-bottom: none;
      border-right: 1px solid #3e3e42;
      color: #cccccc;
      cursor: pointer;
      font-size: 13px;
      position: relative;
      transition: all 0.2s ease;
    }

    .tab:hover {
      background: #3e3e42;
      color: #e0e0e0;
    }

    .tab.active {
      background: #1e1e1e;
      color: #ffffff;
      border-bottom: 2px solid #007acc;
      margin-bottom: -1px;
    }

    .tab-icon {
      flex-shrink: 0;
      font-size: 14px;
    }

    .tab-name {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .dirty-dot {
      flex-shrink: 0;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #007acc;
      font-size: 0;
    }

    .tab-close {
      flex-shrink: 0;
      width: 24px;
      height: 24px;
      padding: 0;
      background: transparent;
      border: none;
      color: #cccccc;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      transition: all 0.2s ease;
      opacity: 0;
    }

    .tab:hover .tab-close {
      opacity: 1;
    }

    .tab-close:hover {
      background: #3e3e42;
      color: #ffffff;
    }

    .tab-actions {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 0 8px;
      border-left: 1px solid #3e3e42;
      background: #1e1e1e;
      height: 35px;
    }

    .action-btn {
      width: 24px;
      height: 24px;
      padding: 0;
      background: transparent;
      border: none;
      color: #cccccc;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      transition: all 0.2s ease;
      border-radius: 2px;
    }

    .action-btn:hover {
      background: #3e3e42;
      color: #ffffff;
    }

    .action-btn:active {
      background: #404041;
    }
  `]
})
export class TabBarComponent {
  private tabService = inject(TabStateService);

  @ViewChild('tabContainer') tabContainer!: ElementRef;

  tabs$ = this.tabService.tabs$;

  selectTab(tabId: string): void {
    this.tabService.setActiveTab(tabId);
  }

  closeTab(event: Event, tabId: string): void {
    event.stopPropagation();
    this.tabService.closeTab(tabId);
  }

  closeAllTabs(): void {
    if (confirm('Close all tabs?')) {
      this.tabService.clearAllTabs();
    }
  }
}
