/**
 * Project Types
 * 
 * TypeScript interfaces for project data structures
 * matching the backend API schema.
 */

export interface Milestone {
  id: string;
  title: string;
  due_date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'on_hold';
  description: string;
  progress_report_uploaded?: boolean;
  progress_report_date?: string;
  progress_report_filename?: string;
  is_overdue?: boolean;
}

export interface Requisition {
  id: string;
  milestone_id: string;
  amount: number;
  requested_date: string;
  status: 'submitted' | 'approved' | 'rejected';
  notes: string;
  reviewed_by?: string;
  reviewed_date?: string;
  review_notes?: string;
}

export interface Partner {
  id: string;
  name: string;
  role: string;
  mou_filename?: string;
  uploaded_date?: string;
}

export interface FinalReport {
  narrative_report?: {
    filename: string;
    uploaded_date: string;
  };
  financial_report?: {
    filename: string;
    uploaded_date: string;
  };
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'revision_required';
  submitted_date?: string;
  reviewed_by?: string;
  reviewed_date?: string;
  review_notes?: string;
}

export interface ClosureWorkflow {
  status: 'pending' | 'vc_review' | 'signed_off' | 'closed';
  vc_signoff_token?: string;
  vc_signed_by?: string;
  vc_signed_date?: string;
  vc_notes?: string;
  closure_certificate_generated?: boolean;
  closure_certificate_date?: string;
}

export interface Project {
  id: string;
  application_id: string;
  title: string;
  status: 'active' | 'completed' | 'on_hold' | 'cancelled' | 'closed';
  start_date: string;
  end_date: string;
  milestones: Milestone[];
  requisitions?: Requisition[];
  partners?: Partner[];
  final_report?: FinalReport;
  closure_workflow?: ClosureWorkflow;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreate {
  application_id: string;
  title: string;
  start_date: string;
  end_date: string;
}
