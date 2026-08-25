import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { IonCard, IonIcon, IonRippleEffect } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  documentOutline, documentTextOutline, imageOutline, 
  checkmarkCircle, timeOutline, alertCircle, chevronForwardOutline,
  refreshOutline
} from 'ionicons/icons';
import { DocumentResponse, DocumentWithStatusResponse, ProcessingStatus } from '../../../core/models/document.model';

@Component({
  selector: 'app-document-card',
  standalone: true,
  imports: [CommonModule, IonCard, IonIcon, IonRippleEffect, DatePipe],
  template: `
    <ion-card class="document-card ion-activatable" (click)="onClick.emit(document)">
      <ion-ripple-effect></ion-ripple-effect>
      
      <div class="doc-icon-container">
        <ion-icon [name]="getFileIcon(document.extension)"></ion-icon>
      </div>
      
      <div class="doc-content">
        <h3 class="doc-title">{{ document.original_filename }}</h3>
        
        <div class="doc-meta">
          <span class="meta-item">{{ formatBytes(document.file_size) }}</span>
          <span class="meta-separator">•</span>
          <span class="meta-item">{{ document.extension | uppercase }}</span>
          <span class="meta-separator">•</span>
          <span class="meta-item">{{ document.created_at | date:'mediumDate' }}</span>
        </div>
        
        <div class="doc-status" [ngClass]="getStatusClass(document)">
          <ion-icon [name]="getStatusIcon(document)"></ion-icon>
          <span>{{ getStatusText(document) }}</span>
        </div>
      </div>
      
      <div class="doc-action">
        <ion-icon name="chevron-forward-outline"></ion-icon>
      </div>
    </ion-card>
  `,
  styles: [`
    .document-card {
      margin: 0 0 12px 0;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      border: 1px solid var(--ion-color-light-shade, #f4f5f8);
      background: var(--ion-card-background, #ffffff);
      display: flex;
      align-items: center;
      padding: 12px;
      position: relative;
      overflow: hidden;
    }
    
    .doc-icon-container {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      background: rgba(var(--ion-color-primary-rgb), 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
      flex-shrink: 0;
      
      ion-icon {
        font-size: 24px;
        color: var(--ion-color-primary);
      }
    }
    
    .doc-content {
      flex: 1;
      min-width: 0;
    }
    
    .doc-title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--ion-color-dark);
      margin: 0 0 4px 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .doc-meta {
      display: flex;
      align-items: center;
      font-size: 0.75rem;
      color: var(--ion-color-medium);
      margin-bottom: 6px;
    }
    
    .meta-separator {
      margin: 0 6px;
      opacity: 0.5;
    }
    
    .doc-status {
      display: inline-flex;
      align-items: center;
      font-size: 0.75rem;
      font-weight: 500;
      padding: 2px 6px;
      border-radius: 4px;
      
      ion-icon {
        margin-right: 4px;
        font-size: 0.9rem;
      }
    }
    
    .doc-action {
      padding-left: 12px;
      color: var(--ion-color-medium);
      
      ion-icon {
        font-size: 1.2rem;
      }
    }
    
    /* Status Colors */
    .status-completed {
      background: rgba(var(--ion-color-success-rgb), 0.1);
      color: var(--ion-color-success-shade);
    }
    
    .status-processing {
      background: rgba(var(--ion-color-warning-rgb), 0.1);
      color: var(--ion-color-warning-shade);
    }
    
    .status-failed {
      background: rgba(var(--ion-color-danger-rgb), 0.1);
      color: var(--ion-color-danger-shade);
    }
    
    .status-pending {
      background: var(--ion-color-light);
      color: var(--ion-color-medium);
    }
  `]
})
export class DocumentCardComponent {
  @Input({ required: true }) document!: DocumentResponse | DocumentWithStatusResponse;
  @Output() onClick = new EventEmitter<DocumentResponse>();

  constructor() {
    addIcons({ 
      documentOutline, documentTextOutline, imageOutline, 
      checkmarkCircle, timeOutline, alertCircle, chevronForwardOutline,
      refreshOutline
    });
  }

  getFileIcon(extension: string): string {
    const ext = extension.toLowerCase().replace('.', '');
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'image-outline';
    if (['txt', 'csv', 'rtf'].includes(ext)) return 'document-text-outline';
    return 'document-outline';
  }

  formatBytes(bytes: number, decimals = 2): string {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }

  getAiStatus(): string {
    if ('ai_status' in this.document) {
      return (this.document as DocumentWithStatusResponse).ai_status;
    }
    return ProcessingStatus.PENDING;
  }

  getStatusClass(doc: any): string {
    const status = this.getAiStatus();
    if (status === ProcessingStatus.COMPLETED) return 'status-completed';
    if (status === ProcessingStatus.PROCESSING || status === ProcessingStatus.RETRYING) return 'status-processing';
    if (status === ProcessingStatus.FAILED) return 'status-failed';
    return 'status-pending';
  }

  getStatusIcon(doc: any): string {
    const status = this.getAiStatus();
    if (status === ProcessingStatus.COMPLETED) return 'checkmark-circle';
    if (status === ProcessingStatus.PROCESSING || status === ProcessingStatus.RETRYING) return 'refresh-outline';
    if (status === ProcessingStatus.FAILED) return 'alert-circle';
    return 'time-outline';
  }

  getStatusText(doc: any): string {
    const status = this.getAiStatus();
    if (status === ProcessingStatus.COMPLETED) return 'Processed';
    if (status === ProcessingStatus.PROCESSING) return 'Processing AI';
    if (status === ProcessingStatus.RETRYING) return 'Retrying...';
    if (status === ProcessingStatus.FAILED) return 'Processing Failed';
    if (status === 'NONE') return 'Uploaded';
    return 'Pending';
  }
}
