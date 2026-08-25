import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButtons,
  IonSegment, IonSegmentButton, IonLabel, IonSpinner, IonIcon, IonCard,
  IonCardContent, IonCardHeader, IonCardTitle, IonList, IonItem, IonRefresher,
  IonRefresherContent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  documentTextOutline, timeOutline, informationCircleOutline, 
  briefcaseOutline, locationOutline, calendarOutline, cashOutline, alertCircleOutline
} from 'ionicons/icons';

import { CaseService } from '../../../../core/services/case.service';
import { CaseDetailAggregatedResponse, CaseStatus } from '../../../../core/models/case.model';
import { CaseStatusComponent } from '../../../../shared/components/case-status/case-status.component';
import { CaseHistoryComponent } from '../../../../shared/components/case-history/case-history.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-client-case-detail',
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButtons,
    IonSegment, IonSegmentButton, IonLabel, IonSpinner, IonIcon, IonCard,
    IonCardContent, IonCardHeader, IonCardTitle, IonList, IonItem, IonRefresher, IonRefresherContent,
    CaseStatusComponent, CaseHistoryComponent, EmptyStateComponent
  ],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/client/cases"></ion-back-button>
        </ion-buttons>
        <ion-title>Case Details</ion-title>
      </ion-toolbar>
      
      @if (caseDetails && !isLoading) {
        <div class="case-header-ext">
          <h1 class="case-title">{{ caseDetails.case.title }}</h1>
          <div class="case-meta-row">
            <span class="case-number">{{ caseDetails.case.case_number }}</span>
            <app-case-status [status]="caseDetails.case.status"></app-case-status>
          </div>
        </div>

        <ion-toolbar class="segment-toolbar">
          <ion-segment [(ngModel)]="activeTab" (ionChange)="activeTab = $event.detail.value?.toString() || 'overview'">
            <ion-segment-button value="overview">
              <ion-label>Overview</ion-label>
            </ion-segment-button>
            <ion-segment-button value="documents">
              <ion-label>Documents</ion-label>
            </ion-segment-button>
            <ion-segment-button value="timeline">
              <ion-label>Timeline</ion-label>
            </ion-segment-button>
          </ion-segment>
        </ion-toolbar>
      }
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" (ionRefresh)="doRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div class="content-container">
        @if (isLoading) {
          <div class="loading-state">
            <ion-spinner name="crescent"></ion-spinner>
            <p>Loading case details...</p>
          </div>
        } @else if (error) {
          <app-empty-state 
            icon="alert-circle-outline" 
            title="Case not found" 
            [description]="error" 
            actionLabel="Back to Cases" 
            (action)="goBack()">
          </app-empty-state>
        } @else if (caseDetails) {
          
          <!-- OVERVIEW TAB -->
          @if (activeTab === 'overview') {
            <div class="tab-content animate-fade-in">
              <ion-card class="detail-card">
                <ion-card-header>
                  <ion-card-title>Description</ion-card-title>
                </ion-card-header>
                <ion-card-content>
                  <p class="description-text">{{ caseDetails.case.description }}</p>
                </ion-card-content>
              </ion-card>

              <ion-card class="detail-card">
                <ion-card-header>
                  <ion-card-title>Case Information</ion-card-title>
                </ion-card-header>
                <ion-list lines="none">
                  @if (caseDetails.case.category) {
                    <ion-item>
                      <ion-icon name="briefcase-outline" slot="start"></ion-icon>
                      <ion-label>
                        <h3>Category</h3>
                        <p>{{ caseDetails.case.category }}</p>
                      </ion-label>
                    </ion-item>
                  }
                  
                  <ion-item>
                    <ion-icon name="time-outline" slot="start"></ion-icon>
                    <ion-label>
                      <h3>Created On</h3>
                      <p>{{ caseDetails.case.created_at | date:'mediumDate' }}</p>
                    </ion-label>
                  </ion-item>

                  @if (caseDetails.advocate) {
                    <ion-item>
                      <ion-icon name="person-outline" slot="start"></ion-icon>
                      <ion-label>
                        <h3>Assigned Advocate</h3>
                        <p>{{ caseDetails.advocate.first_name }} {{ caseDetails.advocate.last_name }}</p>
                      </ion-label>
                    </ion-item>
                  } @else {
                    <ion-item>
                      <ion-icon name="information-circle-outline" slot="start"></ion-icon>
                      <ion-label>
                        <h3>Assigned Advocate</h3>
                        <p class="pending-text">Pending Assignment</p>
                      </ion-label>
                    </ion-item>
                  }
                </ion-list>
              </ion-card>

              <!-- Legal Specific Details -->
              @if (hasLegalDetails()) {
                <ion-card class="detail-card">
                  <ion-card-header>
                    <ion-card-title>Legal Details</ion-card-title>
                  </ion-card-header>
                  <ion-list lines="none">
                    @if (caseDetails.case.incident_date) {
                      <ion-item>
                        <ion-icon name="calendar-outline" slot="start"></ion-icon>
                        <ion-label>
                          <h3>Incident Date</h3>
                          <p>{{ caseDetails.case.incident_date }}</p>
                        </ion-label>
                      </ion-item>
                    }
                    @if (caseDetails.case.location) {
                      <ion-item>
                        <ion-icon name="location-outline" slot="start"></ion-icon>
                        <ion-label>
                          <h3>Location</h3>
                          <p>{{ caseDetails.case.location }}</p>
                        </ion-label>
                      </ion-item>
                    }
                    @if (caseDetails.case.opposing_party_name) {
                      <ion-item>
                        <ion-icon name="information-circle-outline" slot="start"></ion-icon>
                        <ion-label>
                          <h3>Opposing Party</h3>
                          <p>{{ caseDetails.case.opposing_party_name }} {{ caseDetails.case.opposing_party_type ? '(' + caseDetails.case.opposing_party_type + ')' : '' }}</p>
                        </ion-label>
                      </ion-item>
                    }
                  </ion-list>
                </ion-card>
              }
            </div>
          }

          <!-- DOCUMENTS TAB (Placeholder for Sprint 4) -->
          @if (activeTab === 'documents') {
            <div class="tab-content animate-fade-in">
              <app-empty-state 
                icon="document-text-outline" 
                title="Documents" 
                description="Document management will be available in the next update." 
                actionLabel="">
              </app-empty-state>
            </div>
          }

          <!-- TIMELINE TAB -->
          @if (activeTab === 'timeline') {
            <div class="tab-content animate-fade-in">
              <ion-card class="detail-card">
                <ion-card-header>
                  <ion-card-title>Case Timeline</ion-card-title>
                </ion-card-header>
                <ion-card-content>
                  <app-case-history [history]="caseDetails.activities"></app-case-history>
                </ion-card-content>
              </ion-card>
            </div>
          }

        }
      </div>
    </ion-content>
  `,
  styles: [`
    .case-header-ext {
      padding: 16px 20px;
      background: var(--ion-background-color);
    }
    
    .case-title {
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--ion-color-dark);
      margin: 0 0 12px 0;
      line-height: 1.3;
    }
    
    .case-meta-row {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    .case-number {
      font-family: monospace;
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--ion-color-medium);
      background: var(--ion-color-light);
      padding: 4px 8px;
      border-radius: 6px;
    }
    
    .segment-toolbar {
      --min-height: 48px;
      padding-bottom: 8px;
    }
    
    ion-segment {
      background: transparent;
      padding: 0 16px;
    }
    
    ion-segment-button {
      --indicator-color: var(--ion-color-primary);
      --color-checked: var(--ion-color-primary);
      min-width: auto;
      padding: 0 12px;
      
      ion-label {
        font-weight: 600;
        text-transform: none;
        letter-spacing: 0;
      }
    }
    
    .content-container {
      padding: 16px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 20px;
      color: var(--ion-color-medium);
      
      ion-spinner {
        width: 32px;
        height: 32px;
        margin-bottom: 16px;
      }
    }
    
    .detail-card {
      margin: 0 0 16px 0;
      box-shadow: 0 2px 10px rgba(0,0,0,0.03);
      border: 1px solid var(--ion-color-light-shade);
      border-radius: 12px;
    }
    
    ion-card-title {
      font-size: 1.1rem;
      font-weight: 600;
    }
    
    .description-text {
      font-size: 0.95rem;
      line-height: 1.6;
      color: var(--ion-color-dark);
      white-space: pre-line;
      margin: 0;
    }
    
    ion-item {
      --padding-start: 16px;
      --inner-padding-end: 16px;
      
      ion-icon {
        color: var(--ion-color-primary);
        font-size: 1.2rem;
      }
      
      h3 {
        font-size: 0.85rem;
        color: var(--ion-color-medium);
        margin-bottom: 4px;
      }
      
      p {
        font-size: 0.95rem;
        color: var(--ion-color-dark);
        font-weight: 500;
      }
      
      .pending-text {
        color: var(--ion-color-medium);
        font-style: italic;
        font-weight: normal;
      }
    }
    
    .animate-fade-in {
      animation: fadeIn 0.3s ease-in-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ClientCaseDetailPage implements OnInit {
  caseId: string = '';
  caseDetails: CaseDetailAggregatedResponse | null = null;
  
  isLoading = true;
  error: string | null = null;
  activeTab = 'overview';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private caseService: CaseService
  ) {
    addIcons({ documentTextOutline, timeOutline, informationCircleOutline, briefcaseOutline, locationOutline, calendarOutline, cashOutline, alertCircleOutline });
  }

  ngOnInit() {
    this.caseId = this.route.snapshot.paramMap.get('id') || '';
    if (this.caseId) {
      this.loadCaseDetails();
    } else {
      this.error = 'Invalid case ID';
      this.isLoading = false;
    }
  }
  
  loadCaseDetails(event?: any) {
    if (!event) this.isLoading = true;
    this.error = null;
    
    this.caseService.getCaseDetails(this.caseId).subscribe({
      next: (res) => {
        this.caseDetails = res;
        this.isLoading = false;
        if (event) event.target.complete();
      },
      error: (err) => {
        console.error(err);
        this.error = 'This case may have been removed or you do not have permission to view it.';
        this.isLoading = false;
        if (event) event.target.complete();
      }
    });
  }

  doRefresh(event: any) {
    this.loadCaseDetails(event);
  }
  
  goBack() {
    this.router.navigate(['/client/cases']);
  }
  
  hasLegalDetails(): boolean {
    if (!this.caseDetails) return false;
    const c = this.caseDetails.case;
    return !!(c.incident_date || c.location || c.opposing_party_name || c.previous_legal_action);
  }
}
