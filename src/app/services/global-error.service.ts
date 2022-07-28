import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
    constructor(
        private router: Router,
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
        this.router.navigate([`/error`], { queryParams: { code: httpErrorCore || 'unknown' } });
        console.error(error);
    }
}
