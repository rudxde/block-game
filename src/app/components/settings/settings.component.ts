import { Component, OnInit } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { MenuBarService } from 'src/app/services/menu-bar.service';
import { AppUpdateService } from 'src/app/services/update.service';
import { ThemeService, EThemeMode } from 'src/app/services/theme.service';
import { firstValueFrom } from 'rxjs';
import { GameSettingsService } from '../../services/game-settings.service';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  availableLangs: string[] = [];
  activeLang: string = '';

  autoUpdateEnabled: boolean | undefined;

  themeModes: EThemeMode[] = Object.values(EThemeMode);
  selectedThemeMode: EThemeMode;

  draggingOffsetLabels: string[] = [];
  draggingOffsetIndex: number = 0;

  draggingOffsetMap = [
    16,
    32,
    64,
    128,
  ];

  constructor(
    private menuBarService: MenuBarService,
    private translocoService: TranslocoService,
    private appUpdateService: AppUpdateService,
    private themeService: ThemeService,
    private gameSettingsService: GameSettingsService,
  ) {
    this.selectedThemeMode = themeService.getTimeMode();
  }

  ngOnInit(): void {
    this.menuBarService.set('settings');
    this.activeLang = this.translocoService.getActiveLang();
    this.availableLangs = this.translocoService.getAvailableLangs().map(x => {
      if (typeof x === 'string') {
        return x;
      }
      return x.id;
    });
    this.loadTranslations();
    this.autoUpdateEnabled = this.appUpdateService.autoUpdateEnabled();
    this.draggingOffsetIndex = this.draggingOffsetMap.findIndex(x => x === this.gameSettingsService.getGameSettings().draggingOffset);
    if (this.draggingOffsetIndex === -1) {
      this.draggingOffsetIndex = 1;
    }
  }

  private loadTranslations() {
    Promise.all(
      new Array(4).fill(0)
        .map((_, i) =>
          this.translocoService.selectTranslate(`settings.dragging_offset_label.${i}`)
        )
        .map(x => firstValueFrom(x)))
      .then(values => {
        this.draggingOffsetLabels = values;
      },
      );
  }

  selectLang(language: string): void {
    this.translocoService.setActiveLang(language);
    localStorage.setItem('language', language);
    this.loadTranslations();
  }


  setAutoUpdate(value: boolean): void {
    this.appUpdateService.setEnableAutoUpdate(value);
    this.autoUpdateEnabled = this.appUpdateService.autoUpdateEnabled();
  }

  checkForUpdates(): void {
    this.appUpdateService.checkForUpdates(true);
  }

  selectTimeMode(mode: EThemeMode): void {
    this.themeService.setThemeMode(mode);
    this.selectedThemeMode = mode;
  }

  setDraggingOffset(value: number): void {
    let draggingOffset = this.draggingOffsetMap[value];
    this.gameSettingsService.setDraggingOffset(draggingOffset);
    this.draggingOffsetIndex = value;
  }

  getDraggingOffsetLabel = (index: number): string => {
    return this.draggingOffsetLabels[index] ?? '';
  };

}
