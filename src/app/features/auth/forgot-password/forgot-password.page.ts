import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonContent, IonIcon, IonInput, IonButton, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { mailOutline, arrowBackOutline, sendOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IonContent, IonIcon, IonInput, IonButton, IonSpinner],
  template: `
    <ion-content class="auth-page" [fullscreen]="true">
      <div class="auth-container">
        <div class="auth-header animate-fade-in-up">
          <div class="auth-logo" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
            <ion-icon name="mail-outline" style="color: #fff;"></ion-icon>
          </div>
          <h1 class="auth-title">Forgot Password</h1>
          <p class="auth-subtitle">Enter your email and we'll send you a reset link</p>
        </div>

        @if (!emailSent) {
          <div class="form-card animate-fade-in-up animate-delay-2">
            <div class="input-group">
              <label class="input-label">Email Address</label>
              <div class="input-wrapper" [class.has-error]="emailError">
                <ion-icon name="mail-outline" class="input-icon"></ion-icon>
                <ion-input type="email" placeholder="Enter your registered email" [(ngModel)]="email" (ionInput)="emailError = ''" (keyup.enter)="onSubmit()"></ion-input>
              </div>
              @if (emailError) { <span class="input-error">{{ emailError }}</span> }
            </div>
            <ion-button expand="block" class="btn-primary" (click)="onSubmit()" [disabled]="loading">
              @if (loading) { <ion-spinner name="crescent" style="margin-right: 8px;"></ion-spinner> Sending... }
              @else { <ion-icon name="send-outline" slot="start"></ion-icon> Send Reset Link }
            </ion-button>
          </div>
        } @else {
          <div class="form-card animate-fade-in-up" style="text-align: center;">
            <div style="width: 64px; height: 64px; border-radius: 50%; background: rgba(var(--ion-color-success-rgb), 0.1); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
              <ion-icon name="checkmark-circle-outline" style="font-size: 32px; color: var(--ion-color-success);"></ion-icon>
            </div>
            <h3 style="font-size: 18px; font-weight: 700; margin: 0 0 8px;">Email Sent!</h3>
            <p style="font-size: 14px; color: var(--ion-color-medium); margin: 0 0 24px; line-height: 1.5;">
              We've sent a password reset link to <strong>{{ email }}</strong>. Please check your inbox.
            </p>
            <ion-button expand="block" class="btn-primary" routerLink="/auth/login">Back to Login</ion-button>
          </div>
        }

        <div class="auth-footer animate-fade-in-up animate-delay-4">
          <p><a routerLink="/auth/login"><ion-icon name="arrow-back-outline" style="vertical-align: middle; margin-right: 4px;"></ion-icon>Back to Sign In</a></p>
        </div>
      </div>
    </ion-content>
  `
})
export class ForgotPasswordPage {
  email = '';
  emailError = '';
  loading = false;
  emailSent = false;

  constructor(private authService: AuthService, private toastService: ToastService) {
    addIcons({ mailOutline, arrowBackOutline, sendOutline, checkmarkCircleOutline });
  }

  onSubmit(): void {
    if (!this.email.trim()) { this.emailError = 'Email is required'; return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) { this.emailError = 'Invalid email'; return; }

    this.loading = true;
    this.authService.forgotPassword(this.email).subscribe({
      next: () => { this.loading = false; this.emailSent = true; },
      error: (err) => {
        this.loading = false;
        this.toastService.showError(err?.message || 'Failed to send reset email.');
      }
    });
  }
}
