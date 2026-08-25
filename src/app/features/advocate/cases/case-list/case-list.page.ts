import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonRefresher, IonRefresherContent,
  IonSearchbar, IonIcon, IonSkeletonText, IonButton,
  IonButtons, IonModal, IonSelect, IonSelectOption
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { filterOutline, searchOutline, documentTextOutline, alertCircleOutline } from 'ionicons/icons';

import { CaseService } from '../../../../core/services/case.service';
import { CaseResponse, CaseStatus } from '../../../../core/models/case.model';
import { CaseCardComponent } from '../../../../shared/components/case-card/case-card.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-advocate-case-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, 
    IonHeader, IonToolbar, IonTitle, IonContent, IonRefresher, IonRefresherContent,
    IonSearchbar, IonIcon, IonSkeletonText, IonButton,
    IonButtons, IonModal, IonSelect, IonSelectOption,
    CaseCardComponent, EmptyStateComponent
  ],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>Assigned Cases</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="isFilterOpen = true" class="filter-button">
            <ion-icon name="filter-outline" slot="icon-only"></ion-icon>
            @if (activeFiltersCount > 0) {
              <span class="filter-badge">{{ activeFiltersCount }}</span>
            }
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ion-toolbar>
        <ion-searchbar 
          placeholder="Search case, client..." 
          (ionInput)="onSearch($event)"
          [value]="searchQuery"
          animated="true">
        </ion-searchbar>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" (ionRefresh)="doRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div class="content-container">
        @if (isLoading && cases.length === 0) {
          <div class="skeleton-container">
            @for (i of [1,2,3,4]; track i) {
              <div class="skeleton-card">
                <div class="skel-header">
                  <ion-skeleton-text animated style="width: 40%; height: 16px;"></ion-skeleton-text>
                  <ion-skeleton-text animated style="width: 30%; height: 24px; border-radius: 12px;"></ion-skeleton-text>
                </div>
                <div class="skel-body">
                  <ion-skeleton-text animated style="width: 80%; height: 20px; margin-bottom: 8px;"></ion-skeleton-text>
                  <ion-skeleton-text animated style="width: 60%; height: 16px; margin-bottom: 12px;"></ion-skeleton-text>
                  <ion-skeleton-text animated style="width: 40%; height: 14px;"></ion-skeleton-text>
                </div>
              </div>
            }
          </div>
        } @else if (error) {
          <app-empty-state 
            icon="alert-circle-outline" 
            title="Failed to load cases" 
            [description]="error" 
            actionLabel="Try Again" 
            (action)="loadCases()">
          </app-empty-state>
        } @else if (cases.length === 0) {
          <app-empty-state 
            icon="document-text-outline" 
            title="No assigned cases" 
            description="You don't have any cases assigned to you matching these criteria." 
            [actionLabel]="activeFiltersCount > 0 || searchQuery ? 'Clear Filters' : ''" 
            (action)="clearFilters()">
          </app-empty-state>
        } @else {
          <div class="case-list">
            @for (c of cases; track c.id) {
              <!-- Advocate view shows client info -->
              <app-case-card 
                [caseData]="c" 
                [showClientInfo]="true"
                (onClick)="openCaseDetails($event)">
              </app-case-card>
            }
          </div>
        }
      </div>

      <!-- Filter Modal -->
      <ion-modal [isOpen]="isFilterOpen" (didDismiss)="isFilterOpen = false" [initialBreakpoint]="0.6" [breakpoints]="[0, 0.6]">
        <ng-template>
          <ion-header>
            <ion-toolbar>
              <ion-title>Filter Cases</ion-title>
              <ion-buttons slot="end">
                <ion-button (click)="isFilterOpen = false">Close</ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          <ion-content class="ion-padding filter-content">
            <div class="filter-group">
              <label>Status</label>
              <ion-select [(ngModel)]="filterStatus" placeholder="Any Status" interface="popover" class="custom-select">
                <ion-select-option value="">Any Status</ion-select-option>
                <ion-select-option *for="let s of statusOptions" [value]="s">{{ formatEnum(s) }}</ion-select-option>
              </ion-select>
            </div>
            
            <div class="filter-actions">
              <ion-button expand="block" fill="outline" (click)="clearFilters()">Clear All</ion-button>
              <ion-button expand="block" (click)="applyFilters()">Apply Filters</ion-button>
            </div>
          </ion-content>
        </ng-template>
      </ion-modal>
    </ion-content>
  `,
  styles: [`
    .content-container {
      padding: 16px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .filter-button {
      position: relative;
    }
    
    .filter-badge {
      position: absolute;
      top: 4px;
      right: 4px;
      background: var(--ion-color-primary);
      color: white;
      border-radius: 50%;
      width: 16px;
      height: 16px;
      font-size: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }
    
    /* Skeleton Styling */
    .skeleton-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .skeleton-card {
      background: white;
      border-radius: 12px;
      padding: 16px;
      border: 1px solid var(--ion-color-light-shade);
    }
    
    .skel-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 16px;
    }
    
    .filter-content {
      --background: var(--ion-background-color);
    }
    
    .filter-group {
      margin-bottom: 24px;
      
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
    
    .filter-actions {
      display: flex;
      gap: 12px;
      margin-top: 32px;
      
      ion-button {
        flex: 1;
        margin: 0;
      }
    }
  `]
})
export class AdvocateCaseListPage implements OnInit {
  cases: CaseResponse[] = [];
  isLoading = true;
  error: string | null = null;
  
  // Search and Filter State
  searchQuery = '';
  private searchSubject = new Subject<string>();
  
  isFilterOpen = false;
  filterStatus = '';
  activeFiltersCount = 0;
  
  statusOptions = Object.values(CaseStatus);

  constructor(
    private caseService: CaseService,
    private router: Router
  ) {
    addIcons({ filterOutline, searchOutline, documentTextOutline, alertCircleOutline });
  }

  ngOnInit() {
    this.setupSearch();
    this.loadCases();
  }
  
  setupSearch() {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchQuery = query;
      this.loadCases();
    });
  }

  onSearch(event: any) {
    this.searchSubject.next(event.target.value || '');
  }

  loadCases(event?: any) {
    if (!event) this.isLoading = true;
    this.error = null;
    
    const params: any = {};
    if (this.searchQuery) params.search = this.searchQuery;
    if (this.filterStatus) params.status = this.filterStatus;
    
    this.caseService.getCases(params)
      .pipe(finalize(() => {
        this.isLoading = false;
        if (event) event.target.complete();
      }))
      .subscribe({
        next: (res) => {
          this.cases = res.items;
        },
        error: (err) => {
          this.error = 'Unable to load assigned cases. Please try again later.';
          console.error(err);
        }
      });
  }

  doRefresh(event: any) {
    this.loadCases(event);
  }

  openCaseDetails(c: CaseResponse) {
    this.router.navigate(['/advocate/cases', c.id]);
  }
  
  applyFilters() {
    this.isFilterOpen = false;
    this.activeFiltersCount = this.filterStatus ? 1 : 0;
    this.loadCases();
  }
  
  clearFilters() {
    this.filterStatus = '';
    this.searchQuery = '';
    this.activeFiltersCount = 0;
    this.isFilterOpen = false;
    this.loadCases();
  }
  
  formatEnum(val: string): string {
    return val.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
  }
}
