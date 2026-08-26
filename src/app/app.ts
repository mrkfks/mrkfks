import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TitleBarComponent } from './layout/title-bar/title-bar';
import { ActivityBarComponent } from './layout/activity-bar/activity-bar';
import { SidebarComponent } from './layout/sidebar/sidebar';
import { StatusBarComponent } from './layout/status-bar/status-bar';
import { SearchPanelComponent } from './layout/search-panel/search-panel';
import { ChatWidgetComponent } from './features/chat/components/chat-widget.component';
import { TabStateService } from './core/services/tab-state.service';
import { SourceControlComponent } from './features/source-control/source-control.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    TitleBarComponent,
    ActivityBarComponent,
    SidebarComponent,
    SearchPanelComponent,
    StatusBarComponent,
    ChatWidgetComponent,
    SourceControlComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  activeView = signal<'explorer' | 'search' | 'news'>('explorer');
  
  switchView(view: 'explorer' | 'search' | 'news'): void {
    this.activeView.set(view);
  }
}
