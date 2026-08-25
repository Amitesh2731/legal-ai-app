import { Component } from '@angular/core';
import { IonContent, IonHeader, IonToolbar, IonTitle } from '@ionic/angular/standalone';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
@Component({ selector: 'app-advocate-notification-list', standalone: true, imports: [IonContent, IonHeader, IonToolbar, IonTitle, EmptyStateComponent],
  template: `<ion-header><ion-toolbar><ion-title>Notifications</ion-title></ion-toolbar></ion-header><ion-content><app-empty-state icon="notifications-outline" title="No Notifications" message="You're all caught up!"></app-empty-state></ion-content>` })
export class AdvocateNotificationListPage {}
