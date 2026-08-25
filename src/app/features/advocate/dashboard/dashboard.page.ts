import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon, IonSkeletonText, IonRefresher, IonRefresherContent, IonMenuButton, IonButtons } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  briefcaseOutline, documentTextOutline, chatbubblesOutline, 
  notificationsOutline, chevronForwardOutline, timeOutline, checkmarkCircleOutline,
  alertCircleOutline, listOutline
} from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth.service';
import { DashboardService } from '../../../core/services/dashboard.service';
import { RouterLink } from '@angular/router';
import { User } from '../../../core/models/user.model';
import { AdvocateDashboardStats, RecentActivity } from '../../../core/models/dashboard.model';
import { CaseSummary } from '../../../core/models/case.model';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';

@Component({
  selector: 'app-advocate-dashboard',
  standalone: true,
  imports: [
    CommonModule, IonContent, IonIcon, IonSkeletonText, IonRefresher, IonRefresherContent, 
    RouterLink, EmptyStateComponent, ErrorStateComponent, IonMenuButton, IonButtons
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
              <ion-buttons class="ion-hide-lg-up">
                <ion-menu-button color="primary"></ion-menu-button>
              </ion-buttons>
              <div class="avatar">
                @if (user?.profile_photo) {
                  <img [src]="user?.profile_photo" alt="Profile Photo" />
                } @else {
                  <span class="initials">{{ getInitials() }}</span>
                }
              </div>
              <div class="greeting-text">
                <span class="greeting-time">{{ greetingTime }},</span>
                <h1 class="user-name">{{ user?.first_name || 'Advocate' }}</h1>
              </div>
            </div>
            <button class="notification-btn" aria-label="Notifications" routerLink="/advocate/notifications">
              <ion-icon name="notifications-outline"></ion-icon>
            </button>
          </div>
          <p class="header-subtitle">Here is your practice overview.</p>
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
              <!-- Assigned Cases -->
              <div class="stat-card">
                <div class="stat-icon bg-info-light">
                  <ion-icon name="listOutline" class="text-info"></ion-icon>
                </div>
                <div class="stat-details">
                  @if (loading) {
                    <ion-skeleton-text animated style="width: 40%; height: 28px; margin-bottom: 4px;"></ion-skeleton-text>
                    <ion-skeleton-text animated style="width: 70%; height: 16px;"></ion-skeleton-text>
                  } @else {
                    <h3 class="stat-value">{{ stats?.assigned_cases || 0 }}</h3>
                    <span class="stat-label">Assigned</span>
                  }
                </div>
              </div>
              
              <!-- Pending Reviews (High Priority) -->
              <div class="stat-card highlight">
                <div class="stat-icon bg-danger-light">
                  <ion-icon name="alert-circle-outline" class="text-danger"></ion-icon>
                </div>
                <div class="stat-details">
                  @if (loading) {
                    <ion-skeleton-text animated style="width: 40%; height: 28px; margin-bottom: 4px;"></ion-skeleton-text>
                    <ion-skeleton-text animated style="width: 70%; height: 16px;"></ion-skeleton-text>
                  } @else {
                    <h3 class="stat-value text-danger">{{ stats?.pending_reviews || 0 }}</h3>
                    <span class="stat-label font-medium">Pending Reviews</span>
                  }
                </div>
              </div>
              
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
                    <span class="stat-label">Completed</span>
                  }
                </div>
              </div>
            </div>
          </section>

          <!-- Pending Reviews Section -->
          <section class="dashboard-section animate-fade-in-up animate-delay-2">
            <div class="section-header">
              <h2 class="section-title">Requires Attention</h2>
            </div>

            <div class="cases-list">
              @if (loading) {
                <div class="case-card skeleton">
                  <div class="case-header">
                    <ion-skeleton-text animated style="width: 60%; height: 16px;"></ion-skeleton-text>
                    <ion-skeleton-text animated style="width: 60px; height: 24px; border-radius: 12px;"></ion-skeleton-text>
                  </div>
                  <ion-skeleton-text animated style="width: 80%; height: 20px; margin-top: 8px;"></ion-skeleton-text>
                  <ion-skeleton-text animated style="width: 40%; height: 14px; margin-top: 12px;"></ion-skeleton-text>
                </div>
              } @else if (pendingReviews.length === 0) {
                <app-empty-state 
                  icon="checkmark-circle-outline"
                  title="All caught up!"
                  description="You have no pending reviews or immediate tasks.">
                </app-empty-state>
              } @else {
                @for (caseItem of pendingReviews; track caseItem.id) {
                  <div class="attention-card">
                    <div class="attention-body">
                      <div class="attention-badge">Pending Review</div>
                      <h3 class="case-title">{{ caseItem.title }}</h3>
                      <p class="case-meta">Case: {{ caseItem.case_number }} • Updated {{ formatDate(caseItem.updated_at) }}</p>
                    </div>
                    <button class="btn-review" [routerLink]="['/advocate/cases', caseItem.id]">Review Case</button>
                  </div>
                }
              }
            </div>
          </section>

          <!-- Recent Activity -->
          <section class="dashboard-section animate-fade-in-up animate-delay-3">
            <div class="section-header">
              <h2 class="section-title">Recent Activity</h2>
            </div>
            
            <div class="activity-list">
              @if (loading) {
                @for (i of [1,2]; track i) {
                  <div class="activity-item skeleton">
                    <div class="activity-icon"><ion-skeleton-text animated style="width: 100%; height: 100%;"></ion-skeleton-text></div>
                    <div class="activity-content">
                      <ion-skeleton-text animated style="width: 80%; height: 16px; margin-bottom: 4px;"></ion-skeleton-text>
                      <ion-skeleton-text animated style="width: 50%; height: 12px;"></ion-skeleton-text>
                    </div>
                  </div>
                }
              } @else if (activities.length === 0) {
                <app-empty-state 
                  icon="time-outline"
                  title="No recent activity"
                  description="Your recent updates will appear here.">
                </app-empty-state>
              } @else {
                @for (activity of activities; track activity.id) {
                  <div class="activity-item">
                    <div class="activity-icon" [ngClass]="'type-' + activity.type">
                      <ion-icon [name]="getActivityIcon(activity.type)"></ion-icon>
                    </div>
                    <div class="activity-content">
                      <h4 class="activity-title">{{ activity.title }}</h4>
                      <p class="activity-desc">{{ activity.description }}</p>
                      <span class="activity-time">{{ formatDate(activity.created_at) }}</span>
                    </div>
                  </div>
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
      
      img { width: 100%; height: 100%; object-fit: cover; }
      
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
      
      ion-icon { font-size: 20px; }
      &:active { background: var(--app-surface-secondary); }
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
      
      &.highlight {
        border-color: #fca5a5;
        background: #fef2f2;
      }
    }

    .stat-icon {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      
      ion-icon { font-size: 18px; }
      
      &.bg-primary-light { background: #eff6ff; }
      .text-primary { color: #3b82f6; }
      
      &.bg-success-light { background: #f0fdf4; }
      .text-success { color: #10b981; }
      
      &.bg-warning-light { background: #fffbeb; }
      .text-warning { color: #f59e0b; }
      
      &.bg-info-light { background: #f3e8ff; }
      .text-info { color: #a855f7; }
      
      &.bg-danger-light { background: #fee2e2; }
      .text-danger { color: #ef4444 !important; }
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
      
      &.font-medium { font-weight: 600; color: #b91c1c; }
    }

    /* Attention Card */
    .attention-card {
      background: var(--app-surface);
      border: 1px solid var(--app-border);
      border-radius: var(--radius-lg);
      padding: var(--spacing-4);
      box-shadow: var(--shadow-md);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-4);
      border-left: 4px solid #ef4444;
    }
    
    .attention-badge {
      display: inline-block;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #ef4444;
      background: #fee2e2;
      padding: 4px 8px;
      border-radius: 4px;
      margin-bottom: 8px;
    }

    .attention-body .case-title {
      font-size: var(--text-card-title);
      font-weight: 600;
      color: var(--app-text-primary);
      margin: 0 0 4px;
    }
    
    .attention-body .case-meta {
      font-size: var(--text-caption);
      color: var(--app-text-secondary);
      margin: 0;
    }
    
    .btn-review {
      background: var(--app-primary);
      color: var(--app-surface);
      border: none;
      border-radius: var(--radius-md);
      height: 40px;
      font-weight: 600;
      font-size: var(--text-body);
      cursor: pointer;
      width: 100%;
      
      &:active { background: var(--app-primary-light); }
    }

    /* Activity List */
    .activity-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-4);
    }
    
    .activity-item {
      display: flex;
      gap: var(--spacing-3);
      
      &.skeleton .activity-icon {
        overflow: hidden;
        border-radius: 50%;
        border: none;
      }
    }
    
    .activity-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--app-surface-secondary);
      color: var(--app-text-secondary);
      flex-shrink: 0;
      
      ion-icon { font-size: 16px; }
      
      &.type-assignment { background: #eff6ff; color: #3b82f6; }
      &.type-upload { background: #f3e8ff; color: #a855f7; }
      &.type-ai_processed { background: #f0fdf4; color: #10b981; }
      &.type-message { background: #fffbeb; color: #f59e0b; }
    }
    
    .activity-content {
      flex: 1;
      padding-top: 2px;
    }
    
    .activity-title {
      font-size: var(--text-body);
      font-weight: 600;
      color: var(--app-text-primary);
      margin: 0 0 2px;
    }
    
    .activity-desc {
      font-size: var(--text-caption);
      color: var(--app-text-secondary);
      margin: 0 0 4px;
      line-height: 1.4;
    }
    
    .activity-time {
      font-size: 10px;
      color: var(--app-text-muted);
      font-weight: 500;
      text-transform: uppercase;
    }

    @media (min-width: 768px) {
      .stats-grid { grid-template-columns: repeat(4, 1fr); }
      .btn-review { width: auto; padding: 0 24px; align-self: flex-start; }
      .attention-card { flex-direction: row; justify-content: space-between; align-items: center; }
    }
  `]
})
export class AdvocateDashboardPage implements OnInit {
  user: User | null = null;
  stats: AdvocateDashboardStats | null = null;
  pendingReviews: CaseSummary[] = [];
  activities: RecentActivity[] = [];
  
  loading = true;
  error = '';
  greetingTime = 'Good morning';

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService
  ) {
    addIcons({ 
      briefcaseOutline, documentTextOutline, chatbubblesOutline, 
      notificationsOutline, chevronForwardOutline, timeOutline, 
      checkmarkCircleOutline, alertCircleOutline, listOutline 
    });
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
    if (!this.user) return 'A';
    return `${this.user.first_name?.charAt(0) || ''}${this.user.last_name?.charAt(0) || ''}`.toUpperCase() || 'A';
  }

  loadDashboard(event?: any) {
    this.loading = true;
    this.error = '';
    
    this.dashboardService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats as AdvocateDashboardStats;
        this.fetchPendingReviews(event);
      },
      error: (err) => {
        this.error = 'Failed to load dashboard data. Please try again.';
        this.loading = false;
        if (event) event.target.complete();
      }
    });
  }

  fetchPendingReviews(event?: any) {
    this.dashboardService.getPendingReviews().subscribe({
      next: (cases) => {
        this.pendingReviews = cases;
        this.fetchActivity(event);
      },
      error: (err) => {
        this.pendingReviews = [];
        this.fetchActivity(event);
      }
    });
  }

  fetchActivity(event?: any) {
    this.dashboardService.getRecentActivity().subscribe({
      next: (activities) => {
        this.activities = activities;
        this.loading = false;
        if (event) event.target.complete();
      },
      error: (err) => {
        this.activities = [];
        this.loading = false;
        if (event) event.target.complete();
      }
    });
  }

  doRefresh(event: any) {
    this.loadDashboard(event);
  }

  getActivityIcon(type: string): string {
    switch(type) {
      case 'assignment': return 'briefcaseOutline';
      case 'upload': return 'documentTextOutline';
      case 'ai_processed': return 'checkmarkCircleOutline';
      case 'message': return 'chatbubblesOutline';
      default: return 'timeOutline';
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // If less than 24 hours, show hours/mins ago
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      if (hours > 0) return `${hours}h ago`;
      const mins = Math.floor(diff / 60000);
      return `${mins}m ago`;
    }
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
