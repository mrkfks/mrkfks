import { Component, Output, EventEmitter, Input } from '@angular/core';

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
          title="Search">
          🔍
        </button>
        <button 
          class="icon-btn" 
          [class.active]="activeView === 'scm'"
          (click)="selectView('scm')"
          title="Source Control">
          🌿
        </button>
      </div>
      <div class="bottom-icons">
        <button class="icon-btn" title="Settings">⚙️</button>
      </div>
    </div>
  `,
  styleUrls: ['./activity-bar.css']
})
export class ActivityBarComponent {
  @Input() activeView: 'explorer' | 'search' | 'scm' = 'explorer';
  @Output() viewChange = new EventEmitter<'explorer' | 'search' | 'scm'>();

  selectView(view: 'explorer' | 'search' | 'scm') {
    this.viewChange.emit(view);
  }
}
