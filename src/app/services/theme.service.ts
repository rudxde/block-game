import { Injectable } from '@angular/core';
import { interval } from 'rxjs';

export enum EThemeMode {
  AUTO = 'auto',
  LIGHT = 'light',
  DARK = 'dark',
  DAY_CYCLE = 'day-cycle',
}

const THEME_MODE_KEY = 'themeMode';
@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private _isDarkMode = false;

  constructor() { }

  init() {
    this.updateThemeMode();
    interval(10000)
      .subscribe({ next: () => this.updateThemeMode() });
  }

  setThemeMode(mode: EThemeMode) {
    window.localStorage.setItem(THEME_MODE_KEY, mode);
    this.updateThemeMode();
  }

  getTimeMode(): EThemeMode {
    const mode = window.localStorage.getItem(THEME_MODE_KEY) ?? EThemeMode.AUTO;
    if (!this.isThemeMode(mode)) {
      throw new Error(`Invalid theme mode: ${mode}`);
    }
    return mode as EThemeMode;
  }

  isDarkMode(): boolean {
    return this._isDarkMode;
  }

  private updateThemeMode() {
    const mode = this.getTimeMode();
    switch (mode) {
      case EThemeMode.DARK:
        this.enableDarkMode();
        break;
      case EThemeMode.LIGHT:
        this.disableDarkMode();
        break;
      case EThemeMode.AUTO:
        this.setThemeAuto();
        break;
      case EThemeMode.DAY_CYCLE:
        this.setThemeDayCycle();
        break;
    }
  }

  private setThemeAuto() {
    const systemIsInDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (systemIsInDarkMode) {
      this.enableDarkMode();
    } else {
      this.disableDarkMode();
    }
  }

  private setThemeDayCycle() {
    const timeFrom = 21;
    const timeTo = 4;
    const time = new Date().getHours();
    if (time >= timeFrom || time <= timeTo) {
      this.enableDarkMode();
    } else {
      this.disableDarkMode();
    }
  }

  private disableDarkMode() {
    document.body.classList.remove('dark-theme');
    this._isDarkMode = false;
  }

  private enableDarkMode() {
    document.body.classList.add('dark-theme');
    this._isDarkMode = true;
  }

  private isThemeMode(x: string): x is EThemeMode {
    return Object.values(EThemeMode).includes(x as EThemeMode);
  }
}
