import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface VisitorInfo {
  ip: string;
  city: string;
  country_name: string;
}

@Component({
  selector: 'app-status-bar',
  standalone: true,
  templateUrl: './status-bar.html',
  styleUrls: ['./status-bar.css']
})
export class StatusBarComponent implements OnInit {
  private http = inject(HttpClient);

  // Reaktif durum değişkenleri
  visitorLocation = signal<string>('Detecting IP...');
  systemInfo = signal<string>('');
  screenRes = signal<string>('');
  loadTime = signal<string>('');

  ngOnInit() {
    this.fetchVisitorData();
    this.detectClientSpecs();
    this.measureLoadTime();
  }

  private fetchVisitorData() {
    // SSR ortamında dış API çağrısı yapma
    if (typeof window === 'undefined') {
      this.visitorLocation.set('🌐 Server-Side Rendering');
      return;
    }
    
    this.http.get<VisitorInfo>('https://ipapi.co/json/').subscribe({
      next: (data) => {
        this.visitorLocation.set(`🌐 ${data.ip} (${data.city}, ${data.country_name})`);
      },
      error: () => {
        this.visitorLocation.set('🌐 127.0.0.1 (Localhost)');
      }
    });
  }

  private detectClientSpecs() {
    // SSR ortamında window ve navigator olmayabilir
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      this.systemInfo.set('💻 Server-Side Rendering');
      this.screenRes.set('N/A');
      return;
    }

    // İşletim sistemi ve tarayıcı tespiti
    const userAgent = navigator.userAgent;
    let os = 'Unknown OS';
    let browser = 'Browser';

    if (userAgent.includes('Win')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iPhone')) os = 'iOS';

    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
    else if (userAgent.includes('Edg')) browser = 'Edge';

    this.systemInfo.set(`💻 ${os} / ${browser}`);

    // Çözünürlük bilgisi
    this.screenRes.set(`${window.screen.width}x${window.screen.height}`);
  }

  private measureLoadTime() {
    // Performance API ile sayfa yüklenme süresini milisaniye cinsinden hesaplama
    if (typeof window === 'undefined' || typeof performance === 'undefined') {
      return;
    }

    window.addEventListener('load', () => {
      setTimeout(() => {
        const [navigation] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
        if (navigation) {
          const pageLoadTime = Math.round(navigation.duration);
          this.loadTime.set(`⚡ ${pageLoadTime}ms`);
        }
      }, 0);
    });
  }
}