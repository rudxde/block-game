import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app/app.component';
import { GameComponent } from './components/game/game.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { TranslocoRootModule } from './transloco-root.module';
import { HttpClientModule } from '@angular/common/http';
import { TranslocoService } from '@ngneat/transloco';

@NgModule({
  declarations: [
    AppComponent,
    GameComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerImmediately'
    }),
    HttpClientModule,
    TranslocoRootModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(translocoService: TranslocoService) {
    // const userLang = navigator.language || navigator.userLanguage;
    let language = navigator.language;
    if(language.indexOf('-')) {
      language = language.split('-')[0];
    }
    if (!translocoService.isLang(language)) {
      return;
    }
    translocoService.setActiveLang(language);
    document.querySelector('html')?.setAttribute('lang', translocoService.getActiveLang())
  }
}
