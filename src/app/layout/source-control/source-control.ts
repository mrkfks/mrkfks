import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface GitStatus {
  branch: string;
  staged: number;
  unstaged: number;
  untracked: number;
}

interface Comment {
  id: string;
  text: string;
  category: 'bug' | 'feature' | 'improvement' | 'note';
  timestamp: Date;
  isEditing?: boolean;
}

@Component({
  selector: 'app-source-control',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './source-control.html',
  styleUrl: './source-control.css'
})
export class SourceControlComponent {
  private http = inject(HttpClient);

  gitStatus = signal<GitStatus>({
    branch: 'main',
    staged: 0,
    unstaged: 0,
    untracked: 0
  });

  isLoading = signal(false);

  // Comment state
  comments = signal<Comment[]>([]);
  newCommentText = signal('');
  newCommentCategory = signal<'bug' | 'feature' | 'improvement' | 'note'>('note');
  editingCommentId = signal<string | null>(null);
  editingCommentText = signal('');

  constructor() {
    this.loadGitStatus();
    this.loadComments();
  }

  loadGitStatus() {
    this.isLoading.set(true);
    this.http.get<GitStatus>('/api/git-status').subscribe({
      next: (status) => {
        this.gitStatus.set(status);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load git status:', err);
        this.isLoading.set(false);
      }
    });
  }

  loadComments() {
    // Load from localStorage
    const stored = localStorage.getItem('source-control-comments');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.comments.set(parsed.map((c: any) => ({
          ...c,
          timestamp: new Date(c.timestamp)
        })));
      } catch (e) {
        console.error('Failed to load comments:', e);
      }
    }
  }

  saveComments() {
    localStorage.setItem('source-control-comments', JSON.stringify(this.comments()));
  }

  addComment() {
    if (!this.newCommentText().trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      text: this.newCommentText(),
      category: this.newCommentCategory(),
      timestamp: new Date()
    };

    this.comments.set([comment, ...this.comments()]);
    this.newCommentText.set('');
    this.newCommentCategory.set('note');
    this.saveComments();
  }

  deleteComment(id: string) {
    this.comments.set(this.comments().filter(c => c.id !== id));
    this.saveComments();
  }

  startEditing(comment: Comment) {
    this.editingCommentId.set(comment.id);
    this.editingCommentText.set(comment.text);
  }

  cancelEditing() {
    this.editingCommentId.set(null);
    this.editingCommentText.set('');
  }

  saveEditing(id: string) {
    if (!this.editingCommentText().trim()) return;

    this.comments.set(this.comments().map(c =>
      c.id === id ? { ...c, text: this.editingCommentText() } : c
    ));
    this.editingCommentId.set(null);
    this.editingCommentText.set('');
    this.saveComments();
  }

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'bug': '#f48771',
      'feature': '#4ec9b0',
      'improvement': '#d7ba7d',
      'note': '#9cdcfe'
    };
    return colors[category] || '#9cdcfe';
  }

  getCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
      'bug': 'Bug',
      'feature': 'Feature',
      'improvement': 'Improvement',
      'note': 'Note'
    };
    return labels[category] || 'Note';
  }

  formatTime(date: Date): string {
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  refreshStatus() {
    this.loadGitStatus();
  }
}
