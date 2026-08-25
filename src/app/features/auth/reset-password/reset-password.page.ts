import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonContent, IonIcon, IonInput, IonButton, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { lockClosedOutline, eyeOutline, eyeOffOutline, shieldCheckmarkOutline } from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IonContent, IonIcon, IonInput, IonButton, IonSpinner],
  template: `
    <ion-content class="auth-page" [fullscreen]="true">
      <div class="auth-container">
        <div class="auth-header animate-fade-in-up">
          <div class="auth-logo" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
            <ion-icon name="shield-checkmark-outline" style="color: #fff;"></ion-icon>
          </div>
          <h1 class="auth-title">Reset Password</h1>
          <p class="auth-subtitle">Create a new secure password for your account</p>
        </div>

        <div class="form-card animate-fade-in-up animate-delay-2">
          <div class="input-group">
            <label class="input-label">New Password</label>
            <div class="input-wrapper" [class.has-error]="errors['password']">
              <ion-icon name="lock-closed-outline" class="input-icon"></ion-icon>
              <ion-input [type]="showPassword ? 'text' : 'password'" placeholder="Enter new password" [(ngModel)]="password" (ionInput)="clearError('password')"></ion-input>
              <button class="toggle-password" (click)="showPassword = !showPassword"><ion-icon [name]="showPassword ? 'eye-off-outline' : 'eye-outline'"></ion-icon></button>
            </div>
            @if (errors['password']) { <span class="input-error">{{ errors['password'] }}</span> }
          </div>

          <div class="input-group">
            <label class="input-label">Confirm New Password</label>
            <div class="input-wrapper" [class.has-error]="errors['confirm']">
              <ion-icon name="lock-closed-outline" class="input-icon"></ion-icon>
              <ion-input [type]="showConfirm ? 'text' : 'password'" placeholder="Confirm new password" [(ngModel)]="confirmPassword" (ionInput)="clearError('confirm')"></ion-input>
              <button class="toggle-password" (click)="showConfirm = !showConfirm"><ion-icon [name]="showConfirm ? 'eye-off-outline' : 'eye-outline'"></ion-icon></button>
            </div>
            @if (errors['confirm']) { <span class="input-error">{{ errors['confirm'] }}</span> }
          </div>

          <ion-button expand="block" class="btn-primary" (click)="onReset()" [disabled]="loading">
            @if (loading) { <ion-spinner name="crescent" style="margin-right: 8px;"></ion-spinner> Resetting... }
            @else { Reset Password }
          </ion-button>
        </div>

        <div class="auth-footer"><p><a routerLink="/auth/login">Back to Sign In</a></p></div>
      </div>
    </ion-content>
  `
})
export class ResetPasswordPage implements OnInit {
  token = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  showConfirm = false;
  loading = false;
  errors: Record<string, string> = {};

  constructor(private route: ActivatedRoute, private router: Router, private authService: AuthService, private toastService: ToastService) {
    addIcons({ lockClosedOutline, eyeOutline, eyeOffOutline, shieldCheckmarkOutline });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => { this.token = params['token'] || ''; });
  }

  clearError(field: string): void { delete this.errors[field]; }

  onReset(): void {
    this.errors = {};
    if (!this.password) this.errors['password'] = 'Password is required';
    else if (this.password.length < 8) this.errors['password'] = 'Min 8 characters';
    if (!this.confirmPassword) this.errors['confirm'] = 'Please confirm password';
    else if (this.confirmPassword !== this.password) this.errors['confirm'] = 'Passwords do not match';
    if (Object.keys(this.errors).length > 0) return;

    this.loading = true;
    this.authService.resetPassword(this.token, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.toastService.showSuccess('Password reset successful! Please sign in.');
        this.router.navigateByUrl('/auth/login', { replaceUrl: true });
      },
      error: (err) => {
        this.loading = false;
        this.toastService.showError(err?.message || 'Reset failed. Link may have expired.');
      }
    });
  }
}
