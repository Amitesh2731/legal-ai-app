import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, 
  IonContent, IonItem, IonLabel, IonSelect, IonSelectOption, IonTextarea,
  ModalController, IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, cloudUploadOutline, documentOutline, checkmarkCircleOutline, alertCircleOutline } from 'ionicons/icons';

import { DocumentCategory } from '../../../core/models/document.model';
import { DocumentService } from '../../../core/services/document.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-document-upload',
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, 
    IonIcon, IonContent, IonItem, IonLabel, IonSelect, IonSelectOption, IonTextarea, IonSpinner
  ],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>Upload Document</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()" [disabled]="isUploading || isProcessing">
            <ion-icon name="close-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      @if (uploadState === 'IDLE' || uploadState === 'SELECTED' || uploadState === 'VALIDATING') {
        <div class="upload-container" 
             [class.has-file]="selectedFile"
             (click)="fileInput.click()"
             (dragover)="onDragOver($event)" 
             (dragleave)="onDragLeave($event)" 
             (drop)="onDrop($event)"
             [class.drag-over]="isDragging">
          
          <input type="file" #fileInput (change)="onFileSelected($event)" hidden 
                 accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt" />
                 
          @if (!selectedFile) {
            <ion-icon name="cloud-upload-outline" class="upload-icon"></ion-icon>
            <h3>Choose a file or drag it here</h3>
            <p>Supported formats: PDF, DOCX, JPG, PNG, TXT (Max 15MB)</p>
            <ion-button shape="round" class="browse-btn">Browse Files</ion-button>
          } @else {
            <ion-icon name="document-outline" class="file-icon"></ion-icon>
            <h3>{{ selectedFile.name }}</h3>
            <p>{{ formatBytes(selectedFile.size) }}</p>
            <ion-button shape="round" fill="clear" (click)="clearFile($event)" color="danger">Remove</ion-button>
          }
        </div>

        @if (selectedFile) {
          <div class="form-container animate-fade-in">
            <ion-item class="custom-input" lines="none">
              <ion-label position="stacked">Category <span class="required">*</span></ion-label>
              <ion-select [(ngModel)]="category" interface="action-sheet" placeholder="Select category">
                <ion-select-option value="EVIDENCE">Evidence</ion-select-option>
                <ion-select-option value="CONTRACT">Contract</ion-select-option>
                <ion-select-option value="PLEADING">Pleading</ion-select-option>
                <ion-select-option value="ORDER">Court Order</ion-select-option>
                <ion-select-option value="CORRESPONDENCE">Correspondence</ion-select-option>
                <ion-select-option value="IDENTIFICATION">Identification</ion-select-option>
                <ion-select-option value="OTHER">Other</ion-select-option>
              </ion-select>
            </ion-item>

            <ion-item class="custom-input" lines="none">
              <ion-label position="stacked">Remarks (Optional)</ion-label>
              <ion-textarea [(ngModel)]="remarks" placeholder="Add any notes about this document..." rows="3"></ion-textarea>
            </ion-item>
          </div>
        }
      }

      @if (uploadState === 'UPLOADING') {
        <div class="processing-state animate-fade-in">
          <ion-spinner name="crescent"></ion-spinner>
          <h3>Uploading Document</h3>
          <p>Please wait while your file is securely transferred...</p>
        </div>
      }

      @if (uploadState === 'PROCESSING') {
        <div class="processing-state animate-fade-in">
          <div class="pulse-ring">
            <ion-icon name="sync-outline" class="spin-icon"></ion-icon>
          </div>
          <h3>Starting AI Analysis</h3>
          <p>Document uploaded successfully. Initiating AI processing pipeline...</p>
        </div>
      }

      @if (uploadState === 'COMPLETED') {
        <div class="success-state animate-fade-in">
          <ion-icon name="checkmark-circle-outline" color="success"></ion-icon>
          <h3>Upload Complete</h3>
          <p>The document is now available in your case file.</p>
        </div>
      }

      @if (uploadState === 'FAILED') {
        <div class="error-state animate-fade-in">
          <ion-icon name="alert-circle-outline" color="danger"></ion-icon>
          <h3>Upload Failed</h3>
          <p>{{ errorMessage }}</p>
          <ion-button (click)="resetState()" shape="round" fill="outline" color="dark">Try Again</ion-button>
        </div>
      }
    </ion-content>
    
    <div class="modal-footer" *ngIf="uploadState === 'IDLE' || uploadState === 'SELECTED' || uploadState === 'COMPLETED'">
      @if (uploadState !== 'COMPLETED') {
        <ion-button expand="block" shape="round" 
                    [disabled]="!selectedFile || !category || isUploading"
                    (click)="uploadDocument()">
          Upload Document
        </ion-button>
      } @else {
        <ion-button expand="block" shape="round" (click)="dismiss(true)">
          Done
        </ion-button>
      }
    </div>
  `,
  styles: [`
    .upload-container {
      border: 2px dashed var(--ion-color-medium);
      border-radius: 16px;
      padding: 32px 20px;
      text-align: center;
      background: var(--ion-color-light-shade, #f4f5f8);
      transition: all 0.2s ease;
      cursor: pointer;
      margin-bottom: 24px;
    }
    
    .upload-container.drag-over {
      border-color: var(--ion-color-primary);
      background: rgba(var(--ion-color-primary-rgb), 0.05);
    }
    
    .upload-container.has-file {
      border-style: solid;
      border-color: var(--ion-color-primary);
      background: white;
    }
    
    .upload-icon {
      font-size: 48px;
      color: var(--ion-color-medium);
      margin-bottom: 12px;
    }
    
    .file-icon {
      font-size: 48px;
      color: var(--ion-color-primary);
      margin-bottom: 12px;
    }
    
    .upload-container h3 {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--ion-color-dark);
      margin: 0 0 8px 0;
    }
    
    .upload-container p {
      font-size: 0.9rem;
      color: var(--ion-color-medium);
      margin: 0 0 16px 0;
    }
    
    .browse-btn {
      --box-shadow: none;
    }
    
    .form-container {
      margin-bottom: 24px;
    }
    
    .custom-input {
      --background: var(--ion-color-light);
      --border-radius: 12px;
      --padding-start: 16px;
      margin-bottom: 16px;
      
      ion-label {
        font-weight: 500;
        color: var(--ion-color-dark);
        margin-bottom: 8px;
      }
      
      .required {
        color: var(--ion-color-danger);
      }
    }
    
    .processing-state, .success-state, .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 20px;
      text-align: center;
      height: 100%;
      
      ion-spinner, ion-icon {
        width: 64px;
        height: 64px;
        font-size: 64px;
        margin-bottom: 24px;
      }
      
      h3 {
        font-size: 1.3rem;
        font-weight: 600;
        margin: 0 0 12px 0;
      }
      
      p {
        font-size: 1rem;
        color: var(--ion-color-medium);
        margin: 0;
      }
    }
    
    .pulse-ring {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: rgba(var(--ion-color-primary-rgb), 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;
      animation: pulse 2s infinite;
      
      ion-icon {
        color: var(--ion-color-primary);
        font-size: 40px;
        margin: 0;
        animation: spin 3s linear infinite;
      }
    }
    
    .modal-footer {
      padding: 16px;
      background: var(--ion-background-color);
      border-top: 1px solid var(--ion-color-light-shade);
    }
    
    .animate-fade-in {
      animation: fadeIn 0.3s ease-in-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(var(--ion-color-primary-rgb), 0.4); }
      70% { box-shadow: 0 0 0 20px rgba(var(--ion-color-primary-rgb), 0); }
      100% { box-shadow: 0 0 0 0 rgba(var(--ion-color-primary-rgb), 0); }
    }
    
    @keyframes spin {
      100% { transform: rotate(360deg); }
    }
  `]
})
export class DocumentUploadComponent {
  @Input() caseId!: string;
  @ViewChild('fileInput') fileInput!: ElementRef;
  
  selectedFile: File | null = null;
  category: DocumentCategory | '' = '';
  remarks: string = '';
  
  uploadState: 'IDLE' | 'SELECTED' | 'VALIDATING' | 'UPLOADING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' = 'IDLE';
  isDragging = false;
  errorMessage = '';

  get isUploading(): boolean {
    return this.uploadState === 'UPLOADING';
  }
  
  get isProcessing(): boolean {
    return this.uploadState === 'PROCESSING';
  }

  constructor(
    private modalCtrl: ModalController,
    private documentService: DocumentService,
    private toastService: ToastService
  ) {
    addIcons({ closeOutline, cloudUploadOutline, documentOutline, checkmarkCircleOutline, alertCircleOutline });
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.handleFile(event.target.files[0]);
    }
  }

  handleFile(file: File) {
    this.uploadState = 'VALIDATING';
    
    // File validation
    const maxSize = 15 * 1024 * 1024; // 15MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (file.size > maxSize) {
      this.toastService.showError('File is too large. Maximum size is 15MB.');
      this.resetState();
      return;
    }
    
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|jpg|jpeg|png|txt)$/i)) {
      this.toastService.showError('Unsupported file type.');
      this.resetState();
      return;
    }
    
    this.selectedFile = file;
    this.uploadState = 'SELECTED';
  }

  clearFile(event: Event) {
    event.stopPropagation();
    this.selectedFile = null;
    this.resetState();
  }

  resetState() {
    this.uploadState = 'IDLE';
    this.errorMessage = '';
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  uploadDocument() {
    if (!this.selectedFile || !this.category) return;
    
    this.uploadState = 'UPLOADING';
    
    this.documentService.uploadDocument(
      this.caseId,
      this.selectedFile,
      this.category as DocumentCategory,
      this.remarks
    ).subscribe({
      next: (doc) => {
        this.uploadState = 'PROCESSING';
        // Trigger AI Processing Pipeline automatically via API
        this.documentService.processDocument(doc.id).subscribe({
          next: () => {
            this.uploadState = 'COMPLETED';
          },
          error: (err) => {
            // Even if AI trigger fails, the upload succeeded
            console.warn('Failed to trigger AI processing', err);
            this.uploadState = 'COMPLETED';
            this.toastService.showWarning('Document uploaded, but AI processing failed to start.');
          }
        });
      },
      error: (err) => {
        console.error('Upload error:', err);
        this.uploadState = 'FAILED';
        this.errorMessage = err.message || 'Failed to upload document. Please try again.';
      }
    });
  }

  formatBytes(bytes: number, decimals = 2): string {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }

  dismiss(success = false) {
    this.modalCtrl.dismiss({ success });
  }
}
