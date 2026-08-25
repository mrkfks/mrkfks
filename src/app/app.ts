import { Component, signal, inject, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TitleBarComponent } from './layout/title-bar/title-bar';
import { ActivityBarComponent } from './layout/activity-bar/activity-bar';
import { SidebarComponent } from './layout/sidebar/sidebar';
import { EditorComponent } from './layout/editor-area/editor-area';
import { StatusBarComponent } from './layout/status-bar/status-bar';
import { SearchPanelComponent } from './layout/search-panel/search-panel';
import { SourceControlComponent } from './layout/source-control/source-control';

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
    SourceControlComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  private http = inject(HttpClient);

  @ViewChild(SidebarComponent) sidebar!: SidebarComponent;

  activeView = signal<'explorer' | 'search'>('explorer');
  selectedFilePath = signal<string>('');
  selectedFileContent = signal<string>('');

  // Dosya seçildiğinde çalışır - API'den içeriği getir
  onFileSelect(path: string) {
    this.selectedFilePath.set(path);
    this.http.get<any>(`/api/files/content/${encodeURIComponent(path)}`).subscribe({
      next: (response) => {
        if (response.success) {
          this.selectedFileContent.set(response.data || '');
        }
      },
      error: (err) => {
        console.error('Error loading file:', err);
        this.selectedFileContent.set('');
      }
    });
  }

  // View switch
  switchView(view: 'explorer' | 'search') {
    this.activeView.set(view);
  }
}