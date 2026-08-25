import { User } from './user.model';

export enum CaseStatus {
  NEW = "NEW",
  PAYMENT_PENDING = "PAYMENT_PENDING",
  PAYMENT_COMPLETED = "PAYMENT_COMPLETED",
  PENDING_ASSIGNMENT = "PENDING_ASSIGNMENT",
  ADVOCATE_ASSIGNED = "ADVOCATE_ASSIGNED",
  DOCUMENTS_UPLOADED = "DOCUMENTS_UPLOADED",
  AI_PROCESSING = "AI_PROCESSING",
  IN_PROGRESS = "IN_PROGRESS",
  DOCUMENTS_UNDER_REVIEW = "DOCUMENTS_UNDER_REVIEW",
  INFORMATION_REQUIRED = "INFORMATION_REQUIRED",
  LEGAL_REVIEW = "LEGAL_REVIEW",
  UNDER_REVIEW = "UNDER_REVIEW",
  LEGAL_OPINION_DRAFT = "LEGAL_OPINION_DRAFT",
  LEGAL_OPINION_SUBMITTED = "LEGAL_OPINION_SUBMITTED",
  OPINION_GENERATED = "OPINION_GENERATED",
  REPORT_GENERATED = "REPORT_GENERATED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  CLOSED = "CLOSED"
}

export enum CasePriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT"
}

export interface CaseBase {
  title: string;
  description: string;
  category?: string;
  case_type?: string;
  priority: CasePriority;
  
  incident_date?: string;
  notice_date?: string;
  filing_date?: string;
  next_hearing_date?: string;
  location?: string;
  previous_legal_action?: string;
  previous_case_info?: string;
  opposing_party_name?: string;
  opposing_party_type?: string;
  additional_information?: string;
  case_fee?: number;
}

export interface CaseResponse extends CaseBase {
  id: string;
  case_number: string;
  client_id: string;
  advocate_id?: string;
  status: CaseStatus;
  created_at: string;
  updated_at?: string;
  client?: User;
  advocate?: User;
}

export interface CaseListResponse {
  items: CaseResponse[];
  total: number;
  skip: number;
  limit: number;
}

export interface CaseHistoryResponse {
  id: string;
  case_id: string;
  changed_by: string;
  action_type: string;
  previous_value?: string;
  new_value?: string;
  created_at: string;
}

export interface CasePermissions {
  can_view_ai_analysis: boolean;
  can_edit_case: boolean;
  can_assign_advocate: boolean;
  can_update_status: boolean;
  can_view_audit_logs: boolean;
  can_view_internal_notes: boolean;
  can_view_payment_admin: boolean;
  can_delete_case: boolean;
  can_close_case: boolean;
}

export interface CaseDetailAggregatedResponse {
  case: CaseResponse;
  client?: User;
  advocate?: User;
  documents: any[];
  payments: any[];
  activities: CaseHistoryResponse[];
  permissions: CasePermissions;
}

export interface CaseSummary {
  id: string;
  title: string;
  case_number: string;
  status: string;
  updated_at: string;
}
