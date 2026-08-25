import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonIcon, IonInput, IonButton, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { scaleOutline, mailOutline, lockClosedOutline, personOutline, callOutline, locationOutline, eyeOutline, eyeOffOutline, personAddOutline, arrowBackOutline, briefcaseOutline } from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IonContent, IonIcon, IonInput, IonButton, IonSpinner],
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss']
})
export class RegisterPage {
  showPassword = false;
  showConfirmPassword = false;
  loading = false;
  confirmPassword = '';
  form = { 
    first_name: '', 
    last_name: '', 
    email: '', 
    phone: '', 
    city: '', 
    state: '', 
    password: '',
    role: 'client', // 'client' or 'advocate'
    bar_council_number: '',
    specialization: '',
    experience_years: null as number | null
  };
  errors: Record<string, string> = {};

  constructor(private authService: AuthService, private toastService: ToastService, private router: Router) {
    addIcons({ scaleOutline, mailOutline, lockClosedOutline, personOutline, callOutline, locationOutline, eyeOutline, eyeOffOutline, personAddOutline, arrowBackOutline, briefcaseOutline });
  }

  setRole(role: 'client' | 'advocate') {
    this.form.role = role;
    this.errors = {};
  }

  clearError(field: string): void { delete this.errors[field]; }

  getPasswordStrength(): number {
    const p = this.form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
    if (/[0-9]/.test(p) || /[^A-Za-z0-9]/.test(p)) s++;
    return s;
  }

  getPasswordStrengthText(): string {
    const s = this.getPasswordStrength();
    if (s === 0) return '';
    if (s <= 1) return 'Weak';
    if (s <= 2) return 'Fair';
    if (s <= 3) return 'Good';
    return 'Strong';
  }

  hasUppercase(p: string): boolean { return /[A-Z]/.test(p); }
  hasNumber(p: string): boolean { return /[0-9]/.test(p); }

  onRegister(): void {
    this.errors = {};
    if (!this.form.first_name.trim()) this.errors['first_name'] = 'First name is required';
    if (!this.form.last_name.trim()) this.errors['last_name'] = 'Last name is required';
    if (!this.form.email.trim()) this.errors['email'] = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email)) this.errors['email'] = 'Please enter a valid email address';
    
    if (this.form.role === 'advocate') {
      if (!this.form.bar_council_number.trim()) this.errors['bar_council_number'] = 'Bar Council Number is required';
      if (!this.form.specialization.trim()) this.errors['specialization'] = 'Specialization is required';
      if (this.form.experience_years === null || this.form.experience_years < 0) this.errors['experience_years'] = 'Valid experience is required';
    }
    if (!this.form.password) this.errors['password'] = 'Password is required';
    else if (this.form.password.length < 8) this.errors['password'] = 'Min 8 characters required';
    if (!this.confirmPassword) this.errors['confirmPassword'] = 'Please confirm password';
    else if (this.confirmPassword !== this.form.password) this.errors['confirmPassword'] = 'Passwords do not match';
    if (Object.keys(this.errors).length > 0) return;

    this.loading = true;
    this.authService.register(this.form).subscribe({
      next: () => {
        this.loading = false;
        this.toastService.showSuccess('Account created! Please sign in.');
        this.router.navigateByUrl('/auth/login', { replaceUrl: true });
      },
      error: (err) => {
        this.loading = false;
        this.toastService.showError(err?.message || 'Registration failed.');
      }
    });
  }
}
