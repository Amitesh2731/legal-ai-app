import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, AuthStatus } from '../services/auth.service';
import { filter, map, take } from 'rxjs/operators';

export const RoleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = route.data['roles'] as Array<string>;

  return authService.authStatus$.pipe(
    filter(status => status !== AuthStatus.INITIALIZING),
    take(1),
    map(status => {
      if (status === AuthStatus.AUTHENTICATED) {
        const role = authService.userRole;
        if (role && allowedRoles.includes(role)) {
          return true;
        }
      }

      router.navigateByUrl('/auth/login', { replaceUrl: true });
      return false;
    })
  );
};
