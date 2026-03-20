import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  if (authService.isLoggedIn()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const loggedIn = authService.isLoggedIn();
  const isAdmin = authService.isAdmin();
  
  if (loggedIn && isAdmin) {
    return true;
  }

  const user = authService.currentUser();
  console.warn('AdminGuard denegado. LoggedIn:', loggedIn, 'IsAdmin:', isAdmin, 'User:', user);
  
  if (loggedIn) {
    router.navigate(['/']);
  } else {
    router.navigate(['/login']);
  }
  
  return false;
};
