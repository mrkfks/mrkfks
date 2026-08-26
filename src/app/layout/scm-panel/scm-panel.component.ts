import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ScmChange {
  id: string;
  name: string;
  path: string;
  status: 'added' | 'modified' | 'deleted';
  icon: string;
}

@Component({
  selector: 'app-scm-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="scm-container">
      <!-- SCM Header -->
      <div class="scm-header">
        <h2>🌿 SOURCE CONTROL</h2>
        <span class="branch-name">{{ currentBranch() }}</span>
      </div>

      <!-- Commit Section -->
      <div class="commit-section">
        <textarea 
          class="commit-message"
          [(ngModel)]="commitMessage"
          placeholder="Commit message..."
          (keyup.enter)="onCommit()">
        </textarea>
        
        <div class="commit-actions">
          <button class="btn-commit" (click)="onCommit()" [disabled]="!commitMessage.trim()">
            ✓ Commit
          </button>
          <button class="btn-discard" (click)="onDiscardAll()">
            ✕ Discard
          </button>
        </div>
      </div>

      <!-- Changes Section -->
      <div class="changes-section">
        <div class="section-title">
          <span>📝 Changes ({{ changes().length }})</span>
        </div>

        @if (changes().length === 0) {
          <div class="empty-state">
            <p>No changes to commit</p>
            <small>Everything is synchronized</small>
          </div>
        } @else {
          <div class="changes-list">
            @for (change of changes(); track change.id) {
              <div class="change-item" [class]="'status-' + change.status">
                <span class="change-icon">{{ change.icon }}</span>
                <span class="change-name">{{ change.name }}</span>
                <span class="change-status">{{ change.status }}</span>
                <button class="btn-revert" (click)="onDiscardChange(change.id)" title="Discard">
                  ✕
                </button>
              </div>
            }
          </div>
        }
      </div>

      <!-- Untracked Files Section -->
      <div class="untracked-section">
        <div class="section-title">
          <span>❓ Untracked ({{ untrackedFiles().length }})</span>
        </div>

        @if (untrackedFiles().length === 0) {
          <div class="empty-state">
            <p>No untracked files</p>
          </div>
        } @else {
          <div class="untracked-list">
            @for (file of untrackedFiles(); track file.id) {
              <div class="untracked-item">
                <span class="file-icon">📄</span>
                <span class="file-name">{{ file.name }}</span>
                <button class="btn-stage" (click)="onStageFile(file.id)" title="Stage">
                  +
                </button>
              </div>
            }
          </div>
        }
      </div>

      <!-- Git Info -->
      <div class="git-info">
        <small>{{ gitStatus }}</small>
      </div>
    </div>
  `,
  styles: [`
    .scm-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: #252526;
      color: #cccccc;
      overflow-y: auto;
    }

    .scm-header {
      padding: 12px 16px;
      border-bottom: 1px solid #3e3e42;
      user-select: none;
    }

    .scm-header h2 {
      margin: 0 0 8px 0;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #cccccc;
    }

    .branch-name {
      font-size: 11px;
      color: #858585;
      display: block;
    }

    .commit-section {
      padding: 12px;
      border-bottom: 1px solid #3e3e42;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .commit-message {
      background: #1e1e1e;
      border: 1px solid #3e3e42;
      color: #cccccc;
      padding: 8px;
      border-radius: 3px;
      font-size: 12px;
      font-family: Consolas, Monaco, monospace;
      resize: vertical;
      min-height: 60px;
      max-height: 100px;
    }

    .commit-message::placeholder {
      color: #858585;
    }

    .commit-message:focus {
      outline: none;
      border-color: #007acc;
      box-shadow: 0 0 0 1px #007acc40;
    }

    .commit-actions {
      display: flex;
      gap: 8px;
    }

    .btn-commit,
    .btn-discard {
      flex: 1;
      padding: 6px 12px;
      border: none;
      border-radius: 3px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .btn-commit {
      background: #007acc;
      color: white;
    }

    .btn-commit:hover:not(:disabled) {
      background: #005a9e;
    }

    .btn-commit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-discard {
      background: #3e3e42;
      color: #cccccc;
    }

    .btn-discard:hover {
      background: #464647;
    }

    .changes-section,
    .untracked-section {
      flex: 1;
      overflow-y: auto;
      border-bottom: 1px solid #3e3e42;
    }

    .section-title {
      position: sticky;
      top: 0;
      padding: 8px 12px;
      background: #1e1e1e;
      border-bottom: 1px solid #3e3e42;
      font-size: 11px;
      font-weight: 600;
      color: #cccccc;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      user-select: none;
    }

    .empty-state {
      padding: 16px 12px;
      text-align: center;
      color: #858585;
      font-size: 12px;
    }

    .empty-state p {
      margin: 0 0 4px 0;
    }

    .empty-state small {
      display: block;
      font-size: 11px;
      color: #6e6e6e;
    }

    .changes-list,
    .untracked-list {
      padding: 4px 0;
    }

    .change-item,
    .untracked-item {
      display: flex;
      align-items: center;
      padding: 4px 8px;
      height: 28px;
      cursor: pointer;
      gap: 6px;
      border-left: 2px solid transparent;
    }

    .change-item:hover {
      background: #2d2d30;
    }

    .change-item.status-modified {
      border-left-color: #d4af37;
    }

    .change-item.status-added {
      border-left-color: #7fb069;
    }

    .change-item.status-deleted {
      border-left-color: #d16969;
    }

    .change-icon,
    .file-icon {
      flex-shrink: 0;
      font-size: 14px;
    }

    .change-name,
    .file-name {
      flex: 1;
      font-size: 12px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .change-status {
      font-size: 11px;
      color: #858585;
      flex-shrink: 0;
      padding: 0 4px;
    }

    .btn-revert,
    .btn-stage {
      background: none;
      border: none;
      color: #858585;
      cursor: pointer;
      padding: 2px 4px;
      font-size: 12px;
      opacity: 0;
      transition: opacity 0.2s ease, color 0.2s ease;
    }

    .change-item:hover .btn-revert,
    .untracked-item:hover .btn-stage {
      opacity: 1;
    }

    .btn-revert:hover,
    .btn-stage:hover {
      color: #cccccc;
    }

    .untracked-item {
      border-left-color: #d4af37;
    }

    .git-info {
      padding: 8px 12px;
      border-top: 1px solid #3e3e42;
      font-size: 11px;
      color: #6e6e6e;
      background: #1e1e1e;
      user-select: none;
    }

    ::-webkit-scrollbar {
      width: 12px;
    }

    ::-webkit-scrollbar-track {
      background: transparent;
    }

    ::-webkit-scrollbar-thumb {
      background: #464647;
      border-radius: 6px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: #535354;
    }
  `]
})
export class ScmPanelComponent implements OnInit {
  currentBranch = signal('main');
  commitMessage = '';
  gitStatus = 'All changes committed';

  changes = signal<ScmChange[]>([]);
  untrackedFiles = signal<ScmChange[]>([]);

  ngOnInit() {
    this.loadScmState();
  }

  private loadScmState(): void {
    // Mock data - in production, get from git API
    this.changes.set([
      {
        id: 'tab-state-1',
        name: 'tab-state.service.ts',
        path: 'src/app/core/services/tab-state.service.ts',
        status: 'modified',
        icon: '📝'
      },
      {
        id: 'editor-area-1',
        name: 'editor-area.ts',
        path: 'src/app/layout/editor-area/editor-area.ts',
        status: 'modified',
        icon: '📝'
      },
      {
        id: 'app-ts-1',
        name: 'app.ts',
        path: 'src/app/app.ts',
        status: 'modified',
        icon: '📝'
      }
    ]);

    this.untrackedFiles.set([
      {
        id: 'content-service-1',
        name: 'content.service.ts',
        path: 'src/app/core/services/content.service.ts',
        status: 'added',
        icon: '📄'
      }
    ]);

    this.updateGitStatus();
  }

  onCommit(): void {
    if (!this.commitMessage.trim()) return;

    console.log('Commit:', this.commitMessage);
    this.commitMessage = '';
    this.changes.set([]);
    this.untrackedFiles.set([]);
    this.gitStatus = 'All changes committed';
  }

  onDiscardChange(id: string): void {
    const updated = this.changes().filter(c => c.id !== id);
    this.changes.set(updated);
    this.updateGitStatus();
  }

  onDiscardAll(): void {
    this.changes.set([]);
    this.updateGitStatus();
  }

  onStageFile(id: string): void {
    const file = this.untrackedFiles().find(f => f.id === id);
    if (file) {
      const updated = this.untrackedFiles().filter(f => f.id !== id);
      this.untrackedFiles.set(updated);

      const changedFile: ScmChange = { ...file, status: 'added' };
      this.changes.set([...this.changes(), changedFile]);
      this.updateGitStatus();
    }
  }

  private updateGitStatus(): void {
    const totalChanges = this.changes().length + this.untrackedFiles().length;
    if (totalChanges === 0) {
      this.gitStatus = 'All changes committed';
    } else {
      this.gitStatus = `${totalChanges} change${totalChanges > 1 ? 's' : ''} to commit`;
    }
  }
}
