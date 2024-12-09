import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { TranslocoService } from '@ngneat/transloco';
import { filter, firstValueFrom, take, tap, throttleTime } from 'rxjs';

const AUTO_UPDATE_ENABLED_KEY = 'autoUpdateEnabled';

@Injectable({
    providedIn: 'root'
})
export class AppUpdateService {

    constructor(
        private updates: SwUpdate,
        private snackBar: MatSnackBar,
        private translocoService: TranslocoService,
    ) { }

    init() {
        if (!this.updates.isEnabled) {
            return;
        }
        if (this.autoUpdateEnabled()) {
            this.checkForUpdates();
        }
    }

    checkForUpdates(noUpdatesFeedback: boolean = false) {
        console.log('Checking for updates...');
        this.updates.checkForUpdate();
        this.updates.versionUpdates
            .pipe(
                tap(console.debug),
                filter(x => x.type === 'VERSION_DETECTED' || x.type === 'NO_NEW_VERSION_DETECTED'),
                take(1),
            )
            .subscribe(event => {
                if (event.type === 'VERSION_DETECTED') {
                    this.showAppUpdateAlert();
                    return;
                }
                if (!noUpdatesFeedback) {
                    return;
                }
                this.showNoUpdatesAlert();
            });
    }

    async showAppUpdateAlert() {
        const action = await firstValueFrom(this.translocoService.selectTranslate('update_available.action'));
        const message = await firstValueFrom(this.translocoService.selectTranslate('update_available.message'));

        const snackBarRef = this.snackBar.open(message, action, { duration: 20000 });
        snackBarRef.onAction().subscribe({
            next: () => this.doAppUpdate(),
        });
    }

    async showNoUpdatesAlert() {
        const action = await firstValueFrom(this.translocoService.selectTranslate('no_update_available.action'));
        const message = await firstValueFrom(this.translocoService.selectTranslate('no_update_available.message'));
        this.snackBar.open(message, action);
    }

    doAppUpdate() {
        this.updates.activateUpdate().then(() => document.location.reload());
    }

    autoUpdateEnabled() {
        const enabled = localStorage.getItem(AUTO_UPDATE_ENABLED_KEY);
        if (enabled === null) {
            return true;
        }
        return enabled === 'true';
    }

    setEnableAutoUpdate(enabled: boolean) {
        localStorage.setItem(AUTO_UPDATE_ENABLED_KEY, String(enabled));
    }
}
