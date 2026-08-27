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
    ChatWidgetComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  private settingsService = inject(SettingsService); // initialize on startup

  activeView = signal<ActiveView>('explorer');
  chatOpen = signal(true);

  switchView(view: ActiveView): void {
    this.activeView.set(view);
  }

  toggleChat(): void {
    this.chatOpen.update(v => !v);
  }
}
