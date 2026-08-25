import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButtons,
  IonSegment, IonSegmentButton, IonLabel, IonSpinner, IonIcon, IonCard,
  IonCardContent, IonCardHeader, IonCardTitle, IonList, IonItem, IonRefresher,
  IonRefresherContent, IonButton, IonModal, IonSelect, IonSelectOption
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  documentTextOutline, timeOutline, personOutline, 
  briefcaseOutline, locationOutline, calendarOutline, alertCircleOutline
} from 'ionicons/icons';

import { CaseService } from '../../../../core/services/case.service';
import { CaseDetailAggregatedResponse, CaseStatus } from '../../../../core/models/case.model';
import { CaseStatusComponent } from '../../../../shared/components/case-status/case-status.component';
import { CaseHistoryComponent } from '../../../../shared/components/case-history/case-history.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ToastService } from '../../../../core/services/toast.service';
import { DocumentListComponent } from '../../../../shared/components/document-list/document-list.component';
import { DocumentResponse } from '../../../../core/models/document.model';

@Component({
  selector: 'app-advocate-case-detail',
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButtons,
    IonSegment, IonSegmentButton, IonLabel, IonSpinner, IonIcon, IonCard,
    IonCardContent, IonCardHeader, IonCardTitle, IonList, IonItem, IonRefresher, IonRefresherContent,
    IonButton, IonModal, IonSelect, IonSelectOption,
    CaseStatusComponent, CaseHistoryComponent, EmptyStateComponent, DocumentListComponent
  ],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/advocate/cases"></ion-back-button>
        </ion-buttons>
        <ion-title>Case Details</ion-title>
        
        @if (caseDetails?.permissions?.can_update_status) {
          <ion-buttons slot="end">
            <ion-button (click)="isStatusModalOpen = true" color="primary">
              Update Status
            </ion-button>
          </ion-buttons>
        }
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
            <p>Loading assigned case...</p>
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
              
              <!-- Client Info specific to Advocate -->
              <ion-card class="detail-card client-card">
                <ion-card-header>
                  <ion-card-title>Client Information</ion-card-title>
                </ion-card-header>
                <ion-list lines="none">
                  @if (caseDetails.client) {
                    <ion-item>
                      <ion-icon name="person-outline" slot="start"></ion-icon>
                      <ion-label>
                        <h3>Client Name</h3>
                        <p>{{ caseDetails.client.first_name }} {{ caseDetails.client.last_name }}</p>
                      </ion-label>
                    </ion-item>
                    <ion-item>
                      <ion-label>
                        <h3>Email</h3>
                        <p>{{ caseDetails.client.email }}</p>
                      </ion-label>
                    </ion-item>
                    @if (caseDetails.client.phone) {
                      <ion-item>
                        <ion-label>
                          <h3>Phone</h3>
                          <p>{{ caseDetails.client.phone }}</p>
                        </ion-label>
                      </ion-item>
                    }
                  }
                </ion-list>
              </ion-card>

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

          <!-- DOCUMENTS TAB -->
          @if (activeTab === 'documents') {
            <div class="tab-content animate-fade-in">
              <app-document-list 
                [caseId]="caseId" 
                [canUpload]="true"
                (onDocumentClick)="onDocumentClick($event)">
              </app-document-list>
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

      <!-- Update Status Modal -->
      <ion-modal [isOpen]="isStatusModalOpen" (didDismiss)="isStatusModalOpen = false" [initialBreakpoint]="0.6" [breakpoints]="[0, 0.6]">
        <ng-template>
          <ion-header>
            <ion-toolbar>
              <ion-title>Update Status</ion-title>
              <ion-buttons slot="end">
                <ion-button (click)="isStatusModalOpen = false">Cancel</ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          <ion-content class="ion-padding modal-content">
            <p>Update the current status of this case.</p>
            <div class="form-group">
              <label>New Status</label>
              <ion-select [(ngModel)]="newStatus" interface="popover" class="custom-select">
                <ion-select-option *for="let s of statusOptions" [value]="s">{{ formatEnum(s) }}</ion-select-option>
              </ion-select>
            </div>
            
            <div class="modal-actions">
              <ion-button expand="block" (click)="updateStatus()" [disabled]="isUpdatingStatus || !newStatus">
                @if (isUpdatingStatus) {
                  <ion-spinner name="crescent"></ion-spinner>
                } @else {
                  Save Status
                }
              </ion-button>
            </div>
          </ion-content>
        </ng-template>
      </ion-modal>

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
    
    .client-card {
      background: rgba(var(--ion-color-primary-rgb), 0.03);
      border-color: rgba(var(--ion-color-primary-rgb), 0.1);
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
    }
    
    .animate-fade-in {
      animation: fadeIn 0.3s ease-in-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .modal-content {
      --background: var(--ion-background-color);
    }
    
    .form-group {
      margin-bottom: 24px;
      margin-top: 16px;
      
      label {
        display: block;
        font-weight: 600;
        margin-bottom: 8px;
        color: var(--ion-color-dark);
      }
    }
    
    .custom-select {
      background: var(--ion-color-light);
      border-radius: 8px;
      padding: 12px;
      width: 100%;
    }
    
    .modal-actions {
      margin-top: 32px;
    }
  `]
})
export class AdvocateCaseDetailPage implements OnInit {
  caseId: string = '';
  caseDetails: CaseDetailAggregatedResponse | null = null;
  
  isLoading = true;
  error: string | null = null;
  activeTab = 'overview';
  
  // Status Update
  isStatusModalOpen = false;
  isUpdatingStatus = false;
  newStatus: CaseStatus | '' = '';
  statusOptions = Object.values(CaseStatus);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private caseService: CaseService,
    private toastService: ToastService
  ) {
    addIcons({ documentTextOutline, timeOutline, personOutline, briefcaseOutline, locationOutline, calendarOutline, alertCircleOutline });
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
        this.newStatus = res.case.status;
        this.isLoading = false;
        if (event) event.target.complete();
      },
      error: (err) => {
        console.error(err);
        this.error = 'This case may have been removed or you are not assigned to it.';
        this.isLoading = false;
        if (event) event.target.complete();
      }
    });
  }

  doRefresh(event: any) {
    this.loadCaseDetails(event);
  }
  
  updateStatus() {
    if (!this.newStatus || !this.caseDetails) return;
    
    this.isUpdatingStatus = true;
    this.caseService.updateCaseStatus(this.caseId, this.newStatus as CaseStatus).subscribe({
      next: (res) => {
        this.isUpdatingStatus = false;
        this.isStatusModalOpen = false;
        this.toastService.showSuccess('Status updated successfully');
        // Refresh details to update history timeline
        this.loadCaseDetails();
      },
      error: (err) => {
        console.error(err);
        this.isUpdatingStatus = false;
        this.toastService.showError('Failed to update status');
      }
    });
  }
  
  goBack() {
    this.router.navigate(['/advocate/cases']);
  }
  
  hasLegalDetails(): boolean {
    if (!this.caseDetails) return false;
    const c = this.caseDetails.case;
    return !!(c.incident_date || c.location || c.opposing_party_name || c.previous_legal_action);
  }
  
  formatEnum(val: string): string {
    return val.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
  }

  onDocumentClick(doc: DocumentResponse) {
    this.router.navigate(['/advocate/cases', this.caseId, 'documents', doc.id]);
  }
}
