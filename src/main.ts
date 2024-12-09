import { enableProdMode, ErrorHandler, importProvidersFrom } from '@angular/core';
import { environment } from './environments/environment';
import { AppComponent } from './app/components/app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { TranslocoRootModule } from './app/transloco-root.module';
import { withInterceptorsFromDi, provideHttpClient } from '@angular/common/http';
import { ServiceWorkerModule } from '@angular/service-worker';
import { routes } from './app/app-routing';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { AppUpdateService } from './app/services/update.service';
import { GlobalErrorHandler } from './app/services/global-error.service';
import { TranslocoService } from '@ngneat/transloco';
import { ThemeService } from './app/services/theme.service';
import { provideRouter } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';

async function main(): Promise<void> {


    if (environment.production) {
        enableProdMode();
    }

    const app = await bootstrapApplication(AppComponent, {
        providers: [
            provideRouter(routes),
            importProvidersFrom(BrowserModule, ServiceWorkerModule.register('ngsw-worker.js', {
                enabled: environment.production,
                registrationStrategy: 'registerImmediately',
            }),
                TranslocoRootModule,
                MatSnackBarModule,
            ),
            {
                provide: ErrorHandler,
                useClass: GlobalErrorHandler,
            },
            AppUpdateService,
            provideHttpClient(withInterceptorsFromDi()),
            provideAnimations()
        ],
    });
    const translocoService = app.injector.get(TranslocoService);
    const appUpdateService = app.injector.get(AppUpdateService);
    const themeService = app.injector.get(ThemeService);
    themeService.init();
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

main().catch(err => console.error(err));
