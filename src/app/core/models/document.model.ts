export enum DocumentCategory {
  EVIDENCE = 'EVIDENCE',
  PLEADING = 'PLEADING',
  ORDER = 'ORDER',
  CORRESPONDENCE = 'CORRESPONDENCE',
  IDENTIFICATION = 'IDENTIFICATION',
  CONTRACT = 'CONTRACT',
  OTHER = 'OTHER'
}

export enum ProcessingStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  RETRYING = 'RETRYING'
}

export interface DocumentResponse {
  id: string;
  case_id: string;
  uploaded_by: string;
  category: DocumentCategory;
  remarks?: string;
  original_filename: string;
  mime_type: string;
  extension: string;
  file_size: number;
  version: number;
  created_at: string;
  updated_at?: string;
}

export interface DocumentWithStatusResponse extends DocumentResponse {
  ai_status: string;
  client_name?: string;
  client_id?: string;
  advocate_name?: string;
  advocate_id?: string;
}

export interface DocumentProcessingStatus {
  document_id: string;
  overall_status: ProcessingStatus;
  ocr_status: string;
  ai_status: string;
  ocr_error?: string;
  ai_error?: string;
  ai_retries?: number;
}

export interface DocumentAISummary {
  id: string;
  case_id: string;
  document_id: string;
  case_details?: any;
  background?: string;
  plaintiff_claims?: any[];
  defendant_position?: any[];
  important_facts?: any[];
  timeline?: any[];
  legal_issues?: any[];
  reliefs_sought?: any[];
  supporting_documents?: any[];
  risk_assessment?: any;
  overall_summary?: string;
  provider: string;
  status: string;
}

export interface DocumentTextResponse {
  document_id: string;
  extracted_text: string;
}
