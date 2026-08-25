import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon, IonButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { warningOutline, alertCircleOutline, refreshOutline } from 'ionicons/icons';

@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [CommonModule, IonIcon, IonButton],
  template: `
    <div class="error-state-container animate-fade-in-up">
      <div class="icon-wrapper">
        <ion-icon [name]="icon"></ion-icon>
      </div>
      <h3>{{ title }}</h3>
      <p>{{ description }}</p>
      
      @if (retryLabel) {
        <ion-button class="btn-retry" (click)="onRetry()">
          <ion-icon name="refresh-outline" slot="start"></ion-icon>
          {{ retryLabel }}
        </ion-button>
      }
    </div>
  `,
  styles: [`
    .error-state-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      text-align: center;
      background: #fef2f2;
      border-radius: 12px;
      border: 1px solid #fca5a5;
      margin: 16px 0;
    }
    .icon-wrapper {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      background: #fee2e2;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
      
      ion-icon {
        font-size: 32px;
        color: #ef4444;
      }
    }
    h3 {
      font-size: 16px;
      font-weight: 600;
      color: #991b1b;
      margin: 0 0 8px;
    }
    p {
      font-size: 14px;
      color: #b91c1c;
      margin: 0 0 24px;
      max-width: 280px;
      line-height: 1.5;
    }
    .btn-retry {
      --background: #ffffff;
      --background-hover: #f9fafb;
      --border-radius: 8px;
      --color: #b91c1c;
      --box-shadow: 0 1px 2px rgba(0,0,0,0.05);
      border: 1px solid #fca5a5;
      font-size: 14px;
      font-weight: 500;
      height: 40px;
    }
  `]
})
export class ErrorStateComponent {
  @Input() icon = 'alert-circle-outline';
  @Input() title = 'Something went wrong';
  @Input() description = 'An error occurred while loading this data. Please try again.';
  @Input() retryLabel?: string = 'Try Again';
  
  @Output() retry = new EventEmitter<void>();

  constructor() {
    addIcons({ warningOutline, alertCircleOutline, refreshOutline });
  }

  onRetry() {
    this.retry.emit();
  }
}
