import { Component, signal, inject, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TitleBarComponent } from './layout/title-bar/title-bar';
import { ActivityBarComponent, ActiveView } from './layout/activity-bar/activity-bar';
import { StatusBarComponent } from './layout/status-bar/status-bar';
import { SearchPanelComponent } from './layout/search-panel/search-panel';
import { ChatWidgetComponent } from './features/chat/components/chat-widget.component';
import { SourceControlComponent } from './features/source-control/source-control.component';
import { ExplorerPanelComponent } from './features/explorer/explorer-panel.component';
import { SettingsPanelComponent } from './features/settings/settings-panel.component';
import { SettingsService } from './core/services/settings.service';
import { TabStateService } from './core/services/tab-state.service';
import { MarkdownCardComponent } from './shared/components/markdown-card/markdown-card.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    TitleBarComponent,
    ActivityBarComponent,
    ExplorerPanelComponent,
    SearchPanelComponent,
    SourceControlComponent,
    SettingsPanelComponent,
    StatusBarComponent,
    ChatWidgetComponent,
    MarkdownCardComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  private settingsService = inject(SettingsService);
  tabService = inject(TabStateService);

  activeView = signal<ActiveView>('explorer');
  sidebarOpen = signal(true);
  isMobile = signal(window.innerWidth < 768);

  @HostListener('window:resize')
  onResize(): void {
    const mobile = window.innerWidth < 768;
    this.isMobile.set(mobile);
    if (!mobile) this.sidebarOpen.set(true);
  }

  switchView(view: ActiveView): void {
    if (this.isMobile()) {
      if (this.activeView() === view && this.sidebarOpen()) {
        this.sidebarOpen.set(false);
      } else {
        this.activeView.set(view);
        this.sidebarOpen.set(true);
      }
    } else {
      this.activeView.set(view);
    }
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }
}
