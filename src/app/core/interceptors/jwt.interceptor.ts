import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, throwError, from } from 'rxjs';
import { catchError, filter, switchMap, take, finalize } from 'rxjs/operators';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;
let refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const jwtInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const tokenService = inject(TokenService);
  const authService = inject(AuthService);

  // Skip auth header for login, register, refresh, and public endpoints
  const skipUrls = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/forgot-password', '/auth/reset-password'];
  const shouldSkip = skipUrls.some(url => req.url.includes(url));

  if (shouldSkip) {
    if (req.url.includes('/auth/login')) {
      const cloned = req.clone({
        setHeaders: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      return next(cloned);
    }
    return next(req);
  }

  const addToken = (request: HttpRequest<any>, token: string | null) => {
    if (!token) return request;
    return request.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  };

  const token = tokenService.getAccessToken();
  let authReq = addToken(req, token);

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null);

          return authService.refreshToken().pipe(
            switchMap((response: any) => {
              isRefreshing = false;
              const newToken = tokenService.getAccessToken();
              refreshTokenSubject.next(newToken);
              return next(addToken(req, newToken));
            }),
            catchError((err) => {
              isRefreshing = false;
              authService.logout();
              return throwError(() => err);
            })
          );
        } else {
          // Wait while the token is being refreshed, then retry
          return refreshTokenSubject.pipe(
            filter(newToken => newToken !== null),
            take(1),
            switchMap((newToken) => {
              return next(addToken(req, newToken));
            })
          );
        }
      }
      return throwError(() => error);
    })
  );
};
