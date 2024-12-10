import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
    constructor(
        private snackBar: MatSnackBar,
    ) { }

    handleError(error: any) {
        if (error instanceof Error && error.message.includes("ExpressionChangedAfterItHasBeenCheckedError")) {
            console.warn(error);
            return;
        }
        let httpErrorCore: string | undefined;
        if (error instanceof HttpErrorResponse) {
            if (
                error.status === 0
                || error.status === 404
                || error.status === 500
            ) {
                httpErrorCore = 'http_' + error.status;
            } else {
                httpErrorCore = 'http_unknown';
            }
        }
        console.error(error);
        this.snackBar.open(`Error: ${httpErrorCore ?? error.message}`, undefined, { duration: 5000, politeness: 'assertive' });
    }
}
