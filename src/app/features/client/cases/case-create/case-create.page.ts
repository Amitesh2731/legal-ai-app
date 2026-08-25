import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButtons,
  IonButton, IonIcon, IonItem, IonLabel, IonInput, IonTextarea, IonSelect,
  IonSelectOption, IonProgressBar, IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  checkmarkOutline, arrowBackOutline, arrowForwardOutline, checkmarkCircleOutline,
  briefcaseOutline, documentTextOutline, peopleOutline, informationCircleOutline
} from 'ionicons/icons';

import { CaseService } from '../../../../core/services/case.service';
import { CasePriority } from '../../../../core/models/case.model';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-client-case-create',
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent,
    IonBackButton, IonButtons, IonButton, IonIcon, IonItem, IonLabel,
    IonInput, IonTextarea, IonSelect, IonSelectOption, IonProgressBar, IonSpinner
  ],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/client/cases"></ion-back-button>
        </ion-buttons>
        <ion-title>Create New Case</ion-title>
      </ion-toolbar>
      @if (!isSuccess) {
        <ion-progress-bar [value]="(currentStep) / totalSteps" color="primary"></ion-progress-bar>
      }
    </ion-header>

    <ion-content>
      <div class="content-container">
        
        @if (isSuccess) {
          <!-- SUCCESS STATE -->
          <div class="success-state animate-fade-in">
            <ion-icon name="checkmark-circle-outline" class="success-icon"></ion-icon>
            <h2>Case Submitted Successfully</h2>
            <p>Your case has been created and is now available in your workspace.</p>
            
            <div class="success-case-info">
              <span class="label">Case Number</span>
              <span class="value">{{ createdCaseNumber }}</span>
            </div>
            
            <ion-button expand="block" (click)="goToCases()" class="mt-4">
              Go to My Cases
            </ion-button>
          </div>
        } @else {
          
          <!-- STEPPERS -->
          <div class="stepper-header">
            <span class="step-indicator">Step {{ currentStep }} of {{ totalSteps }}</span>
            <h2 class="step-title">{{ getStepTitle() }}</h2>
          </div>

          <!-- STEP 1: Category -->
          @if (currentStep === 1) {
            <div class="step-content animate-fade-in-right">
              <p class="step-desc">Select the area of law that best fits your situation.</p>
              
              <div class="category-grid">
                @for (cat of categories; track cat) {
                  <div class="category-card" 
                       [class.selected]="formData.category === cat"
                       (click)="formData.category = cat">
                    <ion-icon name="briefcase-outline"></ion-icon>
                    <span>{{ cat }}</span>
                    @if (formData.category === cat) {
                      <ion-icon name="checkmark-outline" class="check-icon"></ion-icon>
                    }
                  </div>
                }
              </div>
            </div>
          }

          <!-- STEP 2: Case Details -->
          @if (currentStep === 2) {
            <div class="step-content animate-fade-in-right">
              <p class="step-desc">Provide the basic details of your legal matter.</p>
              
              <div class="form-group">
                <label>Case Title <span class="required">*</span></label>
                <ion-input 
                  [(ngModel)]="formData.title" 
                  placeholder="E.g., Property Dispute with Builder"
                  class="custom-input">
                </ion-input>
              </div>
              
              <div class="form-group">
                <label>Description <span class="required">*</span></label>
                <ion-textarea 
                  [(ngModel)]="formData.description" 
                  placeholder="Please describe the issue in detail..."
                  [rows]="5"
                  class="custom-input">
                </ion-textarea>
              </div>
              
              <div class="form-group">
                <label>Priority</label>
                <ion-select [(ngModel)]="formData.priority" interface="popover" class="custom-input">
                  <ion-select-option value="LOW">Low</ion-select-option>
                  <ion-select-option value="MEDIUM">Medium</ion-select-option>
                  <ion-select-option value="HIGH">High</ion-select-option>
                  <ion-select-option value="URGENT">Urgent</ion-select-option>
                </ion-select>
              </div>
            </div>
          }

          <!-- STEP 3: Opposing Party -->
          @if (currentStep === 3) {
            <div class="step-content animate-fade-in-right">
              <p class="step-desc">Information about the other party involved (optional).</p>
              
              <div class="form-group">
                <label>Opposing Party Name</label>
                <ion-input 
                  [(ngModel)]="formData.opposing_party_name" 
                  placeholder="Name of person or company"
                  class="custom-input">
                </ion-input>
              </div>
              
              <div class="form-group">
                <label>Opposing Party Type</label>
                <ion-select [(ngModel)]="formData.opposing_party_type" interface="popover" class="custom-input">
                  <ion-select-option value="Individual">Individual</ion-select-option>
                  <ion-select-option value="Company">Company</ion-select-option>
                  <ion-select-option value="Government">Government Authority</ion-select-option>
                  <ion-select-option value="Other">Other</ion-select-option>
                </ion-select>
              </div>
            </div>
          }

          <!-- STEP 4: Additional Information -->
          @if (currentStep === 4) {
            <div class="step-content animate-fade-in-right">
              <p class="step-desc">Any other details that might be helpful (optional).</p>
              
              <div class="form-group">
                <label>Incident / Contract Date</label>
                <ion-input 
                  type="date"
                  [(ngModel)]="formData.incident_date" 
                  class="custom-input">
                </ion-input>
              </div>
              
              <div class="form-group">
                <label>Location</label>
                <ion-input 
                  [(ngModel)]="formData.location" 
                  placeholder="City, State"
                  class="custom-input">
                </ion-input>
              </div>
              
              <div class="form-group">
                <label>Previous Legal Action Taken?</label>
                <ion-textarea 
                  [(ngModel)]="formData.previous_legal_action" 
                  placeholder="Have you sent a legal notice? Filed a police complaint?"
                  [rows]="3"
                  class="custom-input">
                </ion-textarea>
              </div>
            </div>
          }

          <!-- STEP 5: Review -->
          @if (currentStep === 5) {
            <div class="step-content animate-fade-in-right">
              <p class="step-desc">Please review your case details before submitting.</p>
              
              <div class="review-section">
                <div class="review-header">
                  <h3>Category</h3>
                  <ion-button fill="clear" size="small" (click)="goToStep(1)">Edit</ion-button>
                </div>
                <div class="review-value">{{ formData.category }}</div>
              </div>
              
              <div class="review-section">
                <div class="review-header">
                  <h3>Case Details</h3>
                  <ion-button fill="clear" size="small" (click)="goToStep(2)">Edit</ion-button>
                </div>
                <div class="review-row">
                  <span class="label">Title</span>
                  <span class="value">{{ formData.title }}</span>
                </div>
                <div class="review-row">
                  <span class="label">Description</span>
                  <span class="value">{{ formData.description }}</span>
                </div>
                <div class="review-row">
                  <span class="label">Priority</span>
                  <span class="value">{{ formData.priority }}</span>
                </div>
              </div>
              
              <div class="review-section">
                <div class="review-header">
                  <h3>Opposing Party</h3>
                  <ion-button fill="clear" size="small" (click)="goToStep(3)">Edit</ion-button>
                </div>
                <div class="review-value">
                  {{ formData.opposing_party_name || 'Not provided' }}
                  {{ formData.opposing_party_type ? '(' + formData.opposing_party_type + ')' : '' }}
                </div>
              </div>
            </div>
          }

          <!-- BOTTOM NAVIGATION -->
          <div class="stepper-actions">
            @if (currentStep > 1) {
              <ion-button fill="outline" (click)="prevStep()" [disabled]="isSubmitting">
                <ion-icon name="arrow-back-outline" slot="start"></ion-icon>
                Back
              </ion-button>
            } @else {
              <div></div> <!-- Spacer -->
            }
            
            @if (currentStep < totalSteps) {
              <ion-button (click)="nextStep()" [disabled]="!canProceed()">
                Next
                <ion-icon name="arrow-forward-outline" slot="end"></ion-icon>
              </ion-button>
            } @else {
              <ion-button (click)="submitCase()" [disabled]="isSubmitting" color="primary">
                @if (isSubmitting) {
                  <ion-spinner name="crescent" slot="start"></ion-spinner>
                  Submitting...
                } @else {
                  Submit Case
                  <ion-icon name="checkmark-outline" slot="end"></ion-icon>
                }
              </ion-button>
            }
          </div>

        }
      </div>
    </ion-content>
  `,
  styles: [`
    .content-container {
      padding: 16px;
      max-width: 600px;
      margin: 0 auto;
      min-height: calc(100% - 32px);
      display: flex;
      flex-direction: column;
    }
    
    .stepper-header {
      margin-bottom: 24px;
    }
    
    .step-indicator {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--ion-color-primary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .step-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--ion-color-dark);
      margin: 8px 0 4px 0;
    }
    
    .step-desc {
      color: var(--ion-color-medium);
      font-size: 0.95rem;
      margin-bottom: 24px;
    }
    
    .step-content {
      flex: 1;
    }
    
    /* Category Grid */
    .category-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 12px;
    }
    
    .category-card {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px 12px;
      background: white;
      border: 1.5px solid var(--ion-color-light-shade);
      border-radius: 12px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s ease;
      
      ion-icon {
        font-size: 2rem;
        color: var(--ion-color-medium);
        margin-bottom: 12px;
        transition: all 0.2s ease;
      }
      
      span {
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--ion-color-dark);
      }
      
      .check-icon {
        position: absolute;
        top: 8px;
        right: 8px;
        font-size: 1.2rem;
        color: var(--ion-color-primary);
        margin: 0;
      }
    }
    
    .category-card.selected {
      border-color: var(--ion-color-primary);
      background: rgba(var(--ion-color-primary-rgb), 0.05);
      
      ion-icon:not(.check-icon) {
        color: var(--ion-color-primary);
      }
    }
    
    /* Form Styles */
    .form-group {
      margin-bottom: 20px;
      
      label {
        display: block;
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--ion-color-dark);
        margin-bottom: 8px;
        
        .required {
          color: var(--ion-color-danger);
        }
      }
    }
    
    .custom-input {
      --background: var(--ion-color-light);
      --padding-start: 16px;
      --padding-end: 16px;
      --padding-top: 12px;
      --padding-bottom: 12px;
      border-radius: 8px;
      border: 1px solid transparent;
      
      &.ion-focused {
        border-color: var(--ion-color-primary);
      }
    }
    
    /* Review Section */
    .review-section {
      background: white;
      border: 1px solid var(--ion-color-light-shade);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 16px;
    }
    
    .review-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      border-bottom: 1px solid var(--ion-color-light);
      padding-bottom: 8px;
      
      h3 {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
        color: var(--ion-color-primary);
      }
      
      ion-button {
        --padding-start: 8px;
        --padding-end: 8px;
        margin: 0;
      }
    }
    
    .review-row {
      margin-bottom: 12px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .label {
        display: block;
        font-size: 0.8rem;
        color: var(--ion-color-medium);
        margin-bottom: 4px;
      }
      
      .value {
        display: block;
        font-size: 0.95rem;
        color: var(--ion-color-dark);
        font-weight: 500;
      }
    }
    
    .review-value {
      font-size: 0.95rem;
      color: var(--ion-color-dark);
      font-weight: 500;
    }
    
    /* Stepper Actions */
    .stepper-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid var(--ion-color-light-shade);
      
      ion-button {
        margin: 0;
      }
    }
    
    /* Success State */
    .success-state {
      text-align: center;
      padding: 40px 20px;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      
      .success-icon {
        font-size: 5rem;
        color: var(--ion-color-success);
        margin-bottom: 24px;
      }
      
      h2 {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--ion-color-dark);
        margin: 0 0 12px 0;
      }
      
      p {
        color: var(--ion-color-medium);
        font-size: 1rem;
        margin-bottom: 32px;
      }
    }
    
    .success-case-info {
      background: var(--ion-color-light);
      padding: 16px 32px;
      border-radius: 12px;
      margin-bottom: 32px;
      
      .label {
        display: block;
        font-size: 0.85rem;
        color: var(--ion-color-medium);
        margin-bottom: 4px;
      }
      
      .value {
        display: block;
        font-size: 1.2rem;
        font-weight: 700;
        font-family: monospace;
        color: var(--ion-color-primary);
      }
    }
    
    .mt-4 {
      margin-top: 16px;
      width: 100%;
    }
    
    /* Animations */
    .animate-fade-in-right {
      animation: fadeInRight 0.3s ease-in-out;
    }
    
    @keyframes fadeInRight {
      from { opacity: 0; transform: translateX(10px); }
      to { opacity: 1; transform: translateX(0); }
    }
    
    .animate-fade-in {
      animation: fadeIn 0.4s ease-in-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ClientCaseCreatePage {
  currentStep = 1;
  totalSteps = 5;
  
  isSubmitting = false;
  isSuccess = false;
  createdCaseNumber = '';
  
  categories = [
    'Property Law',
    'Family Law',
    'Corporate Law',
    'Criminal Defense',
    'Civil Rights',
    'Employment Law',
    'Immigration',
    'Other'
  ];
  
  formData: any = {
    title: '',
    description: '',
    category: '',
    priority: CasePriority.MEDIUM,
    opposing_party_name: '',
    opposing_party_type: '',
    incident_date: '',
    location: '',
    previous_legal_action: ''
  };

  constructor(
    private caseService: CaseService,
    private router: Router,
    private toastService: ToastService
  ) {
    addIcons({ checkmarkOutline, arrowBackOutline, arrowForwardOutline, checkmarkCircleOutline, briefcaseOutline, documentTextOutline, peopleOutline, informationCircleOutline });
  }
  
  getStepTitle(): string {
    switch(this.currentStep) {
      case 1: return 'Choose Category';
      case 2: return 'Case Details';
      case 3: return 'Opposing Party';
      case 4: return 'Additional Info';
      case 5: return 'Review & Submit';
      default: return '';
    }
  }
  
  canProceed(): boolean {
    if (this.currentStep === 1) return !!this.formData.category;
    if (this.currentStep === 2) return !!this.formData.title && !!this.formData.description;
    return true; // Steps 3 and 4 are optional
  }
  
  nextStep() {
    if (this.canProceed() && this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }
  
  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }
  
  goToStep(step: number) {
    this.currentStep = step;
  }
  
  submitCase() {
    if (!this.canProceed()) return;
    
    this.isSubmitting = true;
    
    // Clean empty optional fields
    const payload = { ...this.formData };
    Object.keys(payload).forEach(key => {
      if (payload[key] === '') {
        payload[key] = undefined;
      }
    });
    
    this.caseService.createCase(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.isSuccess = true;
        this.createdCaseNumber = res.case_number;
      },
      error: (err) => {
        console.error(err);
        this.isSubmitting = false;
        this.toastService.showError('Failed to submit case. Please try again.');
      }
    });
  }
  
  goToCases() {
    this.router.navigate(['/client/cases'], { replaceUrl: true });
  }
}
