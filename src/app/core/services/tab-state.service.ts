import { Injectable } from '@angular/core';
import { signal, computed } from '@angular/core';

export interface Tab {
  id: string;
  name: string;
  path: string;
  type: 'markdown' | 'json' | 'config';
  content?: string;
  isDirty?: boolean;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TabStateService {
  // State
  private tabs = signal<Tab[]>([]);
  private activeTabId = signal<string | null>(null);

  // Computed
  tabs$ = computed(() => this.tabs());
  activeTab$ = computed(() => 
    this.tabs().find(tab => tab.id === this.activeTabId()) || null
  );
  hasOpenTabs$ = computed(() => this.tabs().length > 0);

  constructor() {
    // Initialize with default tab (overview.md)
    this.addTab({
      id: 'overview',
      name: 'overview.md',
      path: 'bio/overview.md',
      type: 'markdown',
      isActive: true
    });
  }

  /**
   * Add or activate a tab
   */
  addTab(tab: Tab): void {
    const existingTab = this.tabs().find(t => t.path === tab.path);
    
    if (existingTab) {
      this.setActiveTab(existingTab.id);
      return;
    }

    // Deactivate all tabs
    const updatedTabs = this.tabs().map(t => ({ ...t, isActive: false }));
    
    // Add new tab with active state
    updatedTabs.push({ ...tab, isActive: true });
    
    this.tabs.set(updatedTabs);
    this.activeTabId.set(tab.id);
  }

  /**
   * Set active tab by ID
   */
  setActiveTab(tabId: string): void {
    const updatedTabs = this.tabs().map(tab => ({
      ...tab,
      isActive: tab.id === tabId
    }));
    
    this.tabs.set(updatedTabs);
    this.activeTabId.set(tabId);
  }

  /**
   * Close a tab
   */
  closeTab(tabId: string): void {
    const updatedTabs = this.tabs().filter(t => t.id !== tabId);
    
    if (updatedTabs.length === 0) {
      this.tabs.set([]);
      this.activeTabId.set(null);
      return;
    }

    // If closed tab was active, activate the last tab
    if (this.activeTabId() === tabId) {
      this.activeTabId.set(updatedTabs[updatedTabs.length - 1].id);
    }

    this.tabs.set(updatedTabs);
  }

  /**
   * Close all tabs except specified ID
   */
  closeOtherTabs(tabId: string): void {
    const tab = this.tabs().find(t => t.id === tabId);
    if (tab) {
      this.tabs.set([tab]);
      this.activeTabId.set(tab.id);
    }
  }

  /**
   * Update tab content
   */
  updateTabContent(tabId: string, content: string): void {
    const updatedTabs = this.tabs().map(tab =>
      tab.id === tabId ? { ...tab, content, isDirty: true } : tab
    );
    this.tabs.set(updatedTabs);
  }

  /**
   * Get tab by path
   */
  getTabByPath(path: string): Tab | undefined {
    return this.tabs().find(tab => tab.path === path);
  }
}
