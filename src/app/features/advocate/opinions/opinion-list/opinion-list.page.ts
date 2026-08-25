import { Component } from '@angular/core';
import { IonContent, IonHeader, IonToolbar, IonTitle } from '@ionic/angular/standalone';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
@Component({ selector: 'app-opinion-list', standalone: true, imports: [IonContent, IonHeader, IonToolbar, IonTitle, EmptyStateComponent],
  template: `<ion-header><ion-toolbar><ion-title>Legal Opinions</ion-title></ion-toolbar></ion-header><ion-content><app-empty-state icon="document-text-outline" title="No Opinions" message="Your drafted opinions will appear here."></app-empty-state></ion-content>` })
export class OpinionListPage {}
