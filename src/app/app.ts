import { Component } from '@angular/core';
import { ActivityBarComponent } from './layout/activity-bar/activity-bar';
import { SidebarComponent } from './layout/sidebar/sidebar';
import { TitleBarComponent } from './layout/title-bar/title-bar';
import { StatusBarComponent } from './layout/status-bar/status-bar';
import { EditorAreaComponent } from './layout/editor-area/editor-area';

@Component({

  selector: 'app-root',
  standalone: true,
  imports: [
    ActivityBarComponent,
    SidebarComponent,
    TitleBarComponent,
    StatusBarComponent,
    EditorAreaComponent,
  ],
  template: `
  <div class="vscode-layout">
      <app-title-bar />
      <div class="vscode-main-body">
        <app-activity-bar />
        <app-sidebar />
        <app-editor-area />
      </div>
      <app-status-bar />
    </div>
  `

})
export class App {}
