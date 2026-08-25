import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { TokenService } from './token.service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ClientDashboardStats, AdvocateDashboardStats, RecentActivity } from '../models/dashboard.model';
import { CaseSummary, CaseListResponse } from '../models/case.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private api: ApiService, private tokenService: TokenService) {}

  getStats(): Observable<any> {
    const role = this.tokenService.getUserRole();
    if (role === 'advocate') {
      return this.api.get<any>('/dashboard/advocate').pipe(
        map(res => ({
          assigned_cases: res.assigned_cases || 0,
          pending_reviews: res.pending_reviews || 0,
          active_cases: (res.assigned_cases || 0) - (res.completed_reviews || 0),
          completed_cases: res.completed_reviews || 0
        }))
      );
    } else if (role === 'admin') {
      return this.api.get<any>('/dashboard/admin');
    }
    
    return this.api.get<any>('/dashboard/client').pipe(
        map(res => ({
          active_cases: (res.total_cases || 0) - ((res.completed_cases || 0) + (res.pending_cases || 0)),
          pending_cases: res.pending_cases || 0,
          completed_cases: res.completed_cases || 0,
          total_documents: res.pending_payments || 0 // Mocked to pending_payments as fallback
        }))
    );
  }

  getRecentCases(): Observable<CaseSummary[]> {
    // Relying on RBAC of the /cases endpoint
    return this.api.get<CaseListResponse>('/cases', { limit: 5, sort_order: 'desc' }).pipe(
      map(res => res.items as unknown as CaseSummary[])
    );
  }
  
  getPendingReviews(): Observable<CaseSummary[]> {
    // Only fetch cases with a status resembling review
    return this.api.get<CaseListResponse>('/cases', { status: 'UNDER_REVIEW', limit: 5 }).pipe(
      map(res => res.items as unknown as CaseSummary[])
    );
  }

  getRecentActivity(): Observable<RecentActivity[]> {
    // Backend doesn't have an activity endpoint yet, so we return empty array to prevent 404
    return of([]);
  }
}
