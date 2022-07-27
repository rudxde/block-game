import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoService } from '@ngneat/transloco';
import { firstValueFrom } from 'rxjs';

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
        this.updates.versionUpdates.subscribe(event => {
            this.showAppUpdateAlert();
        });
    }

    async showAppUpdateAlert() {
        const action = await firstValueFrom(this.translocoService.selectTranslate('update_available.action'));
        const message = await firstValueFrom(this.translocoService.selectTranslate('update_available.message'));

        const snackBarRef = this.snackBar.open(message, action, { duration: undefined });
        snackBarRef.onAction().subscribe({
            next: () => this.doAppUpdate(),
        });
    }

    doAppUpdate() {
        this.updates.activateUpdate().then(() => document.location.reload());
    }
}
