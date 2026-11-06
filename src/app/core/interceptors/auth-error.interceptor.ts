import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        // No expirar la sesión si el 401 proviene del intento de login o registro con credenciales inválidas
        const isAuthAttempt = req.url.includes('/api/v1/auth/login') || req.url.includes('/api/v1/auth/register');

        if ((error.status === 401 || error.status === 403) && !isAuthAttempt) {
          console.warn('Sesión no autorizada o token expirado en:', req.url);
          authService.expireSession();
        }
      }

      return throwError(() => error);
    })
  );
};
