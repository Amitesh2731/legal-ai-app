import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../services/token.service';

export const AuthGuard: CanActivateFn = (route, state) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  if (tokenService.isLoggedIn()) {
    return true;
  }

  router.navigateByUrl('/auth/login', { replaceUrl: true });
  return false;
};

export const GuestGuard: CanActivateFn = (route, state) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  if (!tokenService.isLoggedIn()) {
    return true;
  }

  // If already logged in, redirect to dashboard
  const role = tokenService.getUserRole();
  const redirectUrl = role === 'advocate' ? '/advocate/dashboard' : '/client/dashboard';
  router.navigateByUrl(redirectUrl, { replaceUrl: true });
  return false;
};
