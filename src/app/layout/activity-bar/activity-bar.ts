import { Component, Output, EventEmitter, Input } from '@angular/core';

export type ActiveView = 'explorer' | 'search' | 'news' | 'settings' | 'chat';

@Component({
  selector: 'app-activity-bar',
  standalone: true,
  template: `
    <div class="activitybar">
      <div class="top-icons">
        <button
          class="icon-btn"
          [class.active]="activeView === 'explorer'"
          (click)="selectView('explorer')"
          title="Explorer">
          📄
        </button>
        <button
          class="icon-btn"
          [class.active]="activeView === 'search'"
          (click)="selectView('search')"
          title="Ara">
          🔍
        </button>
        <button
          class="icon-btn"
          [class.active]="activeView === 'news'"
          (click)="selectView('news')"
          title="Haber Akışı / Git Timeline">
          📰
        </button>
        <button
          class="icon-btn"
          [class.active]="activeView === 'chat'"
          (click)="selectView('chat')"
          title="AI Copilot Chat">
          💬
        </button>
      </div>
      <div class="bottom-icons">
        <button
          class="icon-btn"
          [class.active]="activeView === 'settings'"
          (click)="selectView('settings')"
          title="Ayarlar">
          ⚙️
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./activity-bar.css']
})
export class ActivityBarComponent {
  @Input() activeView: ActiveView = 'explorer';
  @Output() viewChange = new EventEmitter<ActiveView>();

  selectView(view: ActiveView): void {
    this.viewChange.emit(view);
  }
}

