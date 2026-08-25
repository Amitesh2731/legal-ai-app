import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButtons,
  IonSegment, IonSegmentButton, IonLabel, IonSpinner, IonIcon, IonCard,
  IonCardContent, IonCardHeader, IonCardTitle, IonList, IonItem, IonButton,
  IonRefresher, IonRefresherContent, IonBadge
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  cloudDownloadOutline, 
  trashOutline, 
  alertCircleOutline,
  documentTextOutline,
  timeOutline,
  informationCircleOutline,
  refreshOutline
} from 'ionicons/icons';
import { Subject, Subscription, timer, of } from 'rxjs';
import { switchMap, takeUntil, catchError, filter } from 'rxjs/operators';

import { DocumentService } from '../../../core/services/document.service';
import { ToastService } from '../../../core/services/toast.service';
import { 
  DocumentResponse, 
  DocumentProcessingStatus, 
  DocumentAISummary, 
  ProcessingStatus,
  DocumentTextResponse
} from '../../../core/models/document.model';
import { EmptyStateComponent } from '../../components/empty-state/empty-state.component';
import { DocumentProcessingStatusComponent } from '../../components/document-processing-status/document-processing-status.component';

@Component({
  selector: 'app-document-detail',
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButtons,
    IonSegment, IonSegmentButton, IonLabel, IonSpinner, IonIcon, IonCard,
    IonCardContent, IonCardHeader, IonCardTitle, IonList, IonItem, IonButton,
    IonRefresher, IonRefresherContent, IonBadge, EmptyStateComponent, DocumentProcessingStatusComponent
  ],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button (click)="goBack()">
            <ion-icon name="arrow-back" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>Document Details</ion-title>
        <ion-buttons slot="end">
          @if (document && !isLoading) {
            <ion-button (click)="downloadDocument()" title="Download Document">
              <ion-icon name="cloud-download-outline" slot="icon-only"></ion-icon>
            </ion-button>
            <ion-button (click)="deleteDocument()" color="danger" title="Delete Document">
              <ion-icon name="trash-outline" slot="icon-only"></ion-icon>
            </ion-button>
          }
        </ion-buttons>
      </ion-toolbar>
      
      @if (document && !isLoading) {
        <div class="doc-header-ext">
          <div class="doc-type-badge">{{ document.extension | uppercase }}</div>
          <h1 class="doc-title">{{ document.original_filename }}</h1>
          <div class="doc-meta-row">
            <span class="doc-meta-item">{{ formatBytes(document.file_size) }}</span>
            <span class="meta-dot">•</span>
            <span class="doc-meta-item">{{ document.created_at | date:'medium' }}</span>
          </div>
        </div>

        <ion-toolbar class="segment-toolbar">
          <ion-segment [(ngModel)]="activeTab">
            <ion-segment-button value="analysis">
              <ion-label>AI Analysis</ion-label>
            </ion-segment-button>
            <ion-segment-button value="details">
              <ion-label>Details</ion-label>
            </ion-segment-button>
            <ion-segment-button value="text">
              <ion-label>Text</ion-label>
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
            <p>Loading document...</p>
          </div>
        } @else if (error) {
          <app-empty-state 
            icon="alert-circle-outline" 
            title="Document Unavailable" 
            [description]="error" 
            actionLabel="Go Back" 
            (action)="goBack()">
          </app-empty-state>
        } @else if (document) {
          
          <!-- Processing Status (Always visible at top if not completed) -->
          @if (processingStatus && processingStatus.overall_status !== 'COMPLETED') {
            <ion-card class="status-card">
              <ion-card-content>
                <app-document-processing-status [status]="processingStatus"></app-document-processing-status>
                
                @if (processingStatus.overall_status === 'FAILED') {
                  <div class="retry-action">
                    <ion-button expand="block" fill="outline" shape="round" (click)="retryProcessing()" [disabled]="isRetrying">
                      @if (isRetrying) {
                        <ion-spinner name="crescent"></ion-spinner>
                      } @else {
                        <ion-icon name="refresh-outline" slot="start"></ion-icon>
                        Retry Processing
                      }
                    </ion-button>
                  </div>
                }
              </ion-card-content>
            </ion-card>
          }

          <!-- AI ANALYSIS TAB -->
          @if (activeTab === 'analysis') {
            <div class="tab-content animate-fade-in">
              @if (!processingStatus || processingStatus.overall_status === 'PENDING' || processingStatus.overall_status === 'PROCESSING') {
                <div class="processing-placeholder">
                  <div class="pulse-ring">
                    <ion-icon name="bulb-outline"></ion-icon>
                  </div>
                  <h3>AI is analyzing this document</h3>
                  <p>This may take a minute or two. We'll update this page automatically when it's ready.</p>
                </div>
              } @else if (processingStatus.overall_status === 'FAILED') {
                <app-empty-state 
                  icon="alert-circle-outline" 
                  title="Analysis Failed" 
                  description="We couldn't generate an AI summary for this document." 
                  [actionLabel]="''">
                </app-empty-state>
              } @else if (aiSummary) {
                
                <ion-card class="detail-card summary-card">
                  <ion-card-header>
                    <ion-card-title>
                      <ion-icon name="bulb-outline" color="primary"></ion-icon>
                      AI Summary
                    </ion-card-title>
                  </ion-card-header>
                  <ion-card-content>
                    <div class="disclaimer">
                      <ion-icon name="information-circle-outline"></ion-icon>
                      <span>This is an AI-generated summary and should not be considered definitive legal advice.</span>
                    </div>
                    
                    @if (aiSummary.overall_summary) {
                      <p class="summary-text">{{ aiSummary.overall_summary }}</p>
                    } @else {
                      <p class="summary-text">No summary available.</p>
                    }
                  </ion-card-content>
                </ion-card>

                @if (aiSummary.important_facts && aiSummary.important_facts.length > 0) {
                  <ion-card class="detail-card">
                    <ion-card-header>
                      <ion-card-title>Key Facts & Entities</ion-card-title>
                    </ion-card-header>
                    <ion-list lines="full">
                      @for (fact of aiSummary.important_facts; track $index) {
                        <ion-item>
                          <ion-icon name="checkmark-circle-outline" slot="start" color="primary"></ion-icon>
                          <ion-label class="ion-text-wrap">{{ fact }}</ion-label>
                        </ion-item>
                      }
                    </ion-list>
                  </ion-card>
                }

                @if (aiSummary.legal_issues && aiSummary.legal_issues.length > 0) {
                  <ion-card class="detail-card">
                    <ion-card-header>
                      <ion-card-title>Identified Legal Issues</ion-card-title>
                    </ion-card-header>
                    <ion-list lines="full">
                      @for (issue of aiSummary.legal_issues; track $index) {
                        <ion-item>
                          <ion-icon name="alert-circle-outline" slot="start" color="warning"></ion-icon>
                          <ion-label class="ion-text-wrap">{{ issue }}</ion-label>
                        </ion-item>
                      }
                    </ion-list>
                  </ion-card>
                }
              } @else {
                <app-empty-state 
                  icon="document-text-outline" 
                  title="No Analysis Available" 
                  description="AI analysis has not been performed on this document." 
                  [actionLabel]="''">
                </app-empty-state>
              }
            </div>
          }

          <!-- DETAILS TAB -->
          @if (activeTab === 'details') {
            <div class="tab-content animate-fade-in">
              <ion-card class="detail-card">
                <ion-card-header>
                  <ion-card-title>Document Information</ion-card-title>
                </ion-card-header>
                <ion-list lines="none">
                  <ion-item>
                    <ion-icon name="document-text-outline" slot="start"></ion-icon>
                    <ion-label>
                      <h3>Original Filename</h3>
                      <p>{{ document.original_filename }}</p>
                    </ion-label>
                  </ion-item>
                  <ion-item>
                    <ion-label>
                      <h3>Category</h3>
                      <p>{{ document.category }}</p>
                    </ion-label>
                  </ion-item>
                  <ion-item>
                    <ion-label>
                      <h3>MIME Type</h3>
                      <p>{{ document.mime_type }}</p>
                    </ion-label>
                  </ion-item>
                  <ion-item>
                    <ion-icon name="time-outline" slot="start"></ion-icon>
                    <ion-label>
                      <h3>Uploaded</h3>
                      <p>{{ document.created_at | date:'medium' }}</p>
                    </ion-label>
                  </ion-item>
                  @if (document.remarks) {
                    <ion-item>
                      <ion-icon name="information-circle-outline" slot="start"></ion-icon>
                      <ion-label class="ion-text-wrap">
                        <h3>Remarks</h3>
                        <p>{{ document.remarks }}</p>
                      </ion-label>
                    </ion-item>
                  }
                </ion-list>
              </ion-card>
            </div>
          }

          <!-- TEXT TAB -->
          @if (activeTab === 'text') {
            <div class="tab-content animate-fade-in">
              <ion-card class="detail-card">
                <ion-card-header>
                  <ion-card-title>Extracted Text</ion-card-title>
                </ion-card-header>
                <ion-card-content>
                  @if (isLoadingText) {
                    <div class="loading-state">
                      <ion-spinner name="dots"></ion-spinner>
                      <p>Loading text...</p>
                    </div>
                  } @else if (extractedText) {
                    <div class="extracted-text">{{ extractedText }}</div>
                  } @else {
                    <app-empty-state 
                      icon="document-text-outline" 
                      title="No Text Available" 
                      description="Text extraction is pending or failed." 
                      [actionLabel]="''">
                    </app-empty-state>
                  }
                </ion-card-content>
              </ion-card>
            </div>
          }
        }
      </div>
    </ion-content>
  `,
  styles: [`
    .doc-header-ext {
      padding: 16px 20px;
      background: var(--ion-background-color);
    }
    
    .doc-type-badge {
      display: inline-block;
      background: rgba(var(--ion-color-primary-rgb), 0.1);
      color: var(--ion-color-primary);
      font-size: 0.75rem;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 4px;
      margin-bottom: 8px;
    }
    
    .doc-title {
      font-size: 1.3rem;
      font-weight: 700;
      color: var(--ion-color-dark);
      margin: 0 0 8px 0;
      line-height: 1.3;
      word-break: break-word;
    }
    
    .doc-meta-row {
      display: flex;
      align-items: center;
      font-size: 0.85rem;
      color: var(--ion-color-medium);
    }
    
    .meta-dot {
      margin: 0 8px;
      opacity: 0.5;
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
    
    .status-card {
      margin-bottom: 24px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      border-radius: 12px;
      border: 1px solid var(--ion-color-light-shade);
    }
    
    .retry-action {
      margin-top: 16px;
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
      display: flex;
      align-items: center;
      
      ion-icon {
        margin-right: 8px;
        font-size: 1.3rem;
      }
    }
    
    .disclaimer {
      display: flex;
      align-items: flex-start;
      padding: 12px;
      background: rgba(var(--ion-color-medium-rgb), 0.05);
      border-radius: 8px;
      margin-bottom: 16px;
      font-size: 0.85rem;
      color: var(--ion-color-medium);
      
      ion-icon {
        font-size: 1.2rem;
        margin-right: 8px;
        flex-shrink: 0;
        position: relative;
        top: 2px;
      }
    }
    
    .summary-text {
      font-size: 1rem;
      line-height: 1.6;
      color: var(--ion-color-dark);
      white-space: pre-line;
      margin: 0;
    }
    
    .extracted-text {
      font-family: monospace;
      font-size: 0.85rem;
      line-height: 1.5;
      color: var(--ion-color-dark);
      white-space: pre-wrap;
      background: var(--ion-color-light);
      padding: 16px;
      border-radius: 8px;
      max-height: 60vh;
      overflow-y: auto;
    }
    
    ion-item {
      --padding-start: 16px;
      --inner-padding-end: 16px;
      
      ion-icon {
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
    
    .processing-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 20px;
      text-align: center;
      background: white;
      border-radius: 12px;
      border: 1px solid var(--ion-color-light-shade);
      
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
        }
      }
      
      h3 {
        font-size: 1.2rem;
        font-weight: 600;
        margin: 0 0 12px 0;
      }
      
      p {
        font-size: 0.95rem;
        color: var(--ion-color-medium);
        margin: 0;
        max-width: 300px;
      }
    }
    
    .animate-fade-in {
      animation: fadeIn 0.3s ease-in-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(var(--ion-color-primary-rgb), 0.4); }
      70% { box-shadow: 0 0 0 20px rgba(var(--ion-color-primary-rgb), 0); }
      100% { box-shadow: 0 0 0 0 rgba(var(--ion-color-primary-rgb), 0); }
    }
  `]
})
export class DocumentDetailPage implements OnInit, OnDestroy {
  caseId: string = '';
  documentId: string = '';
  
  document: DocumentResponse | null = null;
  processingStatus: DocumentProcessingStatus | null = null;
  aiSummary: DocumentAISummary | null = null;
  extractedText: string | null = null;
  
  isLoading = true;
  isLoadingText = false;
  error: string | null = null;
  activeTab = 'analysis';
  
  isRetrying = false;
  
  private destroy$ = new Subject<void>();
  private pollingSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private documentService: DocumentService,
    private toastService: ToastService
  ) {
    addIcons({ cloudDownloadOutline, trashOutline, alertCircleOutline, documentTextOutline, timeOutline, informationCircleOutline, refreshOutline });
  }

  ngOnInit() {
    this.caseId = this.route.snapshot.paramMap.get('id') || '';
    this.documentId = this.route.snapshot.paramMap.get('documentId') || '';
    
    if (this.caseId && this.documentId) {
      this.loadDocumentData();
    } else {
      this.error = 'Invalid URL parameters';
      this.isLoading = false;
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopPolling();
  }

  loadDocumentData(event?: any) {
    if (!event) this.isLoading = true;
    this.error = null;
    
    this.documentService.getDocument(this.documentId).subscribe({
      next: (doc) => {
        this.document = doc;
        this.isLoading = false;
        
        // Fetch auxiliary data
        this.fetchStatusAndSummary();
        this.fetchExtractedText();
        
        if (event) event.target.complete();
      },
      error: (err) => {
        console.error(err);
        this.error = 'Document not found or you do not have permission to view it.';
        this.isLoading = false;
        if (event) event.target.complete();
      }
    });
  }

  fetchStatusAndSummary() {
    this.documentService.getProcessingStatus(this.documentId).subscribe({
      next: (status) => {
        this.processingStatus = status;
        
        if (status.overall_status === ProcessingStatus.COMPLETED) {
          this.fetchAiSummary();
        } else if (status.overall_status === ProcessingStatus.PENDING || status.overall_status === ProcessingStatus.PROCESSING) {
          this.startPolling();
        }
      },
      error: (err) => {
        console.error('Failed to load processing status:', err);
      }
    });
  }

  fetchAiSummary() {
    this.documentService.getDocumentSummary(this.documentId).subscribe({
      next: (summary) => {
        this.aiSummary = summary;
      },
      error: (err) => {
        console.error('Failed to load AI summary:', err);
      }
    });
  }

  fetchExtractedText() {
    this.isLoadingText = true;
    this.documentService.getExtractedText(this.documentId).subscribe({
      next: (res) => {
        this.extractedText = res?.extracted_text || null;
        this.isLoadingText = false;
      },
      error: (err) => {
        console.error('Failed to load text:', err);
        this.isLoadingText = false;
      }
    });
  }

  startPolling() {
    this.stopPolling();
    // Poll every 5 seconds
    this.pollingSub = timer(5000, 5000).pipe(
      takeUntil(this.destroy$),
      switchMap(() => this.documentService.getProcessingStatus(this.documentId).pipe(
        catchError(() => of(null))
      )),
      filter((status): status is DocumentProcessingStatus => status !== null)
    ).subscribe(status => {
      this.processingStatus = status;
      
      if (status.overall_status === ProcessingStatus.COMPLETED) {
        this.stopPolling();
        this.fetchAiSummary();
        this.fetchExtractedText();
        this.toastService.showSuccess('Document processing completed');
      } else if (status.overall_status === ProcessingStatus.FAILED) {
        this.stopPolling();
        this.toastService.showError('Document processing failed');
      }
    });
  }

  stopPolling() {
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
      this.pollingSub = undefined;
    }
  }

  doRefresh(event: any) {
    this.stopPolling();
    this.loadDocumentData(event);
  }

  retryProcessing() {
    this.isRetrying = true;
    this.documentService.retryProcessing(this.documentId).subscribe({
      next: () => {
        this.isRetrying = false;
        this.toastService.showSuccess('Processing restarted');
        this.fetchStatusAndSummary();
      },
      error: (err) => {
        console.error(err);
        this.isRetrying = false;
        this.toastService.showError('Failed to restart processing');
      }
    });
  }

  downloadDocument() {
    if (!this.document) return;
    
    this.documentService.downloadDocument(this.documentId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.document!.original_filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Download error', err);
        this.toastService.showError('Failed to download document');
      }
    });
  }

  deleteDocument() {
    if (confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      this.documentService.deleteDocument(this.documentId).subscribe({
        next: () => {
          this.toastService.showSuccess('Document deleted');
          this.goBack();
        },
        error: (err) => {
          console.error(err);
          this.toastService.showError('Failed to delete document');
        }
      });
    }
  }

  goBack() {
    this.location.back();
  }

  formatBytes(bytes: number, decimals = 2): string {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }
}
