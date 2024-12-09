import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslocoService, TranslocoModule } from '@ngneat/transloco';
import { MenuBarService } from 'src/app/services/menu-bar.service';
import { AppUpdateService } from 'src/app/services/update.service';
import { ThemeService, EThemeMode } from 'src/app/services/theme.service';
import { filter, firstValueFrom, Subject, takeUntil } from 'rxjs';
import { GameSettingsService } from '../../services/game-settings.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatOptionModule } from '@angular/material/core';
import { NgFor } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';


@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss'],
    standalone: true,
    imports: [TranslocoModule, MatFormFieldModule, MatSelectModule, NgFor, MatOptionModule, MatSlideToggleModule, MatButtonModule, MatSliderModule, ReactiveFormsModule]
})
export class SettingsComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  availableLangs: string[] = [];
  activeLang: string = '';

  autoUpdateEnabled: boolean | undefined;

  themeModes: EThemeMode[] = Object.values(EThemeMode);
  selectedThemeMode: EThemeMode;

  draggingOffsetLabels: string[] = [];
  draggingOffset = new FormControl<number>(0);

  draggingOffsetMap = [
    16,
    32,
    64,
    128,
  ] as const;

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
    let draggingOffsetIndex = this.draggingOffsetMap.findIndex(x => x === this.gameSettingsService.getGameSettings().draggingOffset);
    if (draggingOffsetIndex === -1) {
      draggingOffsetIndex = 1;
    }
    this.draggingOffset.setValue(draggingOffsetIndex);
    this.draggingOffset.valueChanges
      .pipe(
        filter((value): value is number => !!value),
        takeUntil(this.destroy$)
      )
      .subscribe(value => this.setDraggingOffset(value));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
  }

  getDraggingOffsetLabel = (index: number): string => {
    return this.draggingOffsetLabels[index] ?? '';
  };

}
