import { Component, signal, inject } from '@angular/core';
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
  private settingsService = inject(SettingsService); // initialize on startup
  tabService = inject(TabStateService);

  activeView = signal<ActiveView>('explorer');

  switchView(view: ActiveView): void {
    this.activeView.set(view);
  }
}
