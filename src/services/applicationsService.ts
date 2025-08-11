import applicationsData from '../data/applications.json';
import { DataStorage } from '../utils/dataStorage';

export interface ResearcherBiodata {
  name: string;
  age: number;
  email: string;
  firstTimeApplicant: boolean;
}

export interface ReviewerFeedback {
  id: string;
  applicationId: string;
  reviewerEmail: string;
  reviewerName?: string;
  comments: string;
  decision: 'approve' | 'reject' | 'request_changes';
  annotatedFileName?: string;
  submittedAt: string;
  reviewToken: string;
}

export interface SignOffApproval {
  id: string;
  applicationId: string;
  role: 'DORI' | 'DVC' | 'VC';
  approverEmail: string;
  approverName?: string;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  approvedAt?: string;
  signOffToken: string;
}

export interface Application {
  id: string;
  grantId: string;
  applicantName: string;
  email: string;
  proposalTitle: string;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'withdrawn' | 'editable' | 'awaiting_signoff' | 'signoff_complete' | 'contract_pending' | 'contract_received' | 'needs_revision';
  submissionDate: string;
  reviewComments: string;
  biodata?: ResearcherBiodata;
  deadline?: string;
  isEditable?: boolean;
  assignedReviewers?: string[];
  reviewerFeedback?: ReviewerFeedback[];
  signOffApprovals?: SignOffApproval[];
  awardAmount?: number;
  contractFileName?: string;
  awardLetterGenerated?: boolean;
  revisionCount?: number;
  originalSubmissionDate?: string;
  proposalFileName?: string;
}

// Type assertion to ensure the imported JSON matches our Application interface
const typedApplicationsData = applicationsData as { applications: Application[] };

// Initialize persistent storage with fallback to JSON data
let applicationsCache: Application[] = DataStorage.initializeFromJSON('applications', typedApplicationsData.applications);

export const getAllApplications = async (): Promise<Application[]> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/applications`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch applications');
    }

    const applications = await response.json();
    return applications.map((app: any) => ({
      id: app.id,
      grantId: app.grantId,
      applicantName: app.applicantName,
      email: app.email,
      proposalTitle: app.proposalTitle,
      status: app.status,
      submissionDate: app.submissionDate,
      reviewComments: app.reviewComments || '',
      biodata: app.biodata,
      deadline: app.deadline,
      isEditable: app.isEditable,
      assignedReviewers: app.assignedReviewers || [],
      reviewerFeedback: app.reviewerFeedback || [],
      signOffApprovals: app.signOffApprovals || [],
      awardAmount: app.awardAmount,
      contractFileName: app.contractFileName,
      awardLetterGenerated: app.awardLetterGenerated,
      revisionCount: app.revisionCount || 0,
      originalSubmissionDate: app.originalSubmissionDate,
      proposalFileName: app.proposalFileName
    }));
  } catch (error) {
    console.error('Error fetching applications:', error);
    // Fallback to cached data for development
    return [...applicationsCache];
  }
};

export const getApplicationsByUser = (email: string): Application[] => {
  return applicationsCache.filter(app => app.email === email);
};

// Submit a new grant application
export const submitApplication = async (applicationData: {
  grantId: string;
  applicantName: string;
  email: string;
  proposalTitle: string;
  institution?: string;
  department?: string;
  projectSummary?: string;
  objectives?: string;
  methodology?: string;
  expectedOutcomes?: string;
  budgetAmount?: number;
  budgetJustification?: string;
  timeline?: string;
  biodata?: ResearcherBiodata;
  proposalFileName?: string;
}): Promise<Application> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/applications`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        grantId: applicationData.grantId,
        applicantName: applicationData.applicantName,
        email: applicationData.email,
        proposalTitle: applicationData.proposalTitle,
        institution: applicationData.institution || '',
        department: applicationData.department || '',
        projectSummary: applicationData.projectSummary || '',
        objectives: applicationData.objectives || '',
        methodology: applicationData.methodology || '',
        expectedOutcomes: applicationData.expectedOutcomes || '',
        budgetAmount: applicationData.budgetAmount || 0,
        budgetJustification: applicationData.budgetJustification || '',
        timeline: applicationData.timeline || '',
        biodata: applicationData.biodata,
        proposalFileName: applicationData.proposalFileName
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to submit application');
    }

    const submittedApp = await response.json();
    
    // Convert backend response to frontend Application interface
    const application: Application = {
      id: submittedApp.id,
      grantId: submittedApp.grantId,
      applicantName: submittedApp.applicantName,
      email: submittedApp.email,
      proposalTitle: submittedApp.proposalTitle,
      status: submittedApp.status || 'submitted',
      submissionDate: submittedApp.submissionDate || new Date().toISOString(),
      reviewComments: submittedApp.reviewComments || '',
      biodata: submittedApp.biodata,
      deadline: submittedApp.deadline,
      isEditable: submittedApp.isEditable,
      assignedReviewers: submittedApp.assignedReviewers || [],
      reviewerFeedback: submittedApp.reviewerFeedback || [],
      signOffApprovals: submittedApp.signOffApprovals || [],
      awardAmount: submittedApp.awardAmount,
      contractFileName: submittedApp.contractFileName,
      awardLetterGenerated: submittedApp.awardLetterGenerated,
      revisionCount: submittedApp.revisionCount || 0,
      originalSubmissionDate: submittedApp.originalSubmissionDate,
      proposalFileName: submittedApp.proposalFileName
    };

    return application;
  } catch (error) {
    console.error('Error submitting application:', error);
    throw error;
  }
};

export const getApplicationById = (id: string): Application | undefined => {
  return applicationsCache.find(app => app.id === id);
};

export const updateApplicationStatus = (id: string, status: Application['status'], comments?: string): boolean => {
  const application = applicationsCache.find(app => app.id === id);
  if (application) {
    application.status = status;
    if (comments !== undefined) {
      application.reviewComments = comments;
    }
    DataStorage.saveApplications(applicationsCache);
    return true;
  }
  return false;
};

export const withdrawApplication = (id: string): boolean => {
  const application = applicationsCache.find(app => app.id === id);
  if (application && application.status === 'submitted') {
    // Check if deadline has passed
    if (application.deadline && new Date() > new Date(application.deadline)) {
      return false; // Cannot withdraw after deadline
    }
    application.status = 'withdrawn';
    DataStorage.saveApplications(applicationsCache);
    return true;
  }
  return false;
};

export const markApplicationEditable = (id: string): boolean => {
  const application = applicationsCache.find(app => app.id === id);
  if (application) {
    application.status = 'editable';
    application.isEditable = true;
    DataStorage.saveApplications(applicationsCache);
    return true;
  }
  return false;
};

export const resubmitApplication = (id: string): boolean => {
  const application = applicationsCache.find(app => app.id === id);
  if (application && application.isEditable) {
    application.status = 'submitted';
    application.isEditable = false;
    application.submissionDate = new Date().toISOString();
    DataStorage.saveApplications(applicationsCache);
    return true;
  }
  return false;
};

export const canWithdrawApplication = (application: Application): boolean => {
  if (application.status !== 'submitted') return false;
  if (application.deadline && new Date() > new Date(application.deadline)) return false;
  return true;
};

export const canResubmitApplication = (application: Application): boolean => {
  return application.status === 'editable' && application.isEditable === true;
};

export const generateReviewToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const assignReviewers = (applicationId: string, reviewerEmails: string[]): boolean => {
  const application = applicationsCache.find(app => app.id === applicationId);
  if (application) {
    application.assignedReviewers = reviewerEmails;
    DataStorage.saveApplications(applicationsCache);
    return true;
  }
  return false;
};

export const submitReviewerFeedback = (feedback: Omit<ReviewerFeedback, 'id' | 'submittedAt'>): boolean => {
  const application = applicationsCache.find(app => app.id === feedback.applicationId);
  if (application) {
    const newFeedback: ReviewerFeedback = {
      ...feedback,
      id: generateReviewToken(),
      submittedAt: new Date().toISOString(),
    };
    
    if (!application.reviewerFeedback) {
      application.reviewerFeedback = [];
    }
    application.reviewerFeedback.push(newFeedback);
    DataStorage.saveApplications(applicationsCache);
    
    return true;
  }
  return false;
};

export const getReviewerFeedback = (applicationId: string): ReviewerFeedback[] => {
  const application = applicationsCache.find(app => app.id === applicationId);
  return application?.reviewerFeedback || [];
};

export const getApplicationByReviewToken = (token: string): Application | null => {
  // In a real app, this would be more secure with database lookup
  const storedTokens = JSON.parse(localStorage.getItem('review-tokens') || '{}');
  const applicationId = storedTokens[token];
  if (applicationId) {
    return getApplicationById(applicationId) || null;
  }
  return null;
};

export const storeReviewToken = (applicationId: string, token: string): void => {
  const storedTokens = JSON.parse(localStorage.getItem('review-tokens') || '{}');
  storedTokens[token] = applicationId;
  localStorage.setItem('review-tokens', JSON.stringify(storedTokens));
};

export const updateApplicationForRevision = (id: string, newProposalTitle: string, newProposalFile: string): boolean => {
  const application = applicationsCache.find(app => app.id === id);
  if (application && (application.status === 'editable' || application.status === 'needs_revision')) {
    application.proposalTitle = newProposalTitle;
    application.proposalFileName = newProposalFile;
    application.status = 'submitted';
    application.isEditable = false;
    application.submissionDate = new Date().toISOString();
    application.revisionCount = (application.revisionCount || 0) + 1;
    
    // Store original submission date if not already stored
    if (!application.originalSubmissionDate) {
      application.originalSubmissionDate = application.submissionDate;
    }
    
    DataStorage.saveApplications(applicationsCache);
    return true;
  }
  return false;
};

export const markApplicationNeedsRevision = (id: string, feedback: string): boolean => {
  const application = applicationsCache.find(app => app.id === id);
  if (application) {
    application.status = 'needs_revision';
    application.isEditable = true;
    application.reviewComments = feedback;
    
    // Add grants manager feedback as a reviewer feedback entry
    if (!application.reviewerFeedback) {
      application.reviewerFeedback = [];
    }
    
    const managerFeedback: ReviewerFeedback = {
      id: generateReviewToken(),
      applicationId: id,
      reviewerEmail: 'grants.manager@grants.edu',
      reviewerName: 'Grants Manager',
      comments: feedback,
      decision: 'request_changes',
      submittedAt: new Date().toISOString(),
      reviewToken: generateReviewToken()
    };
    
    application.reviewerFeedback.push(managerFeedback);
    DataStorage.saveApplications(applicationsCache);
    
    return true;
  }
  return false;
};

export const canUpdateApplication = (application: Application): boolean => {
  return application.status === 'needs_revision' || application.status === 'editable';
};

export const getApplicationRevisionHistory = (id: string): { count: number; originalDate: string; latestDate: string } => {
  const application = applicationsCache.find(app => app.id === id);
  if (application) {
    return {
      count: application.revisionCount || 0,
      originalDate: application.originalSubmissionDate || application.submissionDate,
      latestDate: application.submissionDate
    };
  }
  return { count: 0, originalDate: '', latestDate: '' };
};

export const getStatusColor = (status: Application['status']): string => {
  switch (status) {
    case 'submitted':
      return 'bg-blue-100 text-blue-800';
    case 'under_review':
      return 'bg-yellow-100 text-yellow-800';
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'withdrawn':
      return 'bg-gray-100 text-gray-800';
    case 'editable':
      return 'bg-orange-100 text-orange-800';
    case 'needs_revision':
      return 'bg-purple-100 text-purple-800';
    case 'awaiting_signoff':
      return 'bg-purple-100 text-purple-800';
    case 'signoff_complete':
      return 'bg-indigo-100 text-indigo-800';
    case 'contract_pending':
      return 'bg-cyan-100 text-cyan-800';
    case 'contract_received':
      return 'bg-emerald-100 text-emerald-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Biodata management
export const saveBiodata = (email: string, biodata: ResearcherBiodata): void => {
  localStorage.setItem(`researcher-biodata-${email}`, JSON.stringify(biodata));
};

export const getBiodata = (email: string): ResearcherBiodata | null => {
  const saved = localStorage.getItem(`researcher-biodata-${email}`);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (error) {
      console.error('Error parsing biodata:', error);
    }
  }
  return null;
};

export const initiateSignOffWorkflow = (applicationId: string, awardAmount: number, approvers: { role: 'DORI' | 'DVC' | 'VC'; email: string; name?: string }[]): boolean => {
  const application = applicationsCache.find(app => app.id === applicationId);
  if (application && application.status === 'approved') {
    application.status = 'awaiting_signoff';
    application.awardAmount = awardAmount;
    application.signOffApprovals = approvers.map(approver => ({
      id: generateReviewToken(),
      applicationId,
      role: approver.role,
      approverEmail: approver.email,
      approverName: approver.name,
      status: 'pending' as const,
      signOffToken: generateReviewToken(),
    }));
    
    // Store sign-off tokens
    application.signOffApprovals.forEach(approval => {
      storeSignOffToken(applicationId, approval.signOffToken, approval.role);
    });
    
    DataStorage.saveApplications(applicationsCache);
    return true;
  }
  return false;
};

export const submitSignOffApproval = (token: string, decision: 'approved' | 'rejected', comments?: string, approverName?: string): boolean => {
  const storedTokens = JSON.parse(localStorage.getItem('signoff-tokens') || '{}');
  const tokenData = storedTokens[token];
  
  if (tokenData) {
    const application = getApplicationById(tokenData.applicationId);
    if (application && application.signOffApprovals) {
      const approval = application.signOffApprovals.find(a => a.signOffToken === token);
      if (approval && approval.status === 'pending') {
        approval.status = decision;
        approval.comments = comments;
        approval.approvedAt = new Date().toISOString();
        if (approverName) approval.approverName = approverName;
        
        // Check if all approvals are complete
        const allApproved = application.signOffApprovals.every(a => a.status === 'approved');
        const anyRejected = application.signOffApprovals.some(a => a.status === 'rejected');
        
        if (anyRejected) {
          application.status = 'rejected';
        } else if (allApproved) {
          application.status = 'signoff_complete';
          application.awardLetterGenerated = true;
        }
        
        return true;
      }
    }
  }
  return false;
};

export const getApplicationBySignOffToken = (token: string): { application: Application; approval: SignOffApproval } | null => {
  const storedTokens = JSON.parse(localStorage.getItem('signoff-tokens') || '{}');
  const tokenData = storedTokens[token];
  
  if (tokenData) {
    const application = getApplicationById(tokenData.applicationId);
    if (application && application.signOffApprovals) {
      const approval = application.signOffApprovals.find(a => a.signOffToken === token);
      if (approval) {
        return { application, approval };
      }
    }
  }
  return null;
};

export const storeSignOffToken = (applicationId: string, token: string, role: string): void => {
  const storedTokens = JSON.parse(localStorage.getItem('signoff-tokens') || '{}');
  storedTokens[token] = { applicationId, role };
  localStorage.setItem('signoff-tokens', JSON.stringify(storedTokens));
};

export const submitContract = (applicationId: string, contractFileName: string): boolean => {
  const application = applicationsCache.find(app => app.id === applicationId);
  if (application && application.status === 'signoff_complete') {
    application.status = 'contract_pending';
    application.contractFileName = contractFileName;
    DataStorage.saveApplications(applicationsCache);
    return true;
  }
  return false;
};

export const confirmContractReceipt = (applicationId: string): boolean => {
  const application = applicationsCache.find(app => app.id === applicationId);
  if (application && application.status === 'contract_pending') {
    application.status = 'contract_received';
    DataStorage.saveApplications(applicationsCache);
    return true;
  }
  return false;
};

export const getSignOffStatus = (application: Application): { current: string; completed: number; total: number } => {
  if (!application.signOffApprovals) {
    return { current: 'Not initiated', completed: 0, total: 0 };
  }
  
  const approved = application.signOffApprovals.filter(a => a.status === 'approved');
  const rejected = application.signOffApprovals.filter(a => a.status === 'rejected');
  const pending = application.signOffApprovals.filter(a => a.status === 'pending');
  
  if (rejected.length > 0) {
    return { current: `Rejected by ${rejected[0].role}`, completed: approved.length, total: application.signOffApprovals.length };
  }
  
  if (pending.length === 0) {
    return { current: 'All approvals complete', completed: approved.length, total: application.signOffApprovals.length };
  }
  
  const nextPending = pending[0];
  return { current: `Awaiting ${nextPending.role} approval`, completed: approved.length, total: application.signOffApprovals.length };
};
