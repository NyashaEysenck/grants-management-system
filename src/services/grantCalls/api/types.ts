/**
 * Grant Call Types
 * 
 * TypeScript interfaces for grant call data structures
 * matching the backend API schema.
 */

export interface GrantCall {
  id: string;
  title: string;
  type: string;
  sponsor: string;
  deadline: string;
  scope: string;
  eligibility: string;
  requirements: string;
  status: 'Open' | 'Closed';
  visibility: 'Public' | 'Restricted';
  created_at: string;
  updated_at: string;
}

export interface GrantCallCreate {
  title: string;
  type: string;
  sponsor: string;
  deadline: string;
  scope: string;
  eligibility: string;
  requirements: string;
  status: 'Open' | 'Closed';
  visibility: 'Public' | 'Restricted';
}

export interface GrantCallUpdate {
  title?: string;
  type?: string;
  sponsor?: string;
  deadline?: string;
  scope?: string;
  eligibility?: string;
  requirements?: string;
  status?: 'Open' | 'Closed';
  visibility?: 'Public' | 'Restricted';
}
