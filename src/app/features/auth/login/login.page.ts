import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonContent, IonIcon, IonInput, IonButton, IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { scaleOutline, mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline, logInOutline } from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IonContent, IonIcon, IonInput, IonButton, IonSpinner],
  template: `
    <ion-content class="auth-page" [fullscreen]="true">
      <div class="auth-container">

        <!-- Logo & Header -->
        <div class="auth-header animate-fade-in-up">
          <div class="auth-logo">
            <ion-icon name="scale-outline"></ion-icon>
          </div>
          <h1 class="auth-title">Welcome back</h1>
          <p class="auth-subtitle">Sign in to continue to your account.</p>
        </div>

        <!-- Login Form -->
        <div class="form-card animate-fade-in-up animate-delay-2">
          
          <!-- Email -->
          <div class="input-group">
            <label class="input-label">Email address</label>
            <div class="input-wrapper" [class.has-error]="emailError">
              <ion-input
                type="email"
                placeholder="Enter your email address"
                [(ngModel)]="email"
                (ionInput)="clearErrors()"
                (ionBlur)="validateEmail()"
                [disabled]="loading"
              ></ion-input>
            </div>
            @if (emailError) {
              <span class="input-error">{{ emailError }}</span>
            }
          </div>

          <!-- Password -->
          <div class="input-group">
            <label class="input-label">Password</label>
            <div class="input-wrapper" [class.has-error]="passwordError">
              <ion-input
                [type]="showPassword ? 'text' : 'password'"
                placeholder="Enter your password"
                [(ngModel)]="password"
                (ionInput)="clearErrors()"
                (keyup.enter)="onLogin()"
                [disabled]="loading"
              ></ion-input>
              <button class="toggle-password" (click)="showPassword = !showPassword" type="button" aria-label="Toggle password visibility">
                <ion-icon [name]="showPassword ? 'eye-off-outline' : 'eye-outline'"></ion-icon>
              </button>
            </div>
            @if (passwordError) {
              <span class="input-error">{{ passwordError }}</span>
            }
          </div>

          <!-- Forgot Password Link -->
          <div class="auth-link">
            <a routerLink="/auth/forgot-password">Forgot password?</a>
          </div>

          <!-- Login Button -->
          <ion-button
            expand="block"
            class="btn-primary"
            (click)="onLogin()"
            [disabled]="loading"
          >
            @if (loading) {
              <ion-spinner name="crescent" style="margin-right: 8px; width: 16px; height: 16px;"></ion-spinner>
              Signing in...
            } @else {
              Sign in
            }
          </ion-button>
        </div>

        <!-- Register Link -->
        <div class="auth-footer animate-fade-in-up animate-delay-4">
          <p>Don't have an account? <a routerLink="/auth/register">Create account</a></p>
        </div>

      </div>
    </ion-content>
  `,
  styles: [`
    ion-spinner { color: inherit; }
  `]
})
export class LoginPage {
  email = '';
  password = '';
  showPassword = false;
  loading = false;

  emailError = '';
  passwordError = '';

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {
    addIcons({ scaleOutline, mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline, logInOutline });
  }

  clearErrors(): void {
    this.emailError = '';
    this.passwordError = '';
  }

  validateEmail(): void {
    if (!this.email.trim()) {
      // Don't show error immediately on empty blur if they just tabbed through, but for strictness:
      // this.emailError = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      this.emailError = 'Please enter a valid email address.';
    } else {
      this.emailError = '';
    }
  }

  validate(): boolean {
    let valid = true;

    if (!this.email.trim()) {
      this.emailError = 'Email is required';
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      this.emailError = 'Please enter a valid email address';
      valid = false;
    }

    if (!this.password) {
      this.passwordError = 'Password is required';
      valid = false;
    } else if (this.password.length < 6) {
      this.passwordError = 'Password must be at least 6 characters';
      valid = false;
    }

    return valid;
  }

  onLogin(): void {
    if (!this.validate()) return;
    this.loading = true;

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        this.loading = false;
        this.toastService.showSuccess('Welcome back!');
        const role = response.user?.role?.name || 'client';
        const redirectUrl = this.authService.getRedirectUrlForRole(role);
        this.router.navigateByUrl(redirectUrl, { replaceUrl: true });
      },
      error: (err) => {
        this.loading = false;
        const message = err?.message || 'Login failed. Please check your credentials.';
        this.toastService.showError(message);
      }
    });
  }
}
