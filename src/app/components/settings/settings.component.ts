import { Component, OnInit } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { MenuBarService } from 'src/app/services/menu-bar.service';
import { AppUpdateService } from 'src/app/services/update.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  availableLangs: string[] = [];
  activeLang: string = '';

  autoUpdateEnabled: boolean | undefined;

  constructor(
    private menuBarService: MenuBarService,
    private translocoService: TranslocoService,
    private appUpdateService: AppUpdateService,
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
    this.autoUpdateEnabled = this.appUpdateService.autoUpdateEnabled();
  }

  selectLang(language: string): void {
    this.translocoService.setActiveLang(language);
    localStorage.setItem('language', language);
  }


  setAutoUpdate(value: boolean): void {
    this.appUpdateService.setEnableAutoUpdate(value);
    this.autoUpdateEnabled = this.appUpdateService.autoUpdateEnabled();
  }

  checkForUpdates(): void {
    this.appUpdateService.checkForUpdates(true);
  }

}
