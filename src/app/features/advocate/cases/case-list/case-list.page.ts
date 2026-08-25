import { Component } from '@angular/core';
import { IonContent, IonHeader, IonToolbar, IonTitle } from '@ionic/angular/standalone';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
@Component({ selector: 'app-advocate-case-list', standalone: true, imports: [IonContent, IonHeader, IonToolbar, IonTitle, EmptyStateComponent],
  template: `<ion-header><ion-toolbar><ion-title>Assigned Cases</ion-title></ion-toolbar></ion-header><ion-content><app-empty-state icon="briefcase-outline" title="No Assigned Cases" message="Cases assigned to you will appear here."></app-empty-state></ion-content>` })
export class AdvocateCaseListPage {}
