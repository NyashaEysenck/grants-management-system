import applicationsData from '../data/applications.json';
import { DataStorage } from '../utils/dataStorage';
import { apiClient } from '../lib/api';
import axios from 'axios';
import { Application, ResearcherBiodata, ReviewerFeedback, SignOffApproval } from './applications/types';
import { mapApplicationResponse, mapApplicationsList } from './applications/mappers';

// Re-export types for use by other components
export type { Application, ResearcherBiodata, ReviewerFeedback, SignOffApproval };

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
    const applications = mapApplicationsList(response);
    
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
    const applications = mapApplicationsList(response);
    
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
  proposalFileData?: string;
  proposalFileSize?: number;
  proposalFileType?: string;
}): Promise<Application> => {
  try {
    console.log('Submitting application with data:', applicationData);
    
    // Use API client for consistent authentication and error handling
    // Note: FastAPI route is defined at "/applications/" (with trailing slash). Using the
    // trailing slash avoids a 307 redirect on POST that can cause connection reset behind proxies.
    const submittedApp = await apiClient.post('/applications/', {
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
      proposalFileName: applicationData.proposalFileName,
      proposalFileData: applicationData.proposalFileData,
      proposalFileSize: applicationData.proposalFileSize,
      proposalFileType: applicationData.proposalFileType
    });
    
    console.log('Backend response:', submittedApp);
    
    // Convert backend response to frontend Application interface
    const application: Application = mapApplicationResponse(submittedApp);

    console.log('Converted application:', application);
    return application;
  } catch (error) {
    console.error('Error submitting application:', error);
    // Extra diagnostics for Axios errors
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data;
      if (status || data) {
        console.error('Submission failed with status/data:', status, data);
      }
    }
    
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

export const updateApplicationStatus = async (id: string, status: Application['status'], comments?: string): Promise<Application> => {
  try {
    console.log(`Updating application ${id} status to ${status}`);
    
    const response = await apiClient.put(`/applications/${id}/status`, {
      status,
      comments: comments || ''
    });
    
    console.log('Application status updated successfully:', response);
    
    // Convert backend response to frontend Application interface
    const application: Application = mapApplicationResponse(response);
    
    return application;
  } catch (error: any) {
    console.error('Error updating application status:', error);
    
    let errorMessage = 'Failed to update application status';
    if (error.response?.status === 401) {
      errorMessage = 'Authentication failed. Please log in again.';
    } else if (error.response?.status === 403) {
      errorMessage = 'You do not have permission to update this application.';
    } else if (error.response?.status === 404) {
      errorMessage = 'Application not found.';
    } else if (error.response?.status === 400) {
      errorMessage = error.response?.data?.detail || 'Invalid status update data.';
    } else if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    }
    
    throw new Error(errorMessage);
  }
};

export const withdrawApplication = async (id: string): Promise<Application> => {
  try {
    console.log(`Withdrawing application ${id}`);
    
    const response = await apiClient.put(`/applications/${id}/withdraw`);
    
    console.log('Application withdrawn successfully:', response);
    
    // Convert backend response to frontend Application interface
    const application: Application = mapApplicationResponse(response);
    
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

export const markApplicationEditable = async (id: string): Promise<Application> => {
  try {
    console.log(`Marking application ${id} as editable`);
    
    const response = await apiClient.put(`/applications/${id}/status`, {
      status: 'editable',
      comments: 'Application marked as editable for revision'
    });
    
    console.log('Application marked as editable successfully:', response);
    
    // Convert backend response to frontend Application interface
    const application: Application = mapApplicationResponse(response);
    
    return application;
  } catch (error: any) {
    console.error('Error marking application as editable:', error);
    
    let errorMessage = 'Failed to mark application as editable';
    if (error.response?.status === 401) {
      errorMessage = 'Authentication failed. Please log in again.';
    } else if (error.response?.status === 403) {
      errorMessage = 'You do not have permission to edit this application.';
    } else if (error.response?.status === 404) {
      errorMessage = 'Application not found.';
    } else if (error.response?.status === 400) {
      errorMessage = error.response?.data?.detail || 'Cannot mark this application as editable.';
    } else if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    }
    
    throw new Error(errorMessage);
  }
};

export const resubmitApplication = async (id: string): Promise<Application> => {
  try {
    console.log(`Resubmitting application ${id}`);
    
    const response = await apiClient.put(`/applications/${id}/status`, {
      status: 'submitted',
      comments: 'Application resubmitted by researcher'
    });
    
    console.log('Application resubmitted successfully:', response);
    
    // Convert backend response to frontend Application interface
    const application: Application = mapApplicationResponse(response);
    
    return application;
  } catch (error: any) {
    console.error('Error resubmitting application:', error);
    console.error('Error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      config: error.config
    });
    
    let errorMessage = 'Failed to resubmit application';
    if (error.response?.status === 401) {
      errorMessage = 'Authentication failed. Please log in again.';
    } else if (error.response?.status === 403) {
      errorMessage = 'You can only resubmit your own applications.';
    } else if (error.response?.status === 404) {
      errorMessage = 'Application not found.';
    } else if (error.response?.status === 400) {
      errorMessage = error.response?.data?.detail || 'Cannot resubmit this application.';
    } else if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
      errorMessage = 'Network error. Please check if the backend server is running.';
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Cannot connect to server. Please ensure the backend is running on port 8000.';
    }
    
    throw new Error(errorMessage);
  }
};

export const canWithdrawApplication = (application: Application): boolean => {
  if (application.status !== 'submitted') return false;
  if (application.deadline && new Date() > new Date(application.deadline)) return false;
  return true;
};

export const canResubmitApplication = (application: Application): boolean => {
  // Applications can be resubmitted if they are in editable state, need revision, or were rejected/withdrawn
  const resubmittableStatuses = ['editable', 'needs_revision', 'rejected', 'withdrawn'];
  return resubmittableStatuses.includes(application.status) || 
         (application.status === 'editable' && application.isEditable === true);
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

export const updateApplicationForRevision = async (
  id: string,
  newProposalTitle: string,
  newFile?: File,
  revisionNotes?: string,
  onProgress?: (percent: number) => void
): Promise<Application> => {
  try {
    console.log(`Updating application ${id} for revision`);
    console.log('New proposal title:', newProposalTitle);
    if (newFile) console.log('New file selected:', newFile.name, newFile.type, newFile.size);

    // Helper to convert File -> base64 string (no prefix)
    const fileToBase64 = (file: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1] || result; // strip data:...;base64,
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

    let payload: any = {
      proposalTitle: newProposalTitle,
      status: 'submitted',
      revisionNotes: revisionNotes || 'Application revised and resubmitted by researcher',
    };

    if (newFile) {
      const base64 = await fileToBase64(newFile);
      payload = {
        ...payload,
        proposalFileName: newFile.name,
        proposalFileData: base64,
        proposalFileSize: newFile.size,
        proposalFileType: newFile.type || 'application/octet-stream',
      };
    }

    // Send update; progress callback if provided
    const response = await apiClient.put(`/applications/${id}`, payload, {
      onUploadProgress: (evt) => {
        if (onProgress && evt.total) {
          const percent = Math.round((evt.loaded * 100) / evt.total);
          onProgress(percent);
        }
      },
    });

    console.log('Application updated and resubmitted:', response);

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
      proposalFileName: response.proposalFileName || response.proposal_file_name,
    };

    return application;
  } catch (error: any) {
    console.error('Error updating application for revision:', error);
    console.error('Error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });

    let errorMessage = 'Failed to update application';
    if (error.response?.status === 401) {
      errorMessage = 'Authentication failed. Please log in again.';
    } else if (error.response?.status === 403) {
      errorMessage = 'You can only update your own applications.';
    } else if (error.response?.status === 404) {
      errorMessage = 'Application not found.';
    } else if (error.response?.status === 400) {
      errorMessage = error.response?.data?.detail || 'Cannot update this application.';
    } else if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
      errorMessage = 'Network error. Please check if the backend server is running.';
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Cannot connect to server. Please ensure the backend is running on port 8000.';
    }

    throw new Error(errorMessage);
  }
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
