import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  DocumentCategory,
  DocumentResponse,
  DocumentWithStatusResponse,
  DocumentProcessingStatus,
  DocumentAISummary,
  DocumentTextResponse
} from '../models/document.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  constructor(private api: ApiService) {}

  uploadDocument(
    caseId: string,
    file: File,
    category: DocumentCategory,
    remarks?: string
  ): Observable<DocumentResponse> {
    const formData = new FormData();
    formData.append('case_id', caseId);
    formData.append('file', file);
    formData.append('category', category);
    if (remarks) {
      formData.append('remarks', remarks);
    }
    return this.api.postForm<DocumentResponse>('/documents/upload', formData);
  }

  getCaseDocuments(caseId: string, skip: number = 0, limit: number = 100): Observable<DocumentResponse[]> {
    return this.api.get<DocumentResponse[]>(`/documents/case/${caseId}?skip=${skip}&limit=${limit}`);
  }

  getDocument(documentId: string): Observable<DocumentResponse> {
    return this.api.get<DocumentResponse>(`/documents/${documentId}`);
  }

  downloadDocument(documentId: string): Observable<Blob> {
    return this.api.getBlob(`/documents/download/${documentId}`);
  }

  deleteDocument(documentId: string): Observable<any> {
    return this.api.delete(`/documents/${documentId}`);
  }

  // Processing APIs
  processDocument(documentId: string): Observable<any> {
    return this.api.post(`/document-processing/${documentId}/process`, {});
  }

  getProcessingStatus(documentId: string): Observable<DocumentProcessingStatus> {
    return this.api.get<DocumentProcessingStatus>(`/document-processing/${documentId}/processing-status`);
  }

  getDocumentSummary(documentId: string): Observable<DocumentAISummary> {
    return this.api.get<DocumentAISummary>(`/document-processing/${documentId}/summary`);
  }

  retryProcessing(documentId: string): Observable<any> {
    return this.api.post(`/document-processing/${documentId}/retry`, {});
  }

  getExtractedText(documentId: string): Observable<DocumentTextResponse> {
    return this.api.get<DocumentTextResponse>(`/document-processing/${documentId}/text`);
  }
}
