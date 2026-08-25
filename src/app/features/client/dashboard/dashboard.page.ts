import { Component } from '@angular/core';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { briefcaseOutline, documentTextOutline, walletOutline, addCircleOutline } from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [IonContent, IonIcon, RouterLink],
  template: `
    <ion-content [fullscreen]="true">
      <div class="dashboard-container">
        <!-- Hero Section -->
        <div class="hero-section">
          <div class="hero-content">
            <p class="hero-greeting">Welcome back,</p>
            <h1 class="hero-name">{{ userName }}</h1>
            <p class="hero-subtitle">Your legal AI dashboard</p>
          </div>
          <div class="hero-decoration"></div>
        </div>

        <!-- Quick Actions -->
        <div class="section-padding">
          <h2 class="section-title">Quick Actions</h2>
          <div class="quick-actions">
            <a class="action-card" routerLink="/client/cases">
              <div class="action-icon" style="background: rgba(var(--ion-color-primary-rgb), 0.1);">
                <ion-icon name="briefcase-outline" style="color: var(--ion-color-primary);"></ion-icon>
              </div>
              <span>My Cases</span>
            </a>
            <div class="action-card">
              <div class="action-icon" style="background: rgba(var(--ion-color-tertiary-rgb), 0.1);">
                <ion-icon name="add-circle-outline" style="color: var(--ion-color-tertiary);"></ion-icon>
              </div>
              <span>New Case</span>
            </div>
            <div class="action-card">
              <div class="action-icon" style="background: rgba(var(--ion-color-secondary-rgb), 0.1);">
                <ion-icon name="document-text-outline" style="color: var(--ion-color-secondary);"></ion-icon>
              </div>
              <span>Documents</span>
            </div>
            <a class="action-card" routerLink="/client/payments">
              <div class="action-icon" style="background: rgba(var(--ion-color-success-rgb), 0.1);">
                <ion-icon name="wallet-outline" style="color: var(--ion-color-success);"></ion-icon>
              </div>
              <span>Payments</span>
            </a>
          </div>

          <!-- Placeholder for future data -->
          <h2 class="section-title" style="margin-top: 28px;">Recent Cases</h2>
          <div class="empty-card">
            <ion-icon name="briefcase-outline" style="font-size: 40px; color: var(--ion-color-medium); opacity: 0.3;"></ion-icon>
            <p>No cases yet. Create your first case to get started.</p>
          </div>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .dashboard-container { min-height: 100%; }
    .hero-section {
      background: var(--legal-gradient-hero);
      padding: 48px 24px 40px;
      position: relative;
      overflow: hidden;
      border-radius: 0 0 var(--legal-radius-xl) var(--legal-radius-xl);
    }
    .hero-content { position: relative; z-index: 1; }
    .hero-greeting { font-size: 14px; color: rgba(255,255,255,0.7); margin: 0; font-weight: 500; }
    .hero-name { font-size: 28px; font-weight: 800; color: #fff; margin: 4px 0 6px; letter-spacing: -0.5px; }
    .hero-subtitle { font-size: 14px; color: rgba(255,255,255,0.5); margin: 0; }
    .hero-decoration {
      position: absolute; top: -30px; right: -30px;
      width: 140px; height: 140px; border-radius: 50%;
      background: rgba(255,255,255,0.05);
    }
    .section-padding { padding: 24px 20px; }
    .section-title { font-size: 18px; font-weight: 700; color: var(--ion-text-color); margin: 0 0 16px; }
    .quick-actions {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
    }
    .action-card {
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      padding: 16px 8px; background: var(--ion-card-background);
      border-radius: var(--legal-radius-md); box-shadow: var(--legal-shadow-sm);
      text-decoration: none; color: var(--ion-text-color);
      transition: transform 0.2s;
      &:active { transform: scale(0.95); }
      span { font-size: 11px; font-weight: 600; text-align: center; }
    }
    .action-icon {
      width: 44px; height: 44px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      ion-icon { font-size: 22px; }
    }
    .empty-card {
      background: var(--ion-card-background); border-radius: var(--legal-radius-md);
      padding: 40px 24px; text-align: center; box-shadow: var(--legal-shadow-sm);
      p { font-size: 14px; color: var(--ion-color-medium); margin: 12px 0 0; }
    }
  `]
})
export class ClientDashboardPage {
  userName = '';
  constructor(private authService: AuthService) {
    addIcons({ briefcaseOutline, documentTextOutline, walletOutline, addCircleOutline });
    const user = this.authService.currentUser;
    this.userName = user ? `${user.first_name} ${user.last_name}` : 'User';
  }
}
