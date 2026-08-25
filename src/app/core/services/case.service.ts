import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { 
  CaseResponse, 
  CaseListResponse, 
  CaseBase, 
  CaseDetailAggregatedResponse, 
  CaseStatus, 
  CaseHistoryResponse 
} from '../models/case.model';

export interface GetCasesParams {
  skip?: number;
  limit?: number;
  status?: string;
  priority?: string;
  category?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  sort_by?: string;
  sort_order?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CaseService {
  private basePath = '/cases';

  constructor(private api: ApiService) {}

  /**
   * Get a paginated list of cases with optional filters
   */
  getCases(params?: GetCasesParams): Observable<CaseListResponse> {
    return this.api.get<CaseListResponse>(this.basePath, params);
  }

  /**
   * Get aggregated details for a specific case
   */
  getCaseDetails(id: string): Observable<CaseDetailAggregatedResponse> {
    return this.api.get<CaseDetailAggregatedResponse>(`${this.basePath}/${id}`);
  }

  /**
   * Create a new case
   */
  createCase(caseData: Partial<CaseBase>): Observable<CaseResponse> {
    return this.api.post<CaseResponse>(this.basePath, caseData);
  }

  /**
   * Update an existing case
   */
  updateCase(id: string, caseData: Partial<CaseBase>): Observable<CaseResponse> {
    return this.api.put<CaseResponse>(`${this.basePath}/${id}`, caseData);
  }

  /**
   * Update the status of a case
   */
  updateCaseStatus(id: string, status: CaseStatus): Observable<CaseResponse> {
    return this.api.patch<CaseResponse>(`${this.basePath}/${id}/status`, { status });
  }

  /**
   * Get the history/timeline of a case
   */
  getCaseHistory(id: string): Observable<CaseHistoryResponse[]> {
    return this.api.get<CaseHistoryResponse[]>(`${this.basePath}/${id}/history`);
  }
}
