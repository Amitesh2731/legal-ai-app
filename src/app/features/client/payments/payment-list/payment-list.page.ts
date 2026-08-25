import { Component } from '@angular/core';
import { IonContent, IonHeader, IonToolbar, IonTitle } from '@ionic/angular/standalone';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
@Component({ selector: 'app-payment-list', standalone: true, imports: [IonContent, IonHeader, IonToolbar, IonTitle, EmptyStateComponent],
  template: `<ion-header><ion-toolbar><ion-title>Payments</ion-title></ion-toolbar></ion-header><ion-content><app-empty-state icon="wallet-outline" title="No Payments" message="Your payment history will appear here."></app-empty-state></ion-content>` })
export class PaymentListPage {}
