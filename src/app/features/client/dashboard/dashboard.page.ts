import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon, IonSkeletonText, IonRefresher, IonRefresherContent } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  briefcaseOutline, documentTextOutline, addOutline, 
  notificationsOutline, chevronForwardOutline, timeOutline, checkmarkCircleOutline
} from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth.service';
import { DashboardService } from '../../../core/services/dashboard.service';
import { RouterLink } from '@angular/router';
import { User } from '../../../core/models/user.model';
import { ClientDashboardStats } from '../../../core/models/dashboard.model';
import { CaseSummary } from '../../../core/models/case.model';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [
    CommonModule, IonContent, IonIcon, IonSkeletonText, IonRefresher, IonRefresherContent, 
    RouterLink, EmptyStateComponent, ErrorStateComponent
  ],
  template: `
    <ion-content [fullscreen]="true" class="main-background">
      <ion-refresher slot="fixed" (ionRefresh)="doRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div class="dashboard-wrapper">
        
        <!-- Header Section -->
        <header class="dashboard-header animate-fade-in-up">
          <div class="header-top">
            <div class="user-greeting">
              <div class="avatar">
                @if (user?.profile_photo) {
                  <img [src]="user?.profile_photo" alt="Profile Photo" />
                } @else {
                  <span class="initials">{{ getInitials() }}</span>
                }
              </div>
              <div class="greeting-text">
                <span class="greeting-time">{{ greetingTime }},</span>
                <h1 class="user-name">{{ user?.first_name || 'Client' }}</h1>
              </div>
            </div>
            <button class="notification-btn" aria-label="Notifications" routerLink="/client/notifications">
              <ion-icon name="notifications-outline"></ion-icon>
              <!-- Optional: Add a badge here if there are unread notifications -->
            </button>
          </div>
          <p class="header-subtitle">Here is what is happening with your legal matters.</p>
        </header>

        <!-- Error State -->
        @if (error) {
          <div class="section-container animate-fade-in-up">
            <app-error-state 
              title="Unable to load dashboard" 
              [description]="error" 
              (retry)="loadDashboard()">
            </app-error-state>
          </div>
        }

        @if (!error) {
          <!-- Stats Overview -->
          <section class="dashboard-section animate-fade-in-up animate-delay-1">
            <h2 class="section-title">Overview</h2>
            
            <div class="stats-grid">
              <!-- Active Cases -->
              <div class="stat-card">
                <div class="stat-icon bg-primary-light">
                  <ion-icon name="briefcase-outline" class="text-primary"></ion-icon>
                </div>
                <div class="stat-details">
                  @if (loading) {
                    <ion-skeleton-text animated style="width: 40%; height: 28px; margin-bottom: 4px;"></ion-skeleton-text>
                    <ion-skeleton-text animated style="width: 70%; height: 16px;"></ion-skeleton-text>
                  } @else {
                    <h3 class="stat-value">{{ stats?.active_cases || 0 }}</h3>
                    <span class="stat-label">Active Cases</span>
                  }
                </div>
              </div>
              
              <!-- Completed Cases -->
              <div class="stat-card">
                <div class="stat-icon bg-success-light">
                  <ion-icon name="checkmark-circle-outline" class="text-success"></ion-icon>
                </div>
                <div class="stat-details">
                  @if (loading) {
                    <ion-skeleton-text animated style="width: 40%; height: 28px; margin-bottom: 4px;"></ion-skeleton-text>
                    <ion-skeleton-text animated style="width: 70%; height: 16px;"></ion-skeleton-text>
                  } @else {
                    <h3 class="stat-value">{{ stats?.completed_cases || 0 }}</h3>
                    <span class="stat-label">Completed Cases</span>
                  }
                </div>
              </div>
              
              <!-- Pending Cases -->
              <div class="stat-card">
                <div class="stat-icon bg-warning-light">
                  <ion-icon name="time-outline" class="text-warning"></ion-icon>
                </div>
                <div class="stat-details">
                  @if (loading) {
                    <ion-skeleton-text animated style="width: 40%; height: 28px; margin-bottom: 4px;"></ion-skeleton-text>
                    <ion-skeleton-text animated style="width: 70%; height: 16px;"></ion-skeleton-text>
                  } @else {
                    <h3 class="stat-value">{{ stats?.pending_cases || 0 }}</h3>
                    <span class="stat-label">Pending Cases</span>
                  }
                </div>
              </div>
              
              <!-- Documents -->
              <div class="stat-card">
                <div class="stat-icon bg-info-light">
                  <ion-icon name="document-text-outline" class="text-info"></ion-icon>
                </div>
                <div class="stat-details">
                  @if (loading) {
                    <ion-skeleton-text animated style="width: 40%; height: 28px; margin-bottom: 4px;"></ion-skeleton-text>
                    <ion-skeleton-text animated style="width: 70%; height: 16px;"></ion-skeleton-text>
                  } @else {
                    <h3 class="stat-value">{{ stats?.total_documents || 0 }}</h3>
                    <span class="stat-label">Documents</span>
                  }
                </div>
              </div>
            </div>
          </section>

          <!-- Quick Actions -->
          <section class="dashboard-section animate-fade-in-up animate-delay-2">
            <h2 class="section-title">Quick Actions</h2>
            <div class="quick-actions-grid">
              <button class="action-btn primary" routerLink="/client/cases/new">
                <ion-icon name="add-outline"></ion-icon>
                <span>New Case</span>
              </button>
              <button class="action-btn secondary" routerLink="/client/cases">
                <ion-icon name="document-text-outline"></ion-icon>
                <span>Upload Document</span>
              </button>
            </div>
          </section>

          <!-- Recent Cases -->
          <section class="dashboard-section animate-fade-in-up animate-delay-3">
            <div class="section-header">
              <h2 class="section-title">Recent Cases</h2>
              <a routerLink="/client/cases" class="view-all">View all</a>
            </div>

            <div class="cases-list">
              @if (loading) {
                <!-- Skeleton for cases -->
                @for (i of [1,2,3]; track i) {
                  <div class="case-card skeleton">
                    <div class="case-header">
                      <ion-skeleton-text animated style="width: 60%; height: 16px;"></ion-skeleton-text>
                      <ion-skeleton-text animated style="width: 60px; height: 24px; border-radius: 12px;"></ion-skeleton-text>
                    </div>
                    <ion-skeleton-text animated style="width: 80%; height: 20px; margin-top: 8px;"></ion-skeleton-text>
                    <ion-skeleton-text animated style="width: 40%; height: 14px; margin-top: 12px;"></ion-skeleton-text>
                  </div>
                }
              } @else if (recentCases.length === 0) {
                <app-empty-state 
                  icon="briefcase-outline"
                  title="No cases yet"
                  description="Start your first legal matter and keep everything organized in one secure place."
                  actionLabel="Create New Case"
                  actionIcon="add-outline"
                  (action)="createNewCase()">
                </app-empty-state>
              } @else {
                @for (caseItem of recentCases; track caseItem.id) {
                  <a [routerLink]="['/client/cases', caseItem.id]" class="case-card">
                    <div class="case-header">
                      <span class="case-number">{{ caseItem.case_number }}</span>
                      <span class="status-badge" [ngClass]="'status-' + caseItem.status.toLowerCase()">
                        {{ caseItem.status }}
                      </span>
                    </div>
                    <h3 class="case-title">{{ caseItem.title }}</h3>
                    <div class="case-footer">
                      <span class="case-date">Last updated {{ formatDate(caseItem.updated_at) }}</span>
                      <ion-icon name="chevron-forward-outline"></ion-icon>
                    </div>
                  </a>
                }
              }
            </div>
          </section>
        }
      </div>
    </ion-content>
  `,
  styles: [`
    .main-background {
      --background: #f0f4f8;
    }

    .dashboard-wrapper {
      padding: var(--spacing-6) var(--spacing-5) var(--spacing-10);
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
    }

    /* Header */
    .dashboard-header {
      margin-bottom: var(--spacing-8);
    }
    
    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-2);
    }

    .user-greeting {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
    }

    .avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--app-primary);
      color: var(--app-surface);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .initials {
        font-size: 16px;
        font-weight: 600;
        letter-spacing: 0.5px;
      }
    }

    .greeting-text {
      display: flex;
      flex-direction: column;
    }

    .greeting-time {
      font-size: var(--text-caption);
      color: var(--app-text-secondary);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }

    .user-name {
      font-size: var(--text-page-title);
      font-weight: 700;
      color: var(--app-text-primary);
      margin: 0;
      letter-spacing: -0.5px;
    }

    .header-subtitle {
      font-size: var(--text-body);
      color: var(--app-text-secondary);
      margin: 0;
    }

    .notification-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--app-surface);
      border: 1px solid var(--app-border);
      color: var(--app-text-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      
      ion-icon {
        font-size: 20px;
      }
      
      &:active {
        background: var(--app-surface-secondary);
      }
    }

    /* Sections */
    .dashboard-section {
      margin-bottom: var(--spacing-8);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: var(--spacing-4);
    }

    .section-title {
      font-size: var(--text-section-title);
      font-weight: 600;
      color: var(--app-text-primary);
      margin: 0 0 var(--spacing-4) 0;
    }

    .view-all {
      font-size: var(--text-secondary);
      color: var(--app-info);
      font-weight: 500;
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
      }
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--spacing-4);
    }

    .stat-card {
      background: var(--app-surface);
      border: 1px solid var(--app-border);
      border-radius: var(--radius-lg);
      padding: var(--spacing-4);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-3);
      box-shadow: var(--shadow-sm);
    }

    .stat-icon {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      
      ion-icon {
        font-size: 18px;
      }
      
      &.bg-primary-light { background: #eff6ff; }
      .text-primary { color: #3b82f6; }
      
      &.bg-success-light { background: #f0fdf4; }
      .text-success { color: #10b981; }
      
      &.bg-warning-light { background: #fffbeb; }
      .text-warning { color: #f59e0b; }
      
      &.bg-info-light { background: #f3e8ff; }
      .text-info { color: #a855f7; }
    }

    .stat-details {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: var(--app-text-primary);
      margin: 0 0 2px;
      letter-spacing: -0.5px;
    }

    .stat-label {
      font-size: var(--text-caption);
      color: var(--app-text-secondary);
      font-weight: 500;
    }

    /* Quick Actions */
    .quick-actions-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--spacing-4);
    }

    .action-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-2);
      height: 48px;
      border-radius: var(--radius-md);
      font-size: var(--text-body);
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      
      ion-icon {
        font-size: 20px;
      }
      
      &.primary {
        background: var(--app-primary);
        color: var(--app-surface);
        border: none;
        
        &:active { background: var(--app-primary-light); }
      }
      
      &.secondary {
        background: var(--app-surface);
        color: var(--app-text-primary);
        border: 1px solid var(--app-border);
        box-shadow: var(--shadow-sm);
        
        &:active { background: var(--app-surface-secondary); }
      }
    }

    /* Case Cards */
    .cases-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-3);
    }

    .case-card {
      display: block;
      background: var(--app-surface);
      border: 1px solid var(--app-border);
      border-radius: var(--radius-lg);
      padding: var(--spacing-4);
      text-decoration: none;
      box-shadow: var(--shadow-sm);
      transition: all 0.2s ease;
      
      &:active {
        transform: scale(0.98);
        background: var(--app-surface-secondary);
      }
      
      &.skeleton { pointer-events: none; }
    }

    .case-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-2);
    }

    .case-number {
      font-size: var(--text-caption);
      color: var(--app-text-muted);
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .case-title {
      font-size: var(--text-card-title);
      font-weight: 600;
      color: var(--app-text-primary);
      margin: 0 0 var(--spacing-3);
      line-height: 1.4;
    }

    .case-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .case-date {
        font-size: var(--text-caption);
        color: var(--app-text-secondary);
      }
      
      ion-icon {
        color: var(--app-text-muted);
        font-size: 16px;
      }
    }

    @media (min-width: 768px) {
      .stats-grid {
        grid-template-columns: repeat(4, 1fr);
      }
      .quick-actions-grid {
        grid-template-columns: repeat(4, 1fr);
      }
    }
  `]
})
export class ClientDashboardPage implements OnInit {
  user: User | null = null;
  stats: ClientDashboardStats | null = null;
  recentCases: CaseSummary[] = [];
  
  loading = true;
  error = '';
  greetingTime = 'Good morning';

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService
  ) {
    addIcons({ briefcaseOutline, documentTextOutline, addOutline, notificationsOutline, chevronForwardOutline, timeOutline, checkmarkCircleOutline });
  }

  ngOnInit() {
    this.user = this.authService.currentUser;
    this.setGreeting();
    this.loadDashboard();
  }

  setGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) this.greetingTime = 'Good morning';
    else if (hour < 18) this.greetingTime = 'Good afternoon';
    else this.greetingTime = 'Good evening';
  }

  getInitials(): string {
    if (!this.user) return 'C';
    return `${this.user.first_name?.charAt(0) || ''}${this.user.last_name?.charAt(0) || ''}`.toUpperCase() || 'C';
  }

  loadDashboard(event?: any) {
    this.loading = true;
    this.error = '';
    
    // In a real app we'd use forkJoin, but we'll fetch separately to handle partial failures if needed.
    this.dashboardService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats as ClientDashboardStats;
        this.fetchCases(event);
      },
      error: (err) => {
        this.error = 'Failed to load statistics. Please check your connection.';
        this.loading = false;
        if (event) event.target.complete();
      }
    });
  }

  fetchCases(event?: any) {
    this.dashboardService.getRecentCases().subscribe({
      next: (cases) => {
        this.recentCases = cases;
        this.loading = false;
        if (event) event.target.complete();
      },
      error: (err) => {
        // Not throwing a full error state just for cases failing, but we could.
        this.recentCases = [];
        this.loading = false;
        if (event) event.target.complete();
      }
    });
  }

  doRefresh(event: any) {
    this.loadDashboard(event);
  }

  createNewCase() {
    // Programmatic routing if needed, though button uses routerLink
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
