import { Component, OnInit, inject, signal, PLATFORM_ID, ViewEncapsulation } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ContentService } from '../../core/services/content.service';

type SectionKey = 'profile' | 'links' | 'experience' | 'skills';

interface ExperienceItem {
  id: number;
  company: string;
  role: string;
  period: string;
  description: string;
  achievements?: string[];
}

@Component({
  selector: 'app-explorer-panel',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="explorer-panel">
      <div class="explorer-panel-header">EXPLORER</div>

      <!-- PROFILE -->
      <div class="ep-section">
        <button class="ep-section-header" (click)="toggle('profile')">
          <span class="ep-chevron" [class.open]="sections().profile">▶</span>
          PROFİL
        </button>
        @if (sections().profile) {
          <div class="ep-profile-card">
            <div class="ep-avatar">👨‍💻</div>
            <div class="ep-profile-info">
              <div class="ep-name">Ömer Kafkas</div>
              <div class="ep-role">Full-Stack Developer</div>
              <div class="ep-bio">
                C#/.NET, Angular ve TypeScript uzmanı. Kurumsal uygulama geliştirme, dağıtık sistemler ve domain-driven mimari alanlarında deneyimli.
              </div>
            </div>
          </div>
        }
      </div>

      <!-- LINKS -->
      <div class="ep-section">
        <button class="ep-section-header" (click)="toggle('links')">
          <span class="ep-chevron" [class.open]="sections().links">▶</span>
          BAĞLANTILAR
        </button>
        @if (sections().links) {
          <div class="ep-links">
            <a href="https://github.com/mrkfks" class="ep-link" target="_blank" rel="noopener">
              <span class="ep-link-icon">💻</span> GitHub
            </a>
            <a href="https://linkedin.com/in/mrkfks" class="ep-link" target="_blank" rel="noopener">
              <span class="ep-link-icon">🔗</span> LinkedIn
            </a>
            <a href="mailto:mrkfks@proton.me" class="ep-link">
              <span class="ep-link-icon">📧</span> E-posta
            </a>
            <a href="#" class="ep-link">
              <span class="ep-link-icon">📄</span> CV İndir (PDF)
            </a>
          </div>
        }
      </div>

      <!-- EXPERIENCE -->
      <div class="ep-section">
        <button class="ep-section-header" (click)="toggle('experience')">
          <span class="ep-chevron" [class.open]="sections().experience">▶</span>
          DENEYİM
        </button>
        @if (sections().experience) {
          @if (isLoading()) {
            <div class="ep-loading">Yükleniyor...</div>
          } @else if (experience().length === 0) {
            <div class="ep-empty">Veri bulunamadı.</div>
          } @else {
            @for (item of experience(); track item.id) {
              <div class="ep-exp-card">
                <div class="ep-exp-company">{{ item.company }}</div>
                <div class="ep-exp-role">{{ item.role }}</div>
                <div class="ep-exp-period">{{ item.period }}</div>
                @if (item.description) {
                  <div class="ep-exp-desc">{{ item.description }}</div>
                }
                @if (item.achievements?.length) {
                  <ul class="ep-exp-achiev">
                    @for (a of item.achievements; track a) {
                      <li>{{ a }}</li>
                    }
                  </ul>
                }
              </div>
            }
          }
        }
      </div>

      <!-- SKILLS -->
      <div class="ep-section">
        <button class="ep-section-header" (click)="toggle('skills')">
          <span class="ep-chevron" [class.open]="sections().skills">▶</span>
          YETKİNLİKLER
        </button>
        @if (sections().skills) {
          <div class="ep-skills">
            @for (skill of skills; track skill.label) {
              <span class="ep-skill-tag" [style.background]="skill.color">{{ skill.label }}</span>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .explorer-panel {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--vs-panel, #252526);
      color: var(--vs-text, #cccccc);
      font-family: 'Segoe UI', Tahoma, sans-serif;
      font-size: var(--vs-font-size, 13px);
      overflow-y: auto;
    }
    .explorer-panel::-webkit-scrollbar { width: 8px; }
    .explorer-panel::-webkit-scrollbar-track { background: transparent; }
    .explorer-panel::-webkit-scrollbar-thumb { background: #464647; border-radius: 4px; }

    .explorer-panel-header {
      padding: 10px 16px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.8px;
      color: var(--vs-muted, #858585);
      border-bottom: 1px solid var(--vs-border, #2b2b2b);
      text-transform: uppercase;
      flex-shrink: 0;
    }

    .ep-section {
      border-bottom: 1px solid var(--vs-border, #2b2b2b);
    }

    .ep-section-header {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 7px 12px;
      background: none;
      border: none;
      color: var(--vs-text, #cccccc);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      cursor: pointer;
      text-align: left;
      transition: background 0.15s;
    }
    .ep-section-header:hover { background: var(--vs-hover, #2d2d30); }

    .ep-chevron {
      font-size: 9px;
      color: var(--vs-muted, #858585);
      transition: transform 0.2s;
      display: inline-block;
    }
    .ep-chevron.open { transform: rotate(90deg); }

    /* Profile */
    .ep-profile-card {
      display: flex;
      gap: 12px;
      padding: 12px 16px;
      align-items: flex-start;
    }
    .ep-avatar {
      font-size: 36px;
      flex-shrink: 0;
    }
    .ep-profile-info { flex: 1; }
    .ep-name {
      font-size: 15px;
      font-weight: 700;
      color: var(--vs-text, #cccccc);
      margin-bottom: 2px;
    }
    .ep-role {
      font-size: 12px;
      color: var(--vs-teal, #4ec9b0);
      margin-bottom: 8px;
    }
    .ep-bio {
      font-size: 12px;
      color: var(--vs-muted, #858585);
      line-height: 1.5;
    }

    /* Links */
    .ep-links {
      display: flex;
      flex-direction: column;
      padding: 6px 0 10px;
    }
    .ep-link {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 20px;
      color: var(--vs-text, #cccccc);
      text-decoration: none;
      font-size: 12px;
      transition: background 0.15s;
      border-left: 2px solid transparent;
    }
    .ep-link:hover {
      background: var(--vs-hover, #2d2d30);
      border-left-color: var(--vs-accent, #007acc);
      color: var(--vs-accent, #007acc);
    }
    .ep-link-icon { font-size: 13px; }

    /* Experience */
    .ep-loading, .ep-empty {
      padding: 12px 16px;
      font-size: 12px;
      color: var(--vs-muted, #858585);
    }
    .ep-exp-card {
      margin: 6px 12px;
      padding: 10px 12px;
      background: rgba(255,255,255,0.03);
      border: 1px solid var(--vs-border, #2b2b2b);
      border-radius: 4px;
      border-left: 3px solid var(--vs-accent, #007acc);
    }
    .ep-exp-company {
      font-size: 12px;
      font-weight: 600;
      color: var(--vs-text, #cccccc);
      margin-bottom: 2px;
    }
    .ep-exp-role {
      font-size: 12px;
      color: var(--vs-teal, #4ec9b0);
      margin-bottom: 3px;
    }
    .ep-exp-period {
      font-size: 11px;
      color: var(--vs-muted, #858585);
      margin-bottom: 6px;
    }
    .ep-exp-desc {
      font-size: 11px;
      color: var(--vs-muted, #858585);
      line-height: 1.4;
      margin-bottom: 6px;
    }
    .ep-exp-achiev {
      margin: 0;
      padding-left: 16px;
    }
    .ep-exp-achiev li {
      font-size: 11px;
      color: var(--vs-muted, #858585);
      margin-bottom: 2px;
      line-height: 1.4;
    }
    .ep-exp-card + .ep-exp-card { margin-top: 6px; }

    /* Skills */
    .ep-skills {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding: 10px 14px 14px;
    }
    .ep-skill-tag {
      padding: 3px 8px;
      border-radius: 3px;
      font-size: 11px;
      font-weight: 600;
      color: #1e1e1e;
      white-space: nowrap;
    }
  `]
})
export class ExplorerPanelComponent implements OnInit {
  private contentService = inject(ContentService);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  experience = signal<ExperienceItem[]>([]);
  isLoading = signal(true);
  sections = signal({ profile: true, links: true, experience: false, skills: false });

  skills = [
    { label: 'Angular', color: '#dd0031' },
    { label: 'TypeScript', color: '#3178c6' },
    { label: 'C#', color: '#9b4f96' },
    { label: '.NET', color: '#512bd4' },
    { label: 'SQL Server', color: '#cc2927' },
    { label: 'Entity Framework', color: '#68217a' },
    { label: 'REST API', color: '#4ec9b0' },
    { label: 'Docker', color: '#2496ed' },
    { label: 'Git', color: '#f05032' },
    { label: 'Azure', color: '#0078d4' },
    { label: 'Microservices', color: '#a6e22e' },
    { label: 'Clean Architecture', color: '#f92672' },
    { label: 'DDD', color: '#e6db74' },
    { label: 'CQRS', color: '#fd971f' }
  ];

  ngOnInit(): void {
    if (this.isBrowser) {
      this.contentService.loadJson('bio/experience.json').subscribe({
        next: (data) => {
          this.experience.set(Array.isArray(data) ? data : []);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      });
    } else {
      this.isLoading.set(false);
    }
  }

  toggle(key: SectionKey): void {
    const s = this.sections();
    this.sections.set({ ...s, [key]: !s[key] });
  }
}
