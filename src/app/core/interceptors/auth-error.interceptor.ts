import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

function isProtectedRequest(url: string): boolean {
  return url.includes('/api/v1/account/')
    || url.includes('/api/v1/admin/')
    || url.includes('/api/v1/orders/admin')
    || url.includes('/api/v1/reviews/admin')
    || url.includes('/api/v1/payments');
}

export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse
        && (error.status === 401 || error.status === 403)
        && isProtectedRequest(req.url)
      ) {
        authService.expireSession();
      }

      return throwError(() => error);
    })
  );
};
