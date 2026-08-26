import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangelogService } from '../../core/services/changelog.service';
import { TabStateService } from '../../core/services/tab-state.service';
import { FeedItem } from '../../core/models/changelog.model';

@Component({
  selector: 'app-source-control',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="source-control-container">
      <!-- Header -->
      <div class="sc-header">
        <div class="header-content">
          <span class="header-title">📰 HABER AKIŞI</span>
          <span class="badge">{{ changelogService.feedItems().length }}</span>
        </div>
        <button class="refresh-btn" (click)="refreshFeed()" title="Yenile">
          🔄
        </button>
      </div>

      <!-- Feed Items -->
      <div class="feed-list">
        @if (changelogService.isLoading()) {
          <div class="loading">
            <span>Yükleniyor...</span>
          </div>
        } @else if (changelogService.feedItems().length === 0) {
          <div class="empty-state">
            <div class="empty-icon">📭</div>
            <div class="empty-text">Haber bulunmamaktadır</div>
          </div>
        } @else {
          @for (item of changelogService.feedItems(); track item.id; let last = $last) {
            <div class="feed-item" (click)="openFeedFile(item)">
              <!-- Timeline -->
              <div class="timeline">
                <div class="node"></div>
                @if (!last) {
                  <div class="line"></div>
                }
              </div>

              <!-- Content -->
              <div class="item-content">
                <div class="item-header">
                  <span class="commit-hash">{{ item.hash }}</span>
                  <span class="item-type" [class]="'type-' + item.type">
                    {{ getTypeLabel(item.type) }}
                  </span>
                </div>

                <div class="item-title">{{ item.title }}</div>

                <div class="item-description">{{ item.description }}</div>

                <div class="item-footer">
                  <span class="author">{{ item.author }}</span>
                  <span class="date">{{ formatDate(item.date) }}</span>
                </div>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .source-control-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: #252526;
      color: #cccccc;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .sc-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid #3e3e42;
      background: #252526;
      flex-shrink: 0;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .header-title {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #cccccc;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 20px;
      height: 20px;
      padding: 0 6px;
      background: #007acc;
      color: white;
      font-size: 11px;
      font-weight: 600;
      border-radius: 10px;
    }

    .refresh-btn {
      background: none;
      border: none;
      color: #cccccc;
      font-size: 14px;
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 3px;
      transition: background 0.2s ease;
    }

    .refresh-btn:hover {
      background: #3e3e42;
    }

    .feed-list {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 12px 0;
    }

    .feed-list::-webkit-scrollbar {
      width: 12px;
    }

    .feed-list::-webkit-scrollbar-track {
      background: transparent;
    }

    .feed-list::-webkit-scrollbar-thumb {
      background: #464647;
      border-radius: 6px;
    }

    .feed-list::-webkit-scrollbar-thumb:hover {
      background: #535354;
    }

    .loading, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px 16px;
      color: #858585;
      text-align: center;
    }

    .empty-icon {
      font-size: 32px;
      margin-bottom: 8px;
    }

    .empty-text {
      font-size: 12px;
    }

    .feed-item {
      display: flex;
      gap: 12px;
      padding: 12px 16px;
      cursor: pointer;
      transition: background 0.2s ease;
      border-left: 2px solid transparent;
    }

    .feed-item:hover {
      background: #2d2d30;
      border-left-color: #007acc;
    }

    .timeline {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 24px;
      padding-top: 2px;
    }

    .node {
      width: 10px;
      height: 10px;
      background: #4ec9b0;
      border: 2px solid #252526;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .line {
      width: 2px;
      flex: 1;
      background: #3e3e42;
      margin: 4px 0;
      min-height: 20px;
    }

    .item-content {
      flex: 1;
      min-width: 0;
    }

    .item-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }

    .commit-hash {
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 11px;
      color: #4ec9b0;
      font-weight: 600;
    }

    .item-type {
      display: inline-block;
      padding: 2px 6px;
      font-size: 10px;
      font-weight: 600;
      border-radius: 3px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .type-blog {
      background: #d7ba7d;
      color: #1e1e1e;
    }

    .type-project {
      background: #4ec9b0;
      color: #1e1e1e;
    }

    .type-update {
      background: #569cd6;
      color: white;
    }

    .type-milestone {
      background: #c586c0;
      color: white;
    }

    .item-title {
      font-size: 13px;
      font-weight: 600;
      color: #cccccc;
      margin-bottom: 4px;
      word-break: break-word;
    }

    .item-description {
      font-size: 12px;
      color: #a0a0a0;
      line-height: 1.4;
      margin-bottom: 8px;
      word-break: break-word;
    }

    .item-footer {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 11px;
      color: #858585;
    }

    .author, .date {
      display: flex;
      align-items: center;
    }

    .author::before {
      content: '👤';
      margin-right: 4px;
    }

    .date::before {
      content: '📅';
      margin-right: 4px;
    }
  `]
})
export class SourceControlComponent {
  changelogService = inject(ChangelogService);
  private tabService = inject(TabStateService);

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      blog: '📝 Blog',
      project: '🚀 Proje',
      update: '✨ Güncelleme',
      milestone: '🎯 Dönüm Noktası'
    };
    return labels[type] || type;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    const day = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year} ${hours}:${minutes}`;
  }

  openFeedFile(item: FeedItem): void {
    const filename = item.targetPath.split('/').pop()?.split('.')[0] || 'file';
    const tabId = `${filename}-${Date.now()}`;

    this.tabService.addTab({
      id: tabId,
      name: item.title,
      path: item.targetPath,
      type: item.targetPath.endsWith('.md') ? 'markdown' : 'config',
      isActive: true
    });
  }

  refreshFeed(): void {
    this.changelogService.reload();
  }
}
