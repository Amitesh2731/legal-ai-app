export interface ClientDashboardStats {
  active_cases: number;
  pending_cases: number;
  completed_cases: number;
  total_documents: number;
}

export interface AdvocateDashboardStats {
  assigned_cases: number;
  pending_reviews: number;
  active_cases: number;
  completed_cases: number;
}

export interface RecentActivity {
  id: string;
  type: string; // 'assignment', 'upload', 'ai_processed', 'message'
  title: string;
  description: string;
  created_at: string;
}
