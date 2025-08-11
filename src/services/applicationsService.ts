import applicationsData from '../data/applications.json';
import { DataStorage } from '../utils/dataStorage';
import { apiClient } from '../lib/api';

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
    console.log('Fetching applications from backend API...');
    
    // Use apiClient for consistent authentication and error handling
    const response = await apiClient.get('/applications');
    
    console.log('Backend response received:', response);
    
    // Map backend response to frontend Application interface
    const applications = response.map((app: any) => ({
      id: app.id,
      grantId: app.grantId || app.grant_id,
      applicantName: app.applicantName || app.applicant_name,
      email: app.email,
      proposalTitle: app.proposalTitle || app.proposal_title,
      status: app.status,
      submissionDate: app.submissionDate || app.submission_date,
      reviewComments: app.reviewComments || app.review_comments || '',
      biodata: app.biodata,
      deadline: app.deadline,
      isEditable: app.isEditable || app.is_editable,
      assignedReviewers: app.assignedReviewers || app.assigned_reviewers || [],
      reviewerFeedback: app.reviewerFeedback || app.reviewer_feedback || [],
      signOffApprovals: app.signOffApprovals || app.sign_off_approvals || [],
      awardAmount: app.awardAmount || app.award_amount,
      contractFileName: app.contractFileName || app.contract_file_name,
      awardLetterGenerated: app.awardLetterGenerated || app.award_letter_generated,
      revisionCount: app.revisionCount || app.revision_count || 0,
      originalSubmissionDate: app.originalSubmissionDate || app.original_submission_date,
      proposalFileName: app.proposalFileName || app.proposal_file_name
    }));
    
    console.log(`Successfully fetched ${applications.length} applications from backend`);
    return applications;
    
  } catch (error: any) {
    console.error('Error fetching applications from backend:', error);
    
    // Throw a more descriptive error instead of silently falling back
    let errorMessage = 'Failed to load applications';
    if (error.response?.status === 401) {
      errorMessage = 'Authentication failed. Please log in again.';
    } else if (error.response?.status === 403) {
      errorMessage = 'You do not have permission to view applications.';
    } else if (error.response?.status === 500) {
      errorMessage = 'Server error. Please try again later.';
    } else if (error.message?.includes('Network')) {
      errorMessage = 'Network error. Please check your connection and try again.';
    } else if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    }
    
    // Throw error to be handled by the calling component
    throw new Error(errorMessage);
  }
};

export const getUserApplications = async (): Promise<Application[]> => {
  try {
    console.log('Fetching user applications from backend API...');
    
    // Use apiClient for consistent authentication and error handling
    const response = await apiClient.get('/applications/my');
    
    console.log('Backend response received:', response);
    
    // Map backend response to frontend Application interface
    const applications = response.map((app: any) => ({
      id: app.id,
      grantId: app.grantId || app.grant_id,
      applicantName: app.applicantName || app.applicant_name,
      email: app.email,
      proposalTitle: app.proposalTitle || app.proposal_title,
      status: app.status,
      submissionDate: app.submissionDate || app.submission_date,
      reviewComments: app.reviewComments || app.review_comments || '',
      biodata: app.biodata,
      deadline: app.deadline,
      isEditable: app.isEditable || app.is_editable,
      assignedReviewers: app.assignedReviewers || app.assigned_reviewers || [],
      reviewerFeedback: app.reviewerFeedback || app.reviewer_feedback || [],
      signOffApprovals: app.signOffApprovals || app.sign_off_approvals || [],
      awardAmount: app.awardAmount || app.award_amount,
      contractFileName: app.contractFileName || app.contract_file_name,
      awardLetterGenerated: app.awardLetterGenerated || app.award_letter_generated,
      revisionCount: app.revisionCount || app.revision_count || 0,
      originalSubmissionDate: app.originalSubmissionDate || app.original_submission_date,
      proposalFileName: app.proposalFileName || app.proposal_file_name
    }));
    
    console.log(`Successfully fetched ${applications.length} user applications from backend`);
    return applications;
    
  } catch (error: any) {
    console.error('Error fetching user applications from backend:', error);
    
    // Throw a more descriptive error instead of silently falling back
    let errorMessage = 'Failed to load your applications';
    if (error.response?.status === 401) {
      errorMessage = 'Authentication failed. Please log in again.';
    } else if (error.response?.status === 403) {
      errorMessage = 'You do not have permission to view applications.';
    } else if (error.response?.status === 500) {
      errorMessage = 'Server error. Please try again later.';
    } else if (error.message?.includes('Network')) {
      errorMessage = 'Network error. Please check your connection and try again.';
    } else if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    }
    
    // Throw error to be handled by the calling component
    throw new Error(errorMessage);
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
    console.log('Submitting application with data:', applicationData);
    
    // Use API client for consistent authentication and error handling
    const submittedApp = await apiClient.post('/applications', {
      grantId: applicationData.grantId,
      applicantName: applicationData.applicantName,
      email: applicationData.email,
      proposalTitle: applicationData.proposalTitle,
      institution: applicationData.institution || 'Not specified',
      department: applicationData.department || 'Not specified',
      projectSummary: applicationData.projectSummary || '',
      objectives: applicationData.objectives || '',
      methodology: applicationData.methodology || '',
      expectedOutcomes: applicationData.expectedOutcomes || '',
      budgetAmount: applicationData.budgetAmount || 0,
      budgetJustification: applicationData.budgetJustification || '',
      timeline: applicationData.timeline || '',
      biodata: applicationData.biodata,
      proposalFileName: applicationData.proposalFileName
    });
    
    console.log('Backend response:', submittedApp);
    
    // Convert backend response to frontend Application interface
    const application: Application = {
      id: submittedApp.id,
      grantId: submittedApp.grantId || submittedApp.grant_id,
      applicantName: submittedApp.applicantName || submittedApp.researcher_name,
      email: submittedApp.email,
      proposalTitle: submittedApp.proposalTitle || submittedApp.title,
      status: submittedApp.status || 'submitted',
      submissionDate: submittedApp.submissionDate || submittedApp.submitted_at || new Date().toISOString(),
      reviewComments: submittedApp.reviewComments || '',
      biodata: submittedApp.biodata,
      deadline: submittedApp.deadline,
      isEditable: submittedApp.isEditable || false,
      assignedReviewers: submittedApp.assignedReviewers || [],
      reviewerFeedback: submittedApp.reviewerFeedback || [],
      signOffApprovals: submittedApp.signOffApprovals || [],
      awardAmount: submittedApp.awardAmount,
      contractFileName: submittedApp.contractFileName,
      awardLetterGenerated: submittedApp.awardLetterGenerated || false,
      revisionCount: submittedApp.revisionCount || 0,
      originalSubmissionDate: submittedApp.originalSubmissionDate,
      proposalFileName: submittedApp.proposalFileName
    };

    console.log('Converted application:', application);
    return application;
  } catch (error) {
    console.error('Error submitting application:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('403')) {
        throw new Error('You do not have permission to submit this application');
      } else if (error.message.includes('401')) {
        throw new Error('Your session has expired. Please log in again');
      } else if (error.message.includes('400')) {
        throw new Error('Invalid application data. Please check all required fields');
      } else if (error.message.includes('Network')) {
        throw new Error('Network error. Please check your connection and try again');
      }
    }
    
    throw error;
  }
};

export const withdrawApplication = async (id: string): Promise<Application> => {
  try {
    console.log(`Withdrawing application ${id}`);
    
    const response = await apiClient.put(`/applications/${id}/withdraw`);
    
    console.log('Application withdrawn successfully:', response);
    
    // Convert backend response to frontend Application interface
    const application: Application = {
      id: response.id,
      grantId: response.grantId || response.grant_id,
      applicantName: response.applicantName || response.applicant_name,
      email: response.email,
      proposalTitle: response.proposalTitle || response.proposal_title,
      status: response.status,
      submissionDate: response.submissionDate || response.submission_date,
      reviewComments: response.reviewComments || response.review_comments || '',
      biodata: response.biodata,
      deadline: response.deadline,
      isEditable: response.isEditable || response.is_editable,
      assignedReviewers: response.assignedReviewers || response.assigned_reviewers || [],
      reviewerFeedback: response.reviewerFeedback || response.reviewer_feedback || [],
      signOffApprovals: response.signOffApprovals || response.sign_off_approvals || [],
      awardAmount: response.awardAmount || response.award_amount,
      contractFileName: response.contractFileName || response.contract_file_name,
      awardLetterGenerated: response.awardLetterGenerated || response.award_letter_generated,
      revisionCount: response.revisionCount || response.revision_count || 0,
      originalSubmissionDate: response.originalSubmissionDate || response.original_submission_date,
      proposalFileName: response.proposalFileName || response.proposal_file_name
    };
    
    return application;
  } catch (error: any) {
    console.error('Error withdrawing application:', error);
    
    let errorMessage = 'Failed to withdraw application';
    if (error.response?.status === 401) {
      errorMessage = 'Authentication failed. Please log in again.';
    } else if (error.response?.status === 403) {
      errorMessage = 'You can only withdraw your own applications.';
    } else if (error.response?.status === 404) {
      errorMessage = 'Application not found.';
    } else if (error.response?.status === 400) {
      errorMessage = error.response?.data?.detail || 'Cannot withdraw this application.';
    } else if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    }
    
    throw new Error(errorMessage);
  }
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

export const assignReviewers = async (applicationId: string, reviewerEmails: string[]): Promise<{ reviewTokens: Array<{ email: string; token: string; link: string }> }> => {
  try {
    console.log(`Assigning reviewers to application ${applicationId}:`, reviewerEmails);
    
    const response = await apiClient.post(`/reviewers/assign/${applicationId}`, {
      reviewer_emails: reviewerEmails
    });
    
    console.log('Reviewers assigned successfully:', response);
    
    // Generate review links for frontend use
    const reviewTokens = response.review_tokens.map((tokenData: any) => ({
      email: tokenData.email,
      token: tokenData.token,
      link: `${window.location.origin}/review/${tokenData.token}`
    }));
    
    return { reviewTokens };
  } catch (error: any) {
    console.error('Error assigning reviewers:', error);
    
    let errorMessage = 'Failed to assign reviewers';
    if (error.response?.status === 401) {
      errorMessage = 'Authentication failed. Please log in again.';
    } else if (error.response?.status === 403) {
      errorMessage = 'You do not have permission to assign reviewers.';
    } else if (error.response?.status === 404) {
      errorMessage = 'Application not found.';
    } else if (error.response?.status === 400) {
      errorMessage = error.response?.data?.detail || 'Invalid reviewer assignment data.';
    } else if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    }
    
    throw new Error(errorMessage);
  }
};

export const submitReviewerFeedback = async (feedback: Omit<ReviewerFeedback, 'id' | 'submittedAt'>): Promise<{ feedbackId: string }> => {
  try {
    console.log(`Submitting reviewer feedback for application ${feedback.applicationId}:`, feedback);
    
    const response = await apiClient.post(`/reviewers/feedback/${feedback.applicationId}`, {
      reviewer_email: feedback.reviewerEmail,
      reviewer_name: feedback.reviewerName,
      comments: feedback.comments,
      decision: feedback.decision,
      annotated_file_name: feedback.annotatedFileName,
      review_token: feedback.reviewToken
    });
    
    console.log('Reviewer feedback submitted successfully:', response);
    
    return { feedbackId: response.feedback_id };
  } catch (error: any) {
    console.error('Error submitting reviewer feedback:', error);
    
    let errorMessage = 'Failed to submit reviewer feedback';
    if (error.response?.status === 401) {
      errorMessage = 'Authentication failed. Please log in again.';
    } else if (error.response?.status === 403) {
      errorMessage = 'You do not have permission to submit feedback.';
    } else if (error.response?.status === 404) {
      errorMessage = 'Application not found.';
    } else if (error.response?.status === 400) {
      errorMessage = error.response?.data?.detail || 'Invalid feedback data.';
    } else if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    }
    
    throw new Error(errorMessage);
  }
};

export const getReviewerFeedback = (applicationId: string): ReviewerFeedback[] => {
  const application = applicationsCache.find(app => app.id === applicationId);
  return application?.reviewerFeedback || [];
};

// Helper function for cached data operations (used by sign-off workflow)
const getApplicationById = (id: string): Application | null => {
  return applicationsCache.find(app => app.id === id) || null;
};

export const getApplicationByReviewToken = async (token: string): Promise<Application | null> => {
  try {
    console.log(`Getting application by review token: ${token}`);
    
    const response = await apiClient.get(`/reviewers/application/${token}`);
    
    console.log('Application retrieved by token:', response);
    
    // Convert backend response to frontend Application interface
    const application: Application = {
      id: response.id,
      grantId: response.grantId || response.grant_id,
      applicantName: response.applicantName || response.applicant_name,
      email: response.email,
      proposalTitle: response.proposalTitle || response.proposal_title,
      status: response.status,
      submissionDate: response.submissionDate || response.submission_date,
      reviewComments: response.reviewComments || response.review_comments || '',
      biodata: response.biodata,
      deadline: response.deadline,
      isEditable: response.isEditable || response.is_editable,
      assignedReviewers: response.assignedReviewers || response.assigned_reviewers || [],
      reviewerFeedback: response.reviewerFeedback || response.reviewer_feedback || [],
      signOffApprovals: response.signOffApprovals || response.sign_off_approvals || [],
      awardAmount: response.awardAmount || response.award_amount,
      contractFileName: response.contractFileName || response.contract_file_name,
      awardLetterGenerated: response.awardLetterGenerated || response.award_letter_generated,
      revisionCount: response.revisionCount || response.revision_count || 0,
      originalSubmissionDate: response.originalSubmissionDate || response.original_submission_date,
      proposalFileName: response.proposalFileName || response.proposal_file_name
    };
    
    return application;
  } catch (error: any) {
    console.error('Error getting application by review token:', error);
    
    if (error.response?.status === 404) {
      return null; // Invalid token or application not found
    }
    
    let errorMessage = 'Failed to load application';
    if (error.response?.status === 401) {
      errorMessage = 'Authentication failed. Please log in again.';
    } else if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    }
    
    throw new Error(errorMessage);
  }
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
export const saveBiodata = async (email: string, biodata: ResearcherBiodata): Promise<void> => {
  try {
    console.log('Saving biodata for user:', email, biodata);
    
    await apiClient.put('/users/me/biodata', biodata);
    
    console.log('Biodata saved successfully');
  } catch (error: any) {
    console.error('Error saving biodata:', error);
    
    let errorMessage = 'Failed to save biodata';
    if (error.response?.status === 401) {
      errorMessage = 'Authentication failed. Please log in again.';
    } else if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    }
    
    throw new Error(errorMessage);
  }
};

export const getBiodata = async (email: string): Promise<ResearcherBiodata | null> => {
  try {
    console.log('Getting biodata for user:', email);
    
    const response = await apiClient.get('/users/me/biodata');
    
    console.log('Biodata retrieved successfully:', response);
    
    return response.biodata || null;
  } catch (error: any) {
    console.error('Error getting biodata:', error);
    
    if (error.response?.status === 404) {
      return null; // No biodata found
    }
    
    let errorMessage = 'Failed to load biodata';
    if (error.response?.status === 401) {
      errorMessage = 'Authentication failed. Please log in again.';
    } else if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    }
    
    throw new Error(errorMessage);
  }
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
