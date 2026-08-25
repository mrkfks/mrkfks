import { Component, Output, EventEmitter, OnInit, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';

export interface FileNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  isOpen?: boolean;
}

export interface Comment {
  id: string;
  text: string;
  category: 'bug' | 'feature' | 'improvement' | 'note';
  timestamp: Date;
  isEditing?: boolean;
}

export interface GitStatus {
  branch: string;
  staged: number;
  unstaged: number;
  untracked: number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  // Tabs
  activeTab = signal<'files' | 'source-control'>('files');

  // Source Control Tab
  comments = signal<Comment[]>([]);
  newCommentText = signal('');
  newCommentCategory = signal<'bug' | 'feature' | 'improvement' | 'note'>('note');
  editingCommentId = signal<string | null>(null);
  editingCommentText = signal('');
  gitStatus = signal<GitStatus>({ branch: 'main', staged: 0, unstaged: 0, untracked: 0 });
  isLoading = signal(false);

  ngOnInit() {
    if (this.isBrowser) {
      this.loadFileTree();
      this.loadComments();
      this.loadGitStatus();
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

  // SOURCE CONTROL MANAGEMENT
  loadComments() {
    if (!this.isBrowser) return;
    
    try {
      const stored = localStorage.getItem('comments');
      if (stored) {
        const parsed = JSON.parse(stored);
        const comments = parsed.map((c: any) => ({
          ...c,
          timestamp: new Date(c.timestamp)
        }));
        this.comments.set(comments);
      }
    } catch (err) {
      console.error('Error loading comments:', err);
    }
  }

  saveComments() {
    if (!this.isBrowser) return;
    localStorage.setItem('comments', JSON.stringify(this.comments()));
  }

  addComment() {
    const text = this.newCommentText().trim();
    if (!text) return;

    const newComment: Comment = {
      id: 'comment_' + Date.now(),
      text: text,
      category: this.newCommentCategory(),
      timestamp: new Date()
    };

    this.comments.set([newComment, ...this.comments()]);
    this.saveComments();
    this.newCommentText.set('');
  }

  startEditing(comment: Comment) {
    this.editingCommentId.set(comment.id);
    this.editingCommentText.set(comment.text);
  }

  saveEditing(id: string) {
    const text = this.editingCommentText().trim();
    if (!text) return;

    const comments = this.comments().map(c => 
      c.id === id ? { ...c, text: text } : c
    );
    this.comments.set(comments);
    this.saveComments();
    this.cancelEditing();
  }

  cancelEditing() {
    this.editingCommentId.set(null);
    this.editingCommentText.set('');
  }

  deleteComment(id: string) {
    this.comments.set(this.comments().filter(c => c.id !== id));
    this.saveComments();
  }

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      bug: '#f48771',
      feature: '#4ec9b0',
      improvement: '#d7ba7d',
      note: '#9cdcfe'
    };
    return colors[category] || '#9cdcfe';
  }

  getCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
      bug: 'Bug',
      feature: 'Feature',
      improvement: 'Improvement',
      note: 'Note'
    };
    return labels[category] || 'Note';
  }

  formatTime(date: Date): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  }

  loadGitStatus() {
    if (!this.isBrowser) return;
    
    // GitHub Pages has no backend - using empty git status
    this.isLoading.set(true);
    // this.http.get<GitStatus>('/api/git-status').subscribe({
    //   next: (data) => {
    //     this.gitStatus.set(data);
    //     this.isLoading.set(false);
    //   },
    //   error: (err) => {
    //     console.error('Failed to load git status:', err);
    //     this.isLoading.set(false);
    //   }
    // });
    this.gitStatus.set({
      branch: 'main',
      staged: 0,
      unstaged: 0,
      untracked: 0
    });
    this.isLoading.set(false);
  }

  switchTab(tab: 'files' | 'source-control') {
    this.activeTab.set(tab);
  }
}