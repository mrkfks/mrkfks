import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TitleBarComponent } from './layout/title-bar/title-bar';
import { ActivityBarComponent } from './layout/activity-bar/activity-bar';
import { SidebarComponent } from './layout/sidebar/sidebar';
import { EditorComponent } from './layout/editor-area/editor-area';
import { StatusBarComponent } from './layout/status-bar/status-bar';
import { SearchPanelComponent } from './layout/search-panel/search-panel';
import { ChatWidgetComponent } from './features/chat/components/chat-widget.component';
import { TabStateService } from './core/services/tab-state.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    TitleBarComponent,
    ActivityBarComponent,
    SidebarComponent,
    SearchPanelComponent,
    EditorComponent,
    StatusBarComponent,
    ChatWidgetComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  private tabService = inject(TabStateService);

  activeView = signal<'explorer' | 'search'>('explorer');

  // Computed: Get active tab content for editor
  activeTab = computed(() => this.tabService.activeTab$());
  
  switchView(view: 'explorer' | 'search'): void {
    this.activeView.set(view);
  }
}
