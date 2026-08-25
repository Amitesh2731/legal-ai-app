import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonAvatar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logOutOutline, personCircleOutline, mailOutline, callOutline, briefcaseOutline } from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-advocate-profile',
  standalone: true,
  imports: [CommonModule, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonAvatar],
  template: `
    <ion-header><ion-toolbar><ion-title>Profile</ion-title></ion-toolbar></ion-header>
    <ion-content>
      <div class="profile-container">
        <div class="profile-header">
          <ion-avatar class="profile-avatar">
            <div class="avatar-placeholder"><ion-icon name="person-circle-outline"></ion-icon></div>
          </ion-avatar>
          <h2 class="profile-name">{{ user?.first_name }} {{ user?.last_name }}</h2>
          <p class="profile-role">Advocate</p>
        </div>
        <div class="profile-info">
          <div class="info-item"><ion-icon name="mail-outline"></ion-icon><div><label>Email</label><p>{{ user?.email || 'Not set' }}</p></div></div>
          <div class="info-item"><ion-icon name="call-outline"></ion-icon><div><label>Phone</label><p>{{ user?.phone || 'Not set' }}</p></div></div>
        </div>
        <ion-button expand="block" color="danger" fill="outline" (click)="logout()" style="margin: 24px 20px;">
          <ion-icon name="log-out-outline" slot="start"></ion-icon> Sign Out
        </ion-button>
      </div>
    </ion-content>
  `,
  styles: [`
    .profile-container { padding-bottom: 40px; }
    .profile-header { text-align: center; padding: 32px 24px 24px; background: var(--legal-gradient-hero); border-radius: 0 0 var(--legal-radius-xl) var(--legal-radius-xl); }
    .profile-avatar { width: 80px; height: 80px; margin: 0 auto 16px; }
    .avatar-placeholder { width: 100%; height: 100%; border-radius: 50%; background: rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; ion-icon { font-size: 48px; color: rgba(255,255,255,0.8); } }
    .profile-name { font-size: 22px; font-weight: 700; color: #fff; margin: 0 0 4px; }
    .profile-role { font-size: 14px; color: rgba(255,255,255,0.6); margin: 0; }
    .profile-info { padding: 24px 20px; }
    .info-item { display: flex; align-items: flex-start; gap: 16px; padding: 16px; background: var(--ion-card-background); border-radius: var(--legal-radius-sm); margin-bottom: 12px; box-shadow: var(--legal-shadow-sm);
      ion-icon { font-size: 22px; color: var(--ion-color-primary); margin-top: 2px; }
      label { font-size: 12px; font-weight: 600; color: var(--ion-color-medium); text-transform: uppercase; letter-spacing: 0.5px; }
      p { font-size: 15px; color: var(--ion-text-color); margin: 4px 0 0; font-weight: 500; }
    }
  `]
})
export class AdvocateProfilePage {
  user: any;
  constructor(private authService: AuthService) {
    addIcons({ logOutOutline, personCircleOutline, mailOutline, callOutline, briefcaseOutline });
    this.user = this.authService.currentUser;
  }
  logout(): void { this.authService.logout(); }
}
