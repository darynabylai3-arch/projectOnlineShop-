import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="lang-switcher">
      <button
        *ngFor="let lang of languages"
        [class.active]="currentLang === lang.code"
        (click)="switchLang(lang.code)"
        [title]="lang.label"
      >
        {{ lang.code.toUpperCase() }}
      </button>
    </div>
  `,
  styles: [`
    .lang-switcher {
      display: flex;
      align-items: center;
      gap: 2px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      padding: 3px;
    }

    button {
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 11px;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.65);
      padding: 4px 9px;
      border-radius: 8px;
      transition: all 0.2s ease;
      letter-spacing: 0.06em;
      line-height: 1;
      font-family: 'Josefin Sans', sans-serif;
    }

    button:hover {
      color: white;
      background: rgba(255, 255, 255, 0.15);
    }

    button.active {
      color: #663fff;
      background: white;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
    }
  `]
})
export class LanguageSwitcher implements OnInit {
  private translate = inject(TranslateService);

  currentLang = 'en';

  languages = [
    { code: 'ru', label: 'Русский' },
    { code: 'kz', label: 'Қазақша' },
    { code: 'en', label: 'English' },
  ];

  ngOnInit() {
    const saved = localStorage.getItem('shopmind_lang') || 'ru';
    this.currentLang = saved;
    this.translate.use(saved);
  }

  switchLang(lang: string) {
    this.currentLang = lang;
    this.translate.use(lang);
    localStorage.setItem('shopmind_lang', lang);
  }
}