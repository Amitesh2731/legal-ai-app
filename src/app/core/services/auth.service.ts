import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, switchMap, of, catchError } from 'rxjs';
import { ApiService } from './api.service';
import { TokenService } from './token.service';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../models/user.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(true);
  public loading$ = this.loadingSubject.asObservable();

  constructor(
    private api: ApiService,
    private tokenService: TokenService,
    private router: Router
  ) {
    this.initAuth();
  }

  private initAuth(): void {
    const token = this.tokenService.getAccessToken();
    if (token && !this.tokenService.isTokenExpired(token)) {
      this.loadCurrentUser().subscribe({
        next: () => this.loadingSubject.next(false),
        error: () => {
          this.clearAuth();
          this.loadingSubject.next(false);
        }
      });
    } else {
      const savedUser = this.tokenService.getUser();
      if (savedUser && token) {
        this.currentUserSubject.next(savedUser);
        this.isAuthenticatedSubject.next(true);
      }
      this.loadingSubject.next(false);
    }
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
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
            this.currentUserSubject.next(user);
            this.isAuthenticatedSubject.next(true);
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
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
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
      }),
      catchError(err => {
        this.logout();
        throw err;
      })
    );
  }

  logout(): void {
    this.clearAuth();
    this.router.navigateByUrl('/auth/login', { replaceUrl: true });
  }

  private clearAuth(): void {
    this.tokenService.clearAll();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
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
