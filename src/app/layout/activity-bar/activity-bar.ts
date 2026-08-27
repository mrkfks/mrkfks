import { Component, Output, EventEmitter, Input } from '@angular/core';

export type ActiveView = 'explorer' | 'search' | 'news' | 'settings';

@Component({
  selector: 'app-activity-bar',
  standalone: true,
  template: `
    <div class="activitybar">
      <div class="top-icons">
        <button
          class="icon-btn"
          [class.active]="activeView === 'explorer' && sidebarOpen"
          (click)="selectView('explorer')"
          title="Explorer">
          📄
        </button>
        <button
          class="icon-btn"
          [class.active]="activeView === 'search' && sidebarOpen"
          (click)="selectView('search')"
          title="Ara">
          🔍
        </button>
        <button
          class="icon-btn"
          [class.active]="activeView === 'news' && sidebarOpen"
          (click)="selectView('news')"
          title="Haber Akışı / Git Timeline">
          📰
        </button>
      </div>
      <div class="bottom-icons">
        <button
          class="icon-btn"
          [class.active]="activeView === 'settings' && sidebarOpen"
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
  @Input() sidebarOpen = true;
  @Output() viewChange = new EventEmitter<ActiveView>();

  selectView(view: ActiveView): void {
    this.viewChange.emit(view);
  }
}

