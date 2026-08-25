import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon, IonButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { documentTextOutline, refreshOutline, addOutline } from 'ionicons/icons';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, IonIcon, IonButton],
  template: `
    <div class="empty-state-container animate-fade-in-up">
      <div class="icon-wrapper">
        <ion-icon [name]="icon"></ion-icon>
      </div>
      <h3>{{ title }}</h3>
      <p>{{ description }}</p>
      
      @if (actionLabel) {
        <ion-button class="btn-primary" (click)="onAction()">
          @if (actionIcon) {
            <ion-icon [name]="actionIcon" slot="start"></ion-icon>
          }
          {{ actionLabel }}
        </ion-button>
      }
    </div>
  `,
  styles: [`
    .empty-state-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      text-align: center;
      background: #ffffff;
      border-radius: 12px;
      border: 1px dashed #d1d5db;
      margin: 16px 0;
    }
    .icon-wrapper {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      background: #f3f4f6;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
      
      ion-icon {
        font-size: 32px;
        color: #9ca3af;
      }
    }
    h3 {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 8px;
    }
    p {
      font-size: 14px;
      color: #6b7280;
      margin: 0 0 24px;
      max-width: 280px;
      line-height: 1.5;
    }
    .btn-primary {
      --background: #111827;
      --background-hover: #1f2937;
      --border-radius: 8px;
      --color: #ffffff;
      font-size: 14px;
      font-weight: 500;
      height: 40px;
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon = 'document-text-outline';
  @Input() title = 'No Data Available';
  @Input() description = 'There is currently no information to display here.';
  @Input() actionLabel?: string;
  @Input() actionIcon?: string;
  
  @Output() action = new EventEmitter<void>();

  constructor() {
    addIcons({ documentTextOutline, refreshOutline, addOutline });
  }

  onAction() {
    this.action.emit();
  }
}
