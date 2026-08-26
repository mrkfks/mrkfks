import { Component, OnInit, inject, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabStateService } from '../../core/services/tab-state.service';

export interface FileTreeNode {
  id: string;
  name: string;
  type: 'folder' | 'file';
  path: string;
  children?: FileTreeNode[];
  isExpanded?: boolean;
  icon?: string;
}

@Component({
  selector: 'app-tree-node',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="node-wrapper">
      <div class="node-header" 
           (click)="toggleNode()"
           (dblclick)="onSelectNode()"
           [class.expandable]="node.type === 'folder'">
        
        <!-- Expand/Collapse Arrow -->
        @if (node.type === 'folder') {
          <span class="arrow" [class.expanded]="node.isExpanded">▶</span>
        } @else {
          <span class="arrow placeholder"></span>
        }

        <!-- Icon & Name -->
        <span class="node-icon">{{ node.icon || (node.type === 'folder' ? '📁' : '📄') }}</span>
        <span class="node-name">{{ node.name }}</span>
      </div>

      <!-- Children -->
      @if (node.type === 'folder' && node.isExpanded && node.children) {
        <div class="node-children">
          @for (child of node.children; track child.id) {
            <div class="child-node">
              <app-tree-node 
                [node]="child"
                (selectNode)="selectNode.emit($event)">
              </app-tree-node>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .node-wrapper {
      user-select: none;
    }

    .node-header {
      display: flex;
      align-items: center;
      padding: 4px 8px;
      height: 24px;
      cursor: pointer;
      color: #cccccc;
      font-size: 13px;
      gap: 4px;
    }

    .node-header:hover {
      background: #2d2d30;
    }

    .node-header.expandable:active {
      background: #3e3e42;
    }

    .arrow {
      display: inline-block;
      width: 16px;
      text-align: center;
      transition: transform 0.2s ease;
      color: #858585;
      font-size: 10px;
    }

    .arrow.expanded {
      transform: rotate(90deg);
    }

    .arrow.placeholder {
      pointer-events: none;
      visibility: hidden;
    }

    .node-icon {
      margin: 0 2px;
    }

    .node-name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .node-children {
      margin-left: 8px;
      border-left: 1px solid #3e3e42;
      padding-left: 0;
    }

    .child-node {
      position: relative;
    }

    .child-node::before {
      content: '';
      position: absolute;
      left: -1px;
      top: 0;
      bottom: 50%;
      width: 1px;
      background: #3e3e42;
    }

    .child-node:last-child::before {
      display: none;
    }
  `]
})
export class TreeNodeComponent {
  @Input() node!: FileTreeNode;
  @Output() selectNode = new EventEmitter<FileTreeNode>();

  toggleNode(): void {
    if (this.node.type === 'folder') {
      this.node.isExpanded = !this.node.isExpanded;
    }
  }

  onSelectNode(): void {
    this.selectNode.emit(this.node);
  }
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, TreeNodeComponent],
  template: `
    <div class="sidebar-container">
      <!-- Sidebar Header -->
      <div class="sidebar-header">
        <h2>📁 EXPLORER</h2>
      </div>

      <!-- File Tree -->
      <div class="file-tree">
        @for (node of fileTree; track node.id) {
          <div class="tree-node">
            <app-tree-node 
              [node]="node"
              (selectNode)="selectFile($event)">
            </app-tree-node>
          </div>
        }
      </div>

      <!-- Context Menu Placeholder -->
      <div class="sidebar-footer">
        <small>Right-click for options</small>
      </div>
    </div>
  `,
  styles: [`
    .sidebar-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: #252526;
      color: #cccccc;
      border-right: 1px solid #3e3e42;
      overflow: hidden;
    }

    .sidebar-header {
      padding: 12px 16px;
      border-bottom: 1px solid #3e3e42;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      user-select: none;
    }

    .sidebar-header h2 {
      margin: 0;
      font-size: 12px;
      font-weight: 600;
      color: #cccccc;
    }

    .file-tree {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 8px 0;
    }

    .file-tree::-webkit-scrollbar {
      width: 12px;
    }

    .file-tree::-webkit-scrollbar-track {
      background: transparent;
    }

    .file-tree::-webkit-scrollbar-thumb {
      background: #464647;
      border-radius: 6px;
    }

    .file-tree::-webkit-scrollbar-thumb:hover {
      background: #535354;
    }

    .tree-node {
      user-select: none;
    }

    .sidebar-footer {
      padding: 8px 12px;
      border-top: 1px solid #3e3e42;
      font-size: 11px;
      color: #858585;
      user-select: none;
    }
  `]
})
export class SidebarComponent implements OnInit {
  private tabService = inject(TabStateService);

  fileTree: FileTreeNode[] = [];

  ngOnInit(): void {
    this.loadFileTree();
  }

  private loadFileTree(): void {
    this.fileTree = [
      {
        id: 'bio',
        name: '📄 bio',
        type: 'folder',
        path: '/content/bio',
        isExpanded: true,
        children: [
          {
            id: 'overview',
            name: 'overview.md',
            type: 'file',
            path: '/content/bio/overview.md',
            icon: '📝'
          },
          {
            id: 'experience',
            name: 'experience.json',
            type: 'file',
            path: '/content/bio/experience.json',
            icon: '💼'
          }
        ]
      },
      {
        id: 'blog',
        name: '📚 blog',
        type: 'folder',
        path: '/content/blog',
        isExpanded: true,
        children: [
          {
            id: 'architecture-folder',
            name: '🏗️ architecture',
            type: 'folder',
            path: '/content/blog/architecture',
            isExpanded: false,
            children: [
              {
                id: 'clean-arch',
                name: 'clean-architecture.md',
                type: 'file',
                path: '/content/blog/architecture/clean-architecture.md',
                icon: '📖'
              }
            ]
          }
        ]
      }
    ];
  }

  selectFile(node: FileTreeNode): void {
    if (node.type === 'file') {
      const filename = node.name.split('.')[0];
      const tabId = `${filename}-${Date.now()}`;
      
      this.tabService.addTab({
        id: tabId,
        name: node.name,
        path: node.path,
        type: node.path.endsWith('.md') ? 'markdown' : (node.path.endsWith('.json') ? 'json' : 'config'),
        isActive: true
      });
    }
  }
}
