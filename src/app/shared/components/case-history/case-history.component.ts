import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { CaseHistoryResponse } from '../../../core/models/case.model';

@Component({
  selector: 'app-case-history',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="history-container">
      @if (!history || history.length === 0) {
        <div class="empty-history">
          <p>No activity history available for this case.</p>
        </div>
      } @else {
        <div class="timeline">
          @for (item of history; track item.id; let i = $index) {
            <div class="timeline-item" [class.latest]="i === 0">
              <div class="timeline-node"></div>
              <div class="timeline-content">
                <div class="timeline-header">
                  <span class="action-type">{{ formatActionType(item.action_type) }}</span>
                  <span class="timestamp">{{ item.created_at | date:'short' }}</span>
                </div>
                
                @if (item.previous_value || item.new_value) {
                  <div class="value-changes">
                    @if (item.previous_value) {
                      <span class="old-value">{{ item.previous_value }}</span>
                      <span class="arrow">→</span>
                    }
                    @if (item.new_value) {
                      <span class="new-value">{{ item.new_value }}</span>
                    }
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .history-container {
      padding: 16px 0;
    }
    
    .empty-history {
      text-align: center;
      padding: 24px;
      color: var(--ion-color-medium);
      font-size: 0.9rem;
      background: var(--ion-color-light-shade, #f4f5f8);
      border-radius: 8px;
    }
    
    .timeline {
      position: relative;
      padding-left: 24px;
    }
    
    .timeline::before {
      content: '';
      position: absolute;
      left: 6px;
      top: 8px;
      bottom: 0;
      width: 2px;
      background: var(--ion-color-light-shade, #e0e0e0);
    }
    
    .timeline-item {
      position: relative;
      margin-bottom: 24px;
    }
    
    .timeline-item:last-child {
      margin-bottom: 0;
    }
    
    .timeline-item:last-child::before {
      display: none;
    }
    
    .timeline-node {
      position: absolute;
      left: -24px;
      top: 6px;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: var(--ion-color-light-shade, #e0e0e0);
      border: 2px solid white;
      z-index: 1;
    }
    
    .timeline-item.latest .timeline-node {
      background: var(--ion-color-primary);
      box-shadow: 0 0 0 3px rgba(var(--ion-color-primary-rgb), 0.2);
    }
    
    .timeline-content {
      background: white;
      border: 1px solid var(--ion-color-light-shade, #f4f5f8);
      border-radius: 8px;
      padding: 12px 16px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    }
    
    .timeline-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }
    
    .action-type {
      font-weight: 600;
      color: var(--ion-color-dark);
      font-size: 0.9rem;
    }
    
    .timestamp {
      font-size: 0.75rem;
      color: var(--ion-color-medium);
    }
    
    .value-changes {
      font-size: 0.85rem;
      color: var(--ion-color-medium);
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
      background: var(--ion-color-light);
      padding: 6px 10px;
      border-radius: 4px;
    }
    
    .old-value {
      text-decoration: line-through;
      opacity: 0.7;
    }
    
    .arrow {
      color: var(--ion-color-medium);
    }
    
    .new-value {
      font-weight: 500;
      color: var(--ion-color-dark);
    }
  `]
})
export class CaseHistoryComponent {
  @Input() history: CaseHistoryResponse[] = [];

  formatActionType(action: string): string {
    return action.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }
}
