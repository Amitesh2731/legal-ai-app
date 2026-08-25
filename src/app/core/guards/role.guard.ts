import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../services/token.service';

export const RoleGuard: CanActivateFn = (route, state) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  const allowedRoles = route.data['roles'] as Array<string>;
  const role = tokenService.getUserRole();

  if (role && allowedRoles.includes(role)) {
    return true;
  }

  router.navigateByUrl('/auth/login', { replaceUrl: true });
  return false;
};
