import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CaseStatus } from '../../../core/models/case.model';

@Component({
  selector: 'app-case-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="status-badge" [ngClass]="statusConfig.cssClass">
      @if (showIcon && statusConfig.icon) {
        <span class="status-icon">{{ statusConfig.icon }}</span>
      }
      {{ statusConfig.label }}
    </span>
  `,
  styles: [`
    .status-badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.02em;
      white-space: nowrap;
    }
    .status-icon {
      margin-right: 4px;
      font-size: 0.8rem;
    }
    
    /* Semantic Colors based on Enterprise SaaS */
    .status-new, .status-pending {
      background-color: var(--ion-color-light);
      color: var(--ion-color-dark);
      border: 1px solid rgba(0,0,0,0.1);
    }
    
    .status-processing, .status-review {
      background-color: rgba(var(--ion-color-warning-rgb), 0.15);
      color: var(--ion-color-warning-shade);
    }
    
    .status-active, .status-assigned {
      background-color: rgba(var(--ion-color-primary-rgb), 0.15);
      color: var(--ion-color-primary-shade);
    }
    
    .status-success, .status-completed {
      background-color: rgba(var(--ion-color-success-rgb), 0.15);
      color: var(--ion-color-success-shade);
    }
    
    .status-danger, .status-required {
      background-color: rgba(var(--ion-color-danger-rgb), 0.15);
      color: var(--ion-color-danger-shade);
    }
    
    .status-closed {
      background-color: var(--ion-color-medium);
      color: white;
    }
  `]
})
export class CaseStatusComponent {
  @Input() status!: CaseStatus | string;
  @Input() showIcon: boolean = true;

  get statusConfig() {
    switch (this.status) {
      case CaseStatus.NEW:
        return { label: 'New', cssClass: 'status-new', icon: '✨' };
      case CaseStatus.PAYMENT_PENDING:
        return { label: 'Payment Pending', cssClass: 'status-pending', icon: '💳' };
      case CaseStatus.PAYMENT_COMPLETED:
        return { label: 'Payment Completed', cssClass: 'status-success', icon: '✓' };
      case CaseStatus.PENDING_ASSIGNMENT:
        return { label: 'Pending Assignment', cssClass: 'status-pending', icon: '⏳' };
      case CaseStatus.ADVOCATE_ASSIGNED:
        return { label: 'Advocate Assigned', cssClass: 'status-assigned', icon: '👤' };
      case CaseStatus.DOCUMENTS_UPLOADED:
        return { label: 'Documents Uploaded', cssClass: 'status-active', icon: '📄' };
      case CaseStatus.AI_PROCESSING:
        return { label: 'AI Processing', cssClass: 'status-processing', icon: '🤖' };
      case CaseStatus.IN_PROGRESS:
        return { label: 'In Progress', cssClass: 'status-active', icon: '⚙️' };
      case CaseStatus.DOCUMENTS_UNDER_REVIEW:
      case CaseStatus.UNDER_REVIEW:
      case CaseStatus.LEGAL_REVIEW:
        return { label: 'Under Review', cssClass: 'status-review', icon: '🔍' };
      case CaseStatus.INFORMATION_REQUIRED:
        return { label: 'Info Required', cssClass: 'status-required', icon: '⚠️' };
      case CaseStatus.LEGAL_OPINION_DRAFT:
        return { label: 'Opinion Draft', cssClass: 'status-processing', icon: '📝' };
      case CaseStatus.LEGAL_OPINION_SUBMITTED:
      case CaseStatus.OPINION_GENERATED:
        return { label: 'Opinion Ready', cssClass: 'status-success', icon: '⚖️' };
      case CaseStatus.COMPLETED:
        return { label: 'Completed', cssClass: 'status-completed', icon: '✅' };
      case CaseStatus.CLOSED:
        return { label: 'Closed', cssClass: 'status-closed', icon: '🔒' };
      case CaseStatus.CANCELLED:
        return { label: 'Cancelled', cssClass: 'status-danger', icon: '🚫' };
      default:
        return { label: this.status || 'Unknown', cssClass: 'status-new', icon: '•' };
    }
  }
}
