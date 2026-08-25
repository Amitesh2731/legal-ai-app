import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, AuthStatus } from '../services/auth.service';
import { filter, map, take } from 'rxjs/operators';

export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.authStatus$.pipe(
    filter(status => status !== AuthStatus.INITIALIZING),
    take(1),
    map(status => {
      if (status === AuthStatus.AUTHENTICATED) {
        return true;
      }
      router.navigateByUrl('/auth/login', { replaceUrl: true });
      return false;
    })
  );
};

export const GuestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.authStatus$.pipe(
    filter(status => status !== AuthStatus.INITIALIZING),
    take(1),
    map(status => {
      if (status === AuthStatus.UNAUTHENTICATED) {
        return true;
      }

      const role = authService.userRole;
      const redirectUrl = authService.getRedirectUrlForRole(role || '');
      router.navigateByUrl(redirectUrl, { replaceUrl: true });
      return false;
    })
  );
};
