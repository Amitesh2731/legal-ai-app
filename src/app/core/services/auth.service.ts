import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, switchMap, of, catchError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService } from './api.service';
import { TokenService } from './token.service';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../models/user.model';
import { Router } from '@angular/router';

export enum AuthStatus {
  INITIALIZING = 'INITIALIZING',
  AUTHENTICATED = 'AUTHENTICATED',
  UNAUTHENTICATED = 'UNAUTHENTICATED'
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private authStatusSubject = new BehaviorSubject<AuthStatus>(AuthStatus.INITIALIZING);
  public authStatus$ = this.authStatusSubject.asObservable();

  constructor(
    private api: ApiService,
    private tokenService: TokenService,
    private router: Router
  ) {
    // Auth initialization is now triggered explicitly by APP_INITIALIZER
  }

  public initAuth(): Promise<void> {
    return new Promise((resolve) => {
      this.authStatusSubject.next(AuthStatus.INITIALIZING);

      const token = this.tokenService.getAccessToken();
      const refreshToken = this.tokenService.getRefreshToken();

      if (!token) {
        this.setUnauthenticated();
        resolve();
        return;
      }

      if (this.tokenService.isTokenExpired(token) && !refreshToken) {
        this.clearAuth();
        this.setUnauthenticated();
        resolve();
        return;
      }

      this.loadCurrentUser().subscribe({
        next: (user) => {
          this.setAuthenticated(user);
          resolve();
        },
        error: (err: HttpErrorResponse) => {
          // If a 401 is returned here, it means the token was invalid AND refresh failed (interceptor handles refresh)
          if (err.status === 401) {
            this.clearAuth();
            this.setUnauthenticated();
          } else {
            // Temporary error (500, network error, timeout, CORS). Preserve session!
            const savedUser = this.tokenService.getUser();
            if (savedUser) {
              this.setAuthenticated(savedUser);
            } else {
              // If we have no cached user to fallback on, we must consider them unauthenticated for now
              this.setUnauthenticated();
            }
          }
          resolve();
        }
      });
    });
  }

  private setAuthenticated(user: User): void {
    this.currentUserSubject.next(user);
    this.authStatusSubject.next(AuthStatus.AUTHENTICATED);
  }

  private setUnauthenticated(): void {
    this.currentUserSubject.next(null);
    this.authStatusSubject.next(AuthStatus.UNAUTHENTICATED);
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return this.authStatusSubject.value === AuthStatus.AUTHENTICATED;
  }

  get isInitializing(): boolean {
    return this.authStatusSubject.value === AuthStatus.INITIALIZING;
  }

  get userRole(): string | null {
    const role = this.currentUser?.role;
    return (typeof role === 'string' ? role : role?.name) || this.tokenService.getUserRole();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.api.post<any>('/auth/login', credentials).pipe(
      switchMap(response => {
        this.tokenService.setTokens(response.access_token, response.refresh_token);
        return this.loadCurrentUser().pipe(
          tap(user => {
            this.tokenService.setUser(user);
            this.setAuthenticated(user);
          }),
          switchMap(user => of({
            access_token: response.access_token,
            refresh_token: response.refresh_token,
            token_type: response.token_type,
            user: user
          }))
        );
      })
    );
  }

  register(data: RegisterRequest): Observable<any> {
    return this.api.post('/auth/register', data);
  }

  registerAdvocate(formData: FormData): Observable<any> {
    return this.api.postForm('/advocates/register', formData);
  }

  forgotPassword(email: string): Observable<any> {
    return this.api.post('/auth/forgot-password', { email });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.api.post('/auth/reset-password', { token, new_password: newPassword });
  }

  loadCurrentUser(): Observable<User> {
    return this.api.get<User>('/auth/me').pipe(
      tap(user => {
        this.tokenService.setUser(user);
      })
    );
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.tokenService.getRefreshToken();
    if (!refreshToken) {
      return of(null as any);
    }

    return this.api.post<AuthResponse>('/auth/refresh', { refresh_token: refreshToken }).pipe(
      tap(response => {
        this.tokenService.setAccessToken(response.access_token);
        if (response.refresh_token) {
          this.tokenService.setTokens(response.access_token, response.refresh_token);
        }
      })
    );
  }

  logout(): void {
    this.clearAuth();
    this.setUnauthenticated();
    this.router.navigateByUrl('/auth/login', { replaceUrl: true });
  }

  private clearAuth(): void {
    this.tokenService.clearAll();
  }

  getRedirectUrlForRole(role: string): string {
    switch (role) {
      case 'client': return '/client/dashboard';
      case 'advocate': return '/advocate/dashboard';
      case 'admin': return '/client/dashboard'; // Admin uses web portal
      default: return '/auth/login';
    }
  }
}
