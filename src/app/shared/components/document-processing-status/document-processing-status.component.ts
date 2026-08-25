import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  cloudUploadOutline, 
  scanOutline, 
  textOutline, 
  languageOutline, 
  pricetagsOutline, 
  bulbOutline, 
  checkmarkCircleOutline,
  alertCircleOutline,
  timeOutline,
  refreshOutline
} from 'ionicons/icons';
import { DocumentProcessingStatus, ProcessingStatus } from '../../../core/models/document.model';

@Component({
  selector: 'app-document-processing-status',
  standalone: true,
  imports: [CommonModule, IonIcon],
  template: `
    <div class="status-container">
      <div class="steps-wrapper">
        <!-- Stage 1: Uploaded -->
        <div class="step" [class.active]="true" [class.completed]="true">
          <div class="step-icon">
            <ion-icon name="cloud-upload-outline"></ion-icon>
          </div>
          <div class="step-label">Uploaded</div>
        </div>
        
        <div class="step-connector" [class.active]="true"></div>
        
        <!-- Stage 2: OCR & Text Extraction -->
        <div class="step" 
             [class.active]="isOcrActive()" 
             [class.completed]="isOcrCompleted()"
             [class.failed]="isOcrFailed()">
          <div class="step-icon">
            @if (isOcrActive() && !isOcrCompleted() && !isOcrFailed()) {
              <ion-icon name="refresh-outline" class="spin"></ion-icon>
            } @else if (isOcrFailed()) {
              <ion-icon name="alert-circle-outline"></ion-icon>
            } @else {
              <ion-icon name="scan-outline"></ion-icon>
            }
          </div>
          <div class="step-label">OCR & Text</div>
        </div>
        
        <div class="step-connector" [class.active]="isOcrCompleted()"></div>
        
        <!-- Stage 3: AI Analysis (Entities, Summary, etc.) -->
        <div class="step" 
             [class.active]="isAiActive()" 
             [class.completed]="isAiCompleted()"
             [class.failed]="isAiFailed()">
          <div class="step-icon">
            @if (isAiActive() && !isAiCompleted() && !isAiFailed()) {
              <ion-icon name="refresh-outline" class="spin"></ion-icon>
            } @else if (isAiFailed()) {
              <ion-icon name="alert-circle-outline"></ion-icon>
            } @else {
              <ion-icon name="bulb-outline"></ion-icon>
            }
          </div>
          <div class="step-label">AI Analysis</div>
        </div>
        
        <div class="step-connector" [class.active]="isAiCompleted()"></div>
        
        <!-- Stage 4: Completed -->
        <div class="step" 
             [class.active]="isOverallCompleted()" 
             [class.completed]="isOverallCompleted()">
          <div class="step-icon">
            <ion-icon name="checkmark-circle-outline"></ion-icon>
          </div>
          <div class="step-label">Completed</div>
        </div>
      </div>
      
      @if (status?.overall_status === 'FAILED') {
        <div class="error-message">
          <ion-icon name="alert-circle-outline"></ion-icon>
          Processing failed. {{ getErrorMessage() }}
        </div>
      }
    </div>
  `,
  styles: [`
    .status-container {
      padding: 16px 0;
      width: 100%;
      overflow-x: auto;
    }
    
    .steps-wrapper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-width: 320px;
      padding: 0 16px;
    }
    
    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      z-index: 2;
      width: 64px;
    }
    
    .step-icon {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--ion-color-light);
      color: var(--ion-color-medium);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
      transition: all 0.3s ease;
      border: 2px solid transparent;
      
      ion-icon {
        font-size: 18px;
      }
    }
    
    .step-label {
      font-size: 0.7rem;
      font-weight: 500;
      color: var(--ion-color-medium);
      text-align: center;
      white-space: nowrap;
      transition: all 0.3s ease;
    }
    
    .step-connector {
      flex: 1;
      height: 2px;
      background: var(--ion-color-light-shade);
      margin: 0 4px;
      position: relative;
      top: -12px;
      z-index: 1;
      transition: all 0.3s ease;
    }
    
    /* Active State */
    .step.active .step-icon {
      background: rgba(var(--ion-color-primary-rgb), 0.1);
      color: var(--ion-color-primary);
      border-color: var(--ion-color-primary);
    }
    
    .step.active .step-label {
      color: var(--ion-color-primary);
      font-weight: 600;
    }
    
    /* Completed State */
    .step.completed .step-icon {
      background: var(--ion-color-primary);
      color: white;
    }
    
    .step-connector.active {
      background: var(--ion-color-primary);
    }
    
    /* Failed State */
    .step.failed .step-icon {
      background: rgba(var(--ion-color-danger-rgb), 0.1);
      color: var(--ion-color-danger);
      border-color: var(--ion-color-danger);
    }
    
    .step.failed .step-label {
      color: var(--ion-color-danger);
    }
    
    .spin {
      animation: spin 2s linear infinite;
    }
    
    .error-message {
      margin-top: 24px;
      padding: 12px 16px;
      border-radius: 8px;
      background: rgba(var(--ion-color-danger-rgb), 0.1);
      color: var(--ion-color-danger-shade);
      display: flex;
      align-items: center;
      font-size: 0.85rem;
      font-weight: 500;
      
      ion-icon {
        font-size: 1.2rem;
        margin-right: 8px;
      }
    }
    
    @keyframes spin {
      100% { transform: rotate(360deg); }
    }
  `]
})
export class DocumentProcessingStatusComponent {
  @Input() status: DocumentProcessingStatus | null = null;
  
  constructor() {
    addIcons({ cloudUploadOutline, scanOutline, textOutline, languageOutline, pricetagsOutline, bulbOutline, checkmarkCircleOutline, alertCircleOutline, timeOutline, refreshOutline });
  }

  isOcrActive(): boolean {
    if (!this.status) return false;
    return this.status.ocr_status !== 'NONE';
  }
  
  isOcrCompleted(): boolean {
    if (!this.status) return false;
    return this.status.ocr_status === ProcessingStatus.COMPLETED;
  }
  
  isOcrFailed(): boolean {
    if (!this.status) return false;
    return this.status.ocr_status === ProcessingStatus.FAILED;
  }
  
  isAiActive(): boolean {
    if (!this.status) return false;
    return this.status.ai_status !== 'NONE' && this.isOcrCompleted();
  }
  
  isAiCompleted(): boolean {
    if (!this.status) return false;
    return this.status.ai_status === ProcessingStatus.COMPLETED;
  }
  
  isAiFailed(): boolean {
    if (!this.status) return false;
    return this.status.ai_status === ProcessingStatus.FAILED;
  }
  
  isOverallCompleted(): boolean {
    if (!this.status) return false;
    return this.status.overall_status === ProcessingStatus.COMPLETED;
  }
  
  getErrorMessage(): string {
    if (!this.status) return '';
    if (this.isOcrFailed()) return this.status.ocr_error || 'OCR processing failed.';
    if (this.isAiFailed()) return this.status.ai_error || 'AI analysis failed.';
    return 'An unknown error occurred.';
  }
}
