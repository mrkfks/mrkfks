import { Component, Output, EventEmitter, OnInit, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { SourceControlComponent } from '../../features/source-control/source-control.component';

export interface FileNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  isOpen?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, SourceControlComponent],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class SidebarComponent implements OnInit {
  @Output() fileSelect = new EventEmitter<string>();

  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  // Files Tab
  fileTree = signal<FileNode[]>([]);

  ngOnInit() {
    if (this.isBrowser) {
      this.loadFileTree();
    }
  }

  // FILES MANAGEMENT
  loadFileTree() {
    // GitHub Pages has no backend - using empty state
    // this.http.get<any>('/api/files').subscribe({
    //   next: (response) => {
    //     if (response.success) {
    //       this.fileTree.set(response.data || []);
    //     }
    //   },
    //   error: (err) => {
    //     console.error('Error loading file tree:', err);
    //     this.fileTree.set([]);
    //   }
    // });
    this.fileTree.set([]);
  }

  toggleFolder(node: FileNode) {
    if (node.type === 'folder') {
      node.isOpen = !node.isOpen;
      this.fileTree.set([...this.fileTree()]);
    }
  }

  selectFile(node: FileNode) {
    if (node.type === 'file') {
      this.fileSelect.emit(node.path);
    }
  }
}