import { Component, OnInit } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { MenuBarService } from 'src/app/services/menu-bar.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  availableLangs: string[] = [];
  activeLang: string = '';
  
  constructor(
    private menuBarService: MenuBarService,
    private translocoService: TranslocoService,
  ) { }

  ngOnInit(): void {
    this.menuBarService.set('settings');
    this.activeLang = this.translocoService.getActiveLang();
    this.availableLangs = this.translocoService.getAvailableLangs().map(x => {
      if (typeof x === 'string') {
        return x;
      }
      return x.id;
    });
  }

  selectLang(language: string): void {
    this.translocoService.setActiveLang(language);
    localStorage.setItem('language', language);
  }

}
