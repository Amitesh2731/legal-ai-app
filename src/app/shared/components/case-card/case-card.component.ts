import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { IonCard, IonIcon, IonRippleEffect } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronForwardOutline, documentTextOutline } from 'ionicons/icons';
import { CaseResponse } from '../../../core/models/case.model';
import { CaseStatusComponent } from '../case-status/case-status.component';

@Component({
  selector: 'app-case-card',
  standalone: true,
  imports: [CommonModule, IonCard, IonIcon, IonRippleEffect, CaseStatusComponent, DatePipe],
  template: `
    <ion-card class="case-card ion-activatable" (click)="onClick.emit(caseData)">
      <ion-ripple-effect></ion-ripple-effect>
      <div class="card-header">
        <div class="case-header-main">
          <span class="case-number">{{ caseData.case_number }}</span>
          <app-case-status [status]="caseData.status"></app-case-status>
        </div>
      </div>
      
      <div class="card-content">
        <h3 class="case-title">{{ caseData.title }}</h3>
        
        <div class="case-meta">
          @if (caseData.category) {
            <span class="meta-item">
              <ion-icon name="document-text-outline"></ion-icon>
              {{ caseData.category }}
            </span>
          }
          
          @if (showClientInfo && caseData.client) {
            <span class="meta-item client-name">
              Client: {{ caseData.client.first_name }} {{ caseData.client.last_name }}
            </span>
          }
        </div>
      </div>
      
      <div class="card-footer">
        <div class="update-info">
          Updated {{ (caseData.updated_at || caseData.created_at) | date:'mediumDate' }}
        </div>
        <ion-icon name="chevron-forward-outline" class="forward-icon"></ion-icon>
      </div>
    </ion-card>
  `,
  styles: [`
    .case-card {
      margin: 0 0 16px 0;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      border: 1px solid var(--ion-color-light-shade, #f4f5f8);
      background: var(--ion-card-background, #ffffff);
      overflow: hidden;
      position: relative;
    }
    
    .card-header {
      padding: 16px 16px 8px 16px;
    }
    
    .case-header-main {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .case-number {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--ion-color-medium);
      letter-spacing: 0.05em;
    }
    
    .card-content {
      padding: 0 16px 16px 16px;
    }
    
    .case-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--ion-color-dark);
      margin: 0 0 8px 0;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .case-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 12px;
    }
    
    .meta-item {
      display: inline-flex;
      align-items: center;
      font-size: 0.8rem;
      color: var(--ion-color-medium);
      
      ion-icon {
        margin-right: 4px;
        font-size: 1rem;
      }
    }
    
    .client-name {
      font-weight: 500;
      color: var(--ion-color-dark);
    }
    
    .card-footer {
      padding: 12px 16px;
      border-top: 1px solid var(--ion-color-light-shade, #f4f5f8);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(var(--ion-color-light-rgb), 0.3);
    }
    
    .update-info {
      font-size: 0.75rem;
      color: var(--ion-color-medium);
    }
    
    .forward-icon {
      color: var(--ion-color-primary);
      font-size: 1.2rem;
    }
  `]
})
export class CaseCardComponent {
  @Input({ required: true }) caseData!: CaseResponse;
  @Input() showClientInfo: boolean = false;
  @Output() onClick = new EventEmitter<CaseResponse>();

  constructor() {
    addIcons({ chevronForwardOutline, documentTextOutline });
  }
}
