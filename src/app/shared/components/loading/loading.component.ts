import { Component, Input } from '@angular/core';
import { IonSpinner } from '@ionic/angular/standalone';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [IonSpinner],
  template: `
    <div class="loading-container">
      <ion-spinner name="crescent" color="primary"></ion-spinner>
      @if (message) {
        <p class="loading-message">{{ message }}</p>
      }
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      gap: 16px;
    }
    .loading-message {
      color: var(--ion-color-medium);
      font-size: 14px;
      margin: 0;
    }
  `]
})
export class LoadingComponent {
  @Input() message: string = '';
}
