import { Component } from '@angular/core';
import { IonContent, IonHeader, IonToolbar, IonTitle } from '@ionic/angular/standalone';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
@Component({ selector: 'app-case-list', standalone: true, imports: [IonContent, IonHeader, IonToolbar, IonTitle, EmptyStateComponent],
  template: `<ion-header><ion-toolbar><ion-title>My Cases</ion-title></ion-toolbar></ion-header><ion-content><app-empty-state icon="briefcase-outline" title="No Cases Yet" message="Create your first case to get started with legal consultation."></app-empty-state></ion-content>` })
export class CaseListPage {}
