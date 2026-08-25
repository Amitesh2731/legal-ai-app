import { Component } from '@angular/core';
import { 
  IonSplitPane, IonMenu, IonHeader, IonToolbar, IonTitle, 
  IonContent, IonList, IonItem, IonIcon, IonLabel, 
  IonMenuToggle, IonRouterOutlet, IonButtons, IonMenuButton
} from '@ionic/angular/standalone';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { addIcons } from 'ionicons';
import { homeOutline, briefcaseOutline, walletOutline, personOutline, notificationsOutline } from 'ionicons/icons';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [
    IonSplitPane, IonMenu, IonHeader, IonToolbar, IonTitle, 
    IonContent, IonList, IonItem, IonIcon, IonLabel, 
    IonMenuToggle, IonRouterOutlet, IonButtons, IonMenuButton,
    RouterLink, RouterLinkActive
  ],
  template: `
    <ion-split-pane contentId="main-content">
      <!-- Side Menu -->
      <ion-menu contentId="main-content" type="overlay">
        <ion-header class="ion-no-border">
          <ion-toolbar>
            <ion-title>Client Portal</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <div class="menu-header">
            <div class="logo-box"><ion-icon name="briefcase-outline"></ion-icon></div>
            <h2>Legal AI</h2>
          </div>
          <ion-list lines="none" class="nav-list">
            <ion-menu-toggle auto-hide="false">
              <ion-item routerLink="/client/dashboard" routerLinkActive="selected">
                <ion-icon slot="start" name="home-outline"></ion-icon>
                <ion-label>Dashboard</ion-label>
              </ion-item>
              <ion-item routerLink="/client/cases" routerLinkActive="selected">
                <ion-icon slot="start" name="briefcase-outline"></ion-icon>
                <ion-label>My Cases</ion-label>
              </ion-item>
              <ion-item routerLink="/client/payments" routerLinkActive="selected">
                <ion-icon slot="start" name="wallet-outline"></ion-icon>
                <ion-label>Payments</ion-label>
              </ion-item>
              <ion-item routerLink="/client/notifications" routerLinkActive="selected">
                <ion-icon slot="start" name="notifications-outline"></ion-icon>
                <ion-label>Alerts</ion-label>
              </ion-item>
              <ion-item routerLink="/client/profile" routerLinkActive="selected">
                <ion-icon slot="start" name="person-outline"></ion-icon>
                <ion-label>Profile</ion-label>
              </ion-item>
            </ion-menu-toggle>
          </ion-list>
        </ion-content>
      </ion-menu>

      <!-- Main Content Area -->
      <div class="ion-page" id="main-content">
        <ion-header class="ion-no-border desktop-header">
          <ion-toolbar>
            <ion-buttons slot="start">
              <ion-menu-button color="primary"></ion-menu-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        
        <!-- router-outlet provides the page which has its own ion-content -->
        <ion-router-outlet></ion-router-outlet>
      </div>
    </ion-split-pane>
  `,
  styles: [`
    ion-split-pane {
      --side-width: 260px;
    }
    ion-menu {
      --background: #ffffff;
      border-right: 1px solid rgba(0,0,0,0.05);
    }
    .menu-header {
      padding: 32px 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      
      .logo-box {
        width: 40px; height: 40px;
        border-radius: 10px;
        background: var(--legal-gradient-primary);
        display: flex; align-items: center; justify-content: center;
        ion-icon { color: #c9a84c; font-size: 20px; }
      }
      h2 { font-size: 18px; font-weight: 800; color: var(--ion-color-primary); margin: 0; }
    }
    .nav-list {
      padding: 0 16px;
      background: transparent;
      
      ion-item {
        --background: transparent;
        --border-radius: 8px;
        margin-bottom: 4px;
        font-weight: 500;
        color: var(--ion-color-medium);
        cursor: pointer;
        
        ion-icon { font-size: 20px; margin-right: 12px; }
        
        &.selected {
          --background: rgba(var(--ion-color-primary-rgb), 0.1);
          color: var(--ion-color-primary);
          font-weight: 600;
          
          ion-icon { color: var(--ion-color-primary); }
        }
        
        &:hover:not(.selected) {
          --background: rgba(0,0,0,0.02);
        }
      }
    }
    .desktop-header {
      ion-toolbar {
        --background: #f0f4f8;
      }
    }
  `]
})
export class ClientLayoutComponent {
  constructor() {
    addIcons({ homeOutline, briefcaseOutline, walletOutline, personOutline, notificationsOutline });
  }
}
