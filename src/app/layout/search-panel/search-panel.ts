import { Component, Output, EventEmitter, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-search-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-panel.html',
  styleUrl: './search-panel.css'
})
export class SearchPanelComponent implements OnInit {
  @Output() fileSelect = new EventEmitter<string>();

  private http = inject(HttpClient);

  searchQuery = signal('');
  searchTab = signal<'all' | 'name' | 'content'>('all');
  searchResults = signal<any>({ byName: [], byContent: [] });
  isLoading = signal(false);

  ngOnInit() {
    // Focus on search input on init
    setTimeout(() => {
      const input = document.querySelector('.search-input') as HTMLInputElement;
      if (input) input.focus();
    }, 0);
  }

  onSearchChange(query: string) {
    this.searchQuery.set(query);
    
    if (!query.trim()) {
      this.searchResults.set({ byName: [], byContent: [] });
      return;
    }

    this.isLoading.set(true);
    this.http.get<any>('/api/search', { params: { q: query } }).subscribe({
      next: (response) => {
        if (response.success) {
          this.searchResults.set(response.data || { byName: [], byContent: [] });
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Search error:', err);
        this.searchResults.set({ byName: [], byContent: [] });
        this.isLoading.set(false);
      }
    });
  }

  selectSearchResult(path: string) {
    this.fileSelect.emit(path);
  }

  clearSearch() {
    this.searchQuery.set('');
    this.searchResults.set({ byName: [], byContent: [] });
    setTimeout(() => {
      const input = document.querySelector('.search-input') as HTMLInputElement;
      if (input) input.focus();
    }, 0);
  }
}
