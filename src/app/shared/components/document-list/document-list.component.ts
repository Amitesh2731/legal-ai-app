import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonList, IonItem, IonLabel, IonSpinner, IonButton, IonIcon, 
  IonSearchbar, ModalController 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, searchOutline, documentTextOutline } from 'ionicons/icons';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { DocumentResponse } from '../../../core/models/document.model';
import { DocumentService } from '../../../core/services/document.service';
import { DocumentCardComponent } from '../document-card/document-card.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { DocumentUploadComponent } from '../document-upload/document-upload.component';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonList, IonItem, IonLabel, IonSpinner, IonButton,
    IonIcon, IonSearchbar, DocumentCardComponent, EmptyStateComponent
  ],
  providers: [ModalController],
  template: `
    <div class="doc-list-container">
      <div class="toolbar-row">
        <ion-searchbar
          class="custom-searchbar"
          placeholder="Search documents..."
          [debounce]="300"
          (ionInput)="onSearch($event)">
        </ion-searchbar>
        
        @if (canUpload) {
          <ion-button class="upload-btn" (click)="openUploadModal()" shape="round">
            <ion-icon name="add-outline" slot="start"></ion-icon>
            Upload
          </ion-button>
        }
      </div>

      @if (isLoading) {
        <div class="loading-state">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Loading documents...</p>
        </div>
      } @else if (error) {
        <app-empty-state 
          icon="alert-circle-outline" 
          title="Error Loading Documents" 
          [description]="error" 
          actionLabel="Try Again" 
          (action)="loadDocuments()">
        </app-empty-state>
      } @else if (filteredDocuments.length === 0) {
        @if (searchQuery) {
          <app-empty-state 
            icon="search-outline" 
            title="No matches found" 
            description="Try adjusting your search query." 
            actionLabel="Clear Search" 
            (action)="clearSearch()">
          </app-empty-state>
        } @else {
          <app-empty-state 
            icon="document-text-outline" 
            title="No documents yet" 
            description="Upload your first document to begin AI analysis." 
            actionLabel="Upload Document" 
            [actionLabel]="canUpload ? 'Upload Document' : ''"
            (action)="canUpload ? openUploadModal() : null">
          </app-empty-state>
        }
      } @else {
        <div class="documents-grid animate-fade-in">
          @for (doc of filteredDocuments; track doc.id) {
            <app-document-card 
              [document]="doc" 
              (onClick)="onDocumentClick.emit($event)">
            </app-document-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .doc-list-container {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    
    .toolbar-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }
    
    .custom-searchbar {
      --box-shadow: none;
      --background: var(--ion-color-light);
      --border-radius: 12px;
      padding: 0;
      flex: 1;
    }
    
    .upload-btn {
      --border-radius: 12px;
      margin: 0;
      font-weight: 600;
    }
    
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 20px;
      color: var(--ion-color-medium);
      
      ion-spinner {
        width: 32px;
        height: 32px;
        margin-bottom: 16px;
      }
    }
    
    .documents-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0; /* Gaps are handled by the card margin */
    }
    
    @media (min-width: 768px) {
      .documents-grid {
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 16px;
      }
      .documents-grid > * {
        margin-bottom: 0 !important; /* Override card bottom margin in grid */
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
export class DocumentListComponent implements OnInit, OnDestroy {
  @Input({ required: true }) caseId!: string;
  @Input() canUpload: boolean = true;
  @Output() onDocumentClick = new EventEmitter<DocumentResponse>();

  documents: DocumentResponse[] = [];
  filteredDocuments: DocumentResponse[] = [];
  
  isLoading = true;
  error: string | null = null;
  
  searchQuery = '';
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private documentService: DocumentService,
    private modalCtrl: ModalController
  ) {
    addIcons({ addOutline, searchOutline, documentTextOutline });
  }

  ngOnInit() {
    this.loadDocuments();
    
    this.searchSubject.pipe(
      takeUntil(this.destroy$),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchQuery = query;
      this.filterDocuments();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public loadDocuments() {
    this.isLoading = true;
    this.error = null;
    
    this.documentService.getCaseDocuments(this.caseId).subscribe({
      next: (docs) => {
        this.documents = docs;
        this.filterDocuments();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading documents:', err);
        this.error = 'Failed to load documents.';
        this.isLoading = false;
      }
    });
  }

  onSearch(event: any) {
    const query = event.target.value.toLowerCase();
    this.searchSubject.next(query);
  }

  clearSearch() {
    this.searchQuery = '';
    const searchbar = document.querySelector('ion-searchbar');
    if (searchbar) searchbar.value = '';
    this.filterDocuments();
  }

  filterDocuments() {
    if (!this.searchQuery) {
      this.filteredDocuments = [...this.documents];
      return;
    }
    
    this.filteredDocuments = this.documents.filter(doc => 
      doc.original_filename.toLowerCase().includes(this.searchQuery) ||
      doc.category.toLowerCase().includes(this.searchQuery)
    );
  }

  async openUploadModal() {
    const modal = await this.modalCtrl.create({
      component: DocumentUploadComponent,
      componentProps: {
        caseId: this.caseId
      },
      cssClass: 'document-upload-modal',
      backdropDismiss: false
    });
    
    await modal.present();
    
    const { data } = await modal.onDidDismiss();
    if (data && data.success) {
      // Refresh documents
      this.loadDocuments();
    }
  }
}
