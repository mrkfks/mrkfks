import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  private http = inject(HttpClient);
  
  // Get base path dynamically (for GitHub Pages support)
  private getBasePath(): string {
    const pathname = window.location.pathname;
    // If pathname is /mrkfks/something, return /mrkfks
    // Otherwise return empty string (for root domain or localhost)
    if (pathname.includes('/mrkfks')) {
      return '/mrkfks';
    }
    return '';
  }

  /**
   * Load content from file path
   * @param path - Relative path like 'bio/overview.md'
   * @returns Observable<string> - File content
   */
  loadContent(path: string): Observable<string> {
    // Normalize path
    const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
    
    // Build full URL with base path
    const basePath = this.getBasePath();
    const url = `${basePath}/assets/content/${normalizedPath}`;
    
    console.debug(`Loading content from: ${url}`);

    return this.http.get(url, { responseType: 'text' }).pipe(
      map(content => content || ''),
      catchError(error => {
        console.error(`Failed to load content from ${url}:`, error);
        return of(`Error loading file: ${path}`);
      })
    );
  }

  /**
   * Load JSON data from file
   * @param path - Relative path like 'bio/experience.json'
   * @returns Observable<any> - Parsed JSON
   */
  loadJson(path: string): Observable<any> {
    const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
    const basePath = this.getBasePath();
    const url = `${basePath}/assets/content/${normalizedPath}`;

    console.debug(`Loading JSON from: ${url}`);

    return this.http.get(url).pipe(
      catchError(error => {
        console.error(`Failed to load JSON from ${url}:`, error);
        return of([]);
      })
    );
  }
}
