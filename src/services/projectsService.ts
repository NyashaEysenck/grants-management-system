import projectsData from '../data/projects.json';
import applicationsData from '../data/applications.json';

export interface Milestone {
  id: string;
  title: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'on_hold';
  description: string;
  progressReportUploaded?: boolean;
  progressReportDate?: string;
  progressReportFilename?: string;
  isOverdue?: boolean;
}

export interface Requisition {
  id: string;
  milestoneId: string;
  amount: number;
  requestedDate: string;
  status: 'submitted' | 'approved' | 'rejected';
  notes: string;
  reviewedBy?: string;
  reviewedDate?: string;
  reviewNotes?: string;
}

export interface Partner {
  id: string;
  name: string;
  role: string;
  mouFilename?: string;
  uploadedDate?: string;
}

export interface FinalReport {
  narrativeReport?: {
    filename: string;
    uploadedDate: string;
  };
  financialReport?: {
    filename: string;
    uploadedDate: string;
  };
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'revision_required';
  submittedDate?: string;
  reviewedBy?: string;
  reviewedDate?: string;
  reviewNotes?: string;
}

export interface ClosureWorkflow {
  status: 'pending' | 'vc_review' | 'signed_off' | 'closed';
  vcSignOffToken?: string;
  vcSignedBy?: string;
  vcSignedDate?: string;
  vcNotes?: string;
  closureCertificateGenerated?: boolean;
  closureCertificateDate?: string;
}

export interface Project {
  id: string;
  applicationId: string;
  title: string;
  status: 'active' | 'completed' | 'on_hold' | 'cancelled' | 'closed';
  startDate: string;
  endDate: string;
  milestones: Milestone[];
  requisitions?: Requisition[];
  partners?: Partner[];
  finalReport?: FinalReport;
  closureWorkflow?: ClosureWorkflow;
}

// Type assertion to ensure the imported JSON matches our Project interface
const typedProjectsData = projectsData as { projects: Project[] };
const typedApplicationsData = applicationsData as { applications: any[] };

export const getProjectsByUser = (email: string): Project[] => {
  // Use the already imported applications data
  const userApprovedApplications = typedApplicationsData.applications.filter(
    (app: any) => app.email === email && app.status === 'approved'
  );
  
  // Find projects that match user's approved applications
  return typedProjectsData.projects.filter(project =>
    userApprovedApplications.some(app => app.id === project.applicationId)
  );
};

// Synchronous version for easier use in components
export const getProjectsByUserSync = (email: string): Project[] => {
  // Use the already imported applications data instead of require
  const userApprovedApplications = typedApplicationsData.applications.filter(
    (app: any) => app.email === email && app.status === 'approved'
  );
  
  return typedProjectsData.projects.filter(project =>
    userApprovedApplications.some(app => app.id === project.applicationId)
  );
};

export const getAllProjects = (): Project[] => {
  return typedProjectsData.projects;
};

export const getProjectById = (id: string): Project | undefined => {
  return typedProjectsData.projects.find(project => project.id === id);
};

export const getStatusColor = (status: Project['status']): string => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    case 'on_hold':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getMilestoneStatusColor = (status: Milestone['status']): string => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800';
    case 'on_hold':
      return 'bg-yellow-100 text-yellow-800';
    case 'pending':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getRequisitionStatusColor = (status: Requisition['status']): string => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'submitted':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const calculateProgress = (milestones: Milestone[]): number => {
  if (milestones.length === 0) return 0;
  const completedMilestones = milestones.filter(m => m.status === 'completed').length;
  return Math.round((completedMilestones / milestones.length) * 100);
};

export const checkOverdueMilestones = (project: Project): Project => {
  const now = new Date();
  const updatedMilestones = project.milestones.map(milestone => {
    const dueDate = new Date(milestone.dueDate);
    const isOverdue = now > dueDate && 
                     milestone.status !== 'completed' && 
                     !milestone.progressReportUploaded;
    
    return {
      ...milestone,
      isOverdue
    };
  });

  return {
    ...project,
    milestones: updatedMilestones
  };
};

// Requisition functions
export const submitRequisition = (projectId: string, requisition: Omit<Requisition, 'id' | 'requestedDate' | 'status'>): boolean => {
  // In a real app, this would make an API call
  console.log('Submitting requisition for project:', projectId, requisition);
  return true;
};

export const updateRequisitionStatus = (
  projectId: string, 
  requisitionId: string, 
  status: Requisition['status'], 
  reviewNotes?: string,
  reviewedBy?: string
): boolean => {
  // In a real app, this would make an API call
  console.log('Updating requisition status:', { projectId, requisitionId, status, reviewNotes, reviewedBy });
  return true;
};

// Partner functions
export const addPartner = (projectId: string, partner: Omit<Partner, 'id'>): boolean => {
  // In a real app, this would make an API call
  console.log('Adding partner to project:', projectId, partner);
  return true;
};

export const uploadMOU = (projectId: string, partnerId: string, filename: string): boolean => {
  // In a real app, this would handle file upload
  console.log('Uploading MOU for partner:', { projectId, partnerId, filename });
  return true;
};

// Progress report functions
export const uploadProgressReport = (projectId: string, milestoneId: string, filename: string): boolean => {
  // In a real app, this would handle file upload
  console.log('Uploading progress report:', { projectId, milestoneId, filename });
  return true;
};

// Final reporting functions
export const uploadFinalReport = (
  projectId: string, 
  reportType: 'narrative' | 'financial', 
  filename: string
): boolean => {
  console.log('Uploading final report:', { projectId, reportType, filename });
  return true;
};

export const submitFinalReports = (projectId: string): boolean => {
  console.log('Submitting final reports for project:', projectId);
  return true;
};

export const reviewFinalReports = (
  projectId: string, 
  status: 'approved' | 'revision_required',
  reviewNotes: string,
  reviewedBy: string
): boolean => {
  console.log('Reviewing final reports:', { projectId, status, reviewNotes, reviewedBy });
  return true;
};

// Closure workflow functions
export const initiateVCSignOff = (projectId: string): string => {
  const token = `vc_${projectId}_${Date.now()}`;
  console.log('Initiating VC sign-off with token:', token);
  return token;
};

export const getProjectByVCToken = (token: string): Project | null => {
  // In a real app, this would validate the token and return the project
  console.log('Getting project by VC token:', token);
  const projects = typedProjectsData.projects;
  return projects.find(p => p.closureWorkflow?.vcSignOffToken === token) || null;
};

export const submitVCSignOff = (
  token: string, 
  decision: 'approved' | 'rejected',
  notes: string,
  vcName: string
): boolean => {
  console.log('VC sign-off submitted:', { token, decision, notes, vcName });
  return true;
};

export const generateClosureCertificate = (projectId: string): boolean => {
  console.log('Generating closure certificate for project:', projectId);
  return true;
};

export const archiveProjectDocuments = (projectId: string): boolean => {
  console.log('Archiving project documents for project:', projectId);
  return true;
};
