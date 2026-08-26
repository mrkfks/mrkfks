import { Injectable, inject, PLATFORM_ID, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { FeedItem } from '../models/changelog.model';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ChangelogService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  feedItems = signal<FeedItem[]>([]);
  isLoading = signal(false);

  constructor() {
    if (this.isBrowser) {
      this.loadChangelog();
    }
  }

  private getBasePath(): string {
    if (!this.isBrowser) return '';
    const pathname = window.location.pathname;
    return pathname.includes('/mrkfks') ? '/mrkfks' : '';
  }

  private loadChangelog(): void {
    this.isLoading.set(true);
    const basePath = this.getBasePath();
    const url = `${basePath}/assets/content/changelog.json`;

    this.http.get<{ items: FeedItem[] }>(url).pipe(
      map(data => {
        // Sort by date, newest first
        return data.items.sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
      }),
      catchError(error => {
        console.error('Error loading changelog:', error);
        return of([]);
      })
    ).subscribe({
      next: (items) => {
        this.feedItems.set(items);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load changelog:', err);
        this.isLoading.set(false);
      }
    });
  }

  getItemByPath(targetPath: string): FeedItem | undefined {
    return this.feedItems().find(item => item.targetPath === targetPath);
  }

  reload(): void {
    this.loadChangelog();
  }
}
