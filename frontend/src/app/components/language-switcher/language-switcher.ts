import { Component, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="lang-switcher">
      <button 
        [class.active]="currentLang === 'ru'"
        (click)="switchLang('ru')">
        RU
      </button>
      <span class="divider">|</span>
      <button 
        [class.active]="currentLang === 'kk'"
        (click)="switchLang('kk')">
        KK
      </button>
      <span class="divider">|</span>
      <button 
        [class.active]="currentLang === 'en'"
        (click)="switchLang('en')">
        EN
      </button>
    </div>
  `,
  styles: [`
    .lang-switcher {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    button {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      color: rgba(255,255,255,0.7);
      padding: 4px 8px;
      border-radius: 6px;
      transition: all 0.2s;
    }
    button:hover { color: white; }
    button.active {
      color: white;
      background: rgba(255,255,255,0.2);
    }
    .divider { color: rgba(255,255,255,0.4); }
  `]
})
export class LanguageSwitcher {
  private translate = inject(TranslateService);
  currentLang = 'en';

  constructor() {
    const saved = localStorage.getItem('lang') || 'en';
    this.currentLang = saved;
    this.translate.use(saved);
  }

  switchLang(lang: string) {
    this.currentLang = lang;
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
  }
}