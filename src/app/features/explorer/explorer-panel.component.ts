import { Component, OnInit, inject, signal, computed, PLATFORM_ID, ViewEncapsulation } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ContentService } from '../../core/services/content.service';
import { TabStateService } from '../../core/services/tab-state.service';

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path?: string;
  isOpen?: boolean;
  children?: FileNode[];
}

interface FlatNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path?: string;
  depth: number;
  isOpen: boolean;
  hasChildren: boolean;
}

@Component({
  selector: 'app-explorer-panel',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="explorer-panel">
      <div class="ep-header">EXPLORER</div>

      <button class="ep-root-btn" (click)="rootOpen.set(!rootOpen())">
        <span class="ep-arrow" [class.open]="rootOpen()">›</span>
        <span class="ep-root-name">MRKFKS</span>
      </button>

      @if (rootOpen()) {
        <div class="ep-tree">
          @for (node of flatNodes(); track node.id) {
            @if (node.type === 'folder') {
              <button
                class="ep-node ep-folder-node"
                [style.padding-left.px]="node.depth * 12 + 8"
                (click)="toggleFolder(node.id)">
                <span class="ep-arrow" [class.open]="node.isOpen">›</span>
                <span class="ep-folder-icon">{{ node.isOpen ? '📂' : '📁' }}</span>
                <span class="ep-label">{{ node.name }}</span>
              </button>
            } @else {
              <button
                class="ep-node ep-file-node"
                [class.active]="tabService.activeTab$()?.path === node.path"
                [style.padding-left.px]="node.depth * 12 + 22"
                (click)="selectFile(node.path ?? '', node.name)">
                <span class="ep-ext-icon" [style.color]="fileIcon(node.name).color">
                  {{ fileIcon(node.name).label }}
                </span>
                <span class="ep-label">{{ node.name }}</span>
              </button>
            }
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      width: 100%;
      flex-shrink: 0;
      display: block;
      height: 100%;
    }
    .explorer-panel {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      background: var(--vs-panel, #252526);
      color: var(--vs-text, #cccccc);
      font-family: 'Segoe UI', Tahoma, sans-serif;
      font-size: var(--vs-font-size, 13px);
      overflow-y: auto;
      user-select: none;
    }
    .explorer-panel::-webkit-scrollbar { width: 8px; }
    .explorer-panel::-webkit-scrollbar-track { background: transparent; }
    .explorer-panel::-webkit-scrollbar-thumb { background: #464647; border-radius: 4px; }

    .ep-header {
      height: 35px;
      padding: 0 16px;
      display: flex;
      align-items: center;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.8px;
      color: var(--vs-muted, #858585);
      border-bottom: 1px solid var(--vs-border, #2b2b2b);
      flex-shrink: 0;
    }

    .ep-root-btn {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 5px 8px;
      background: none;
      border: none;
      color: var(--vs-text, #cccccc);
      cursor: pointer;
      text-align: left;
    }
    .ep-root-btn:hover { background: var(--vs-hover, #2d2d30); }

    .ep-root-name {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }

    .ep-tree {
      display: flex;
      flex-direction: column;
    }

    .ep-arrow {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 14px;
      font-size: 13px;
      color: var(--vs-muted, #858585);
      transition: transform 0.15s;
      transform: rotate(0deg);
      flex-shrink: 0;
    }
    .ep-arrow.open { transform: rotate(90deg); }

    .ep-node {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 5px;
      padding-top: 2px;
      padding-bottom: 2px;
      padding-right: 8px;
      background: none;
      border: none;
      color: var(--vs-text, #cccccc);
      cursor: pointer;
      text-align: left;
      white-space: nowrap;
      overflow: hidden;
    }
    .ep-node:hover { background: var(--vs-hover, #2d2d30); }
    .ep-node.active { background: #37373d; }

    .ep-folder-icon { font-size: 13px; flex-shrink: 0; }

    .ep-ext-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      font-size: 9px;
      font-weight: 700;
      font-family: 'Consolas', monospace;
      flex-shrink: 0;
    }

    .ep-label {
      font-size: 13px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    @media (max-width: 768px) {
      .ep-header { font-size: 12px; }
      .ep-label { font-size: 15px; }
      .ep-node { padding-top: 10px; padding-bottom: 10px; }
      .ep-folder-icon { font-size: 15px; }
    }
  `]
})
export class ExplorerPanelComponent implements OnInit {
  private contentService = inject(ContentService);
  tabService = inject(TabStateService);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private rawTree = signal<FileNode[]>([]);
  rootOpen = signal(true);
  flatNodes = computed(() => this.flatten(this.rawTree(), 0));

  ngOnInit(): void {
    if (this.isBrowser) {
      this.contentService.loadJson('manifest.json').subscribe({
        next: (data) => this.rawTree.set(data.tree ?? []),
        error: () => this.rawTree.set(this.fallbackTree())
      });
    }
  }

  toggleFolder(nodeId: string): void {
    this.rawTree.set(this.toggleNode(this.rawTree(), nodeId));
  }

  selectFile(path: string, name: string): void {
    if (!path) return;
    const ext = name.split('.').pop()?.toLowerCase();
    const type = ext === 'json' ? 'json' : 'markdown';
    this.tabService.addTab({ id: path, name, path, type, isActive: true });
  }

  fileIcon(name: string): { label: string; color: string } {
    const ext = name.split('.').pop()?.toLowerCase() ?? '';
    const map: Record<string, { label: string; color: string }> = {
      md:   { label: 'M↓', color: '#519aba' },
      json: { label: '{}', color: '#cbcb41' },
      ts:   { label: 'TS', color: '#519aba' },
      html: { label: '<>', color: '#e44d26' },
      css:  { label: 'SS', color: '#42a5f5' }
    };
    return map[ext] ?? { label: ext.slice(0, 2).toUpperCase() || '?', color: '#858585' };
  }

  private flatten(nodes: FileNode[], depth: number): FlatNode[] {
    const result: FlatNode[] = [];
    for (const n of nodes) {
      result.push({
        id: n.id, name: n.name, type: n.type,
        path: n.path, depth,
        isOpen: n.isOpen ?? false,
        hasChildren: !!(n.children?.length)
      });
      if (n.type === 'folder' && n.isOpen && n.children?.length) {
        result.push(...this.flatten(n.children, depth + 1));
      }
    }
    return result;
  }

  private toggleNode(nodes: FileNode[], id: string): FileNode[] {
    return nodes.map(n => {
      if (n.id === id) return { ...n, isOpen: !n.isOpen };
      if (n.children) return { ...n, children: this.toggleNode(n.children, id) };
      return n;
    });
  }

  private fallbackTree(): FileNode[] {
    return [
      {
        id: 'bio', name: 'bio', type: 'folder', isOpen: true,
        children: [
          { id: 'bio-overview',   name: 'overview.md',     type: 'file', path: 'bio/overview.md' },
          { id: 'bio-experience', name: 'experience.json', type: 'file', path: 'bio/experience.json' }
        ]
      },
      {
        id: 'blog', name: 'blog', type: 'folder', isOpen: false,
        children: [{
          id: 'blog-arch', name: 'architecture', type: 'folder', isOpen: false,
          children: [
            { id: 'clean-arch', name: 'clean-architecture.md', type: 'file', path: 'blog/architecture/clean-architecture.md' }
          ]
        }]
      },
      { id: 'changelog', name: 'changelog.json', type: 'file', path: 'changelog.json' }
    ];
  }
}
