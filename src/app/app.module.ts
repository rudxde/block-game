import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app/app.component';
import { GameComponent } from './components/game/game.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { TranslocoRootModule } from './transloco-root.module';
import { HttpClientModule } from '@angular/common/http';
import { TranslocoService } from '@ngneat/transloco';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SettingsComponent } from './components/settings/settings.component';
import { MenuButtonComponent } from './components/menu-button/menu-button.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AppUpdateService } from './services/update.service';
import { ErrorComponent } from './components/error/error.component';
import { GlobalErrorHandler } from './services/global-error.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@NgModule({
  declarations: [
    AppComponent,
    GameComponent,
    SettingsComponent,
    MenuButtonComponent,
    ErrorComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerImmediately',
    }),
    HttpClientModule,
    TranslocoRootModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatSidenavModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatSlideToggleModule,
  ],
  providers: [
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler,
    },
    AppUpdateService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(
    translocoService: TranslocoService,
    appUpdateService: AppUpdateService,
  ) {
    let language = navigator.language;
    let localStorageLanguage = localStorage.getItem('language');
    if (localStorageLanguage) {
      language = localStorageLanguage;
    }
    if (language.indexOf('-')) {
      language = language.split('-')[0];
    }
    if (!translocoService.isLang(language)) {
      return;
    }
    translocoService.setActiveLang(language);
    document.querySelector('html')?.setAttribute('lang', translocoService.getActiveLang());
    appUpdateService.init();
  }
}
