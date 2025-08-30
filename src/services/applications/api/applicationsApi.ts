import { apiClient } from '../../../lib/api';
import { Application } from '../types';
import { mapApplicationResponse, mapApplicationsList } from '../mappers';
import { handleApplicationError } from '../utils/errorHandling';
import api from '../../../lib/api';

export interface ApplicationSubmissionData {
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
  biodata?: any;
  proposalFileName?: string;
  proposalFileData?: string;
  proposalFileSize?: number;
  proposalFileType?: string;
}

export interface ApplicationUpdateData {
  proposalTitle: string;
  status: string;
  revisionNote?: {
    revisionNumber: number;
    notes: string;
    submittedAt: string;
  };
  proposalFileName?: string;
  proposalFileData?: string;
  proposalFileSize?: number;
  proposalFileType?: string;
}

/**
 * Fetch a single application with full details
 */
export const getApplication = async (id: string): Promise<Application> => {
  try {
    console.log(`Fetching application ${id} from backend API...`);
    const response = await apiClient.get(`/applications/${id}`);
    console.log('Application details received:', response);
    return mapApplicationResponse(response);
  } catch (error) {
    handleApplicationError(error);
  }
};

/**
 * Generate award letter (manager/admin only) once application is signoff_approved
 */
export const generateAwardLetter = async (id: string): Promise<void> => {
  try {
    console.log(`Generating award letter for application ${id}`);
    await apiClient.post(`/applications/${id}/award-letter/generate`);
    console.log('Award letter generated');
  } catch (error) {
    handleApplicationError(error);
  }
};

/**
 * Download generated award letter for an application
 */
export const downloadAwardLetter = async (id: string): Promise<void> => {
  try {
    console.log(`Downloading award letter for application ${id}`);
    const response = await apiClient.get(`/applications/${id}/award-letter`);
    
    const letterData = response.data;
    
    // Convert base64 to blob
    const byteCharacters = atob(letterData.file_data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: letterData.file_type });
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = letterData.filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    console.log('Award letter downloaded successfully');
  } catch (error) {
    handleApplicationError(error);
  }
};

/**
 * Confirm contract receipt (manager/admin only)
 */
export const confirmContractReceipt = async (id: string, comments?: string): Promise<void> => {
  try {
    console.log(`Confirming contract receipt for application ${id}`);
    await apiClient.post(`/applications/${id}/contract/confirm-receipt`, {
      comments: comments || ''
    });
    console.log('Contract receipt confirmed');
  } catch (error) {
    handleApplicationError(error);
  }
};

/**
 * Download application proposal document
 */
export const downloadDocument = async (id: string): Promise<void> => {
  try {
    console.log(`Downloading document for application ${id}`);
    const response = await apiClient.get(`/applications/${id}/document`);
    
    const docData = response.data;
    
    // For now, just show the metadata since actual file storage needs implementation
    console.log('Document metadata:', docData);
    
    // In a real implementation, you would handle the file_data like in downloadAwardLetter
    // For now, just show a message to the user
    alert(`Document: ${docData.filename}\nSize: ${docData.file_size} bytes\nNote: File storage integration needed for actual download.`);
    
  } catch (error) {
    handleApplicationError(error);
  }
};

/**
 * Fetch all applications (admin/manager view)
 */
export const getAllApplications = async (): Promise<Application[]> => {
  try {
    console.log('Fetching applications from backend API...');
    const response = await apiClient.get('/applications');
    console.log('Backend response received:', response);
    
    const applications = mapApplicationsList(response);
    console.log(`Successfully fetched ${applications.length} applications from backend`);
    return applications;
  } catch (error) {
    console.error('Error fetching applications:', error);
    return [];
  }
};

/**
 * Fetch applications for the current user
 */
export const getUserApplications = async (): Promise<Application[]> => {
  try {
    console.log('Fetching user applications from backend API...');
    const response = await apiClient.get('/applications/my');
    console.log('Backend response received:', response);
    
    const applications = mapApplicationsList(response);
    console.log(`Successfully fetched ${applications.length} user applications from backend`);
    return applications;
  } catch (error) {
    console.error('Error fetching user applications:', error);
    return [];
  }
};

/**
 * Submit a new grant application
 */
export const submitApplication = async (applicationData: ApplicationSubmissionData): Promise<Application> => {
  try {
    console.log('Submitting application with data:', applicationData);
    
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
    const application: Application = mapApplicationResponse(submittedApp);
    console.log('Converted application:', application);
    return application;
  } catch (error) {
    handleApplicationError(error);
  }
};

/**
 * Update application status
 */
export const updateApplicationStatus = async (
  id: string, 
  status: Application['status'], 
  comments?: string
): Promise<Application> => {
  try {
    console.log(`Updating application ${id} status to ${status}`);
    
    const response = await apiClient.put(`/applications/${id}/status`, {
      status,
      comments: comments || ''
    });
    
    console.log('Application status updated successfully:', response);
    return mapApplicationResponse(response);
  } catch (error) {
    handleApplicationError(error);
  }
};

/**
 * Withdraw an application
 */
export const withdrawApplication = async (id: string): Promise<Application> => {
  try {
    console.log(`Withdrawing application ${id}`);
    
    const response = await apiClient.put(`/applications/${id}/withdraw`);
    console.log('Application withdrawn successfully:', response);
    
    return mapApplicationResponse(response);
  } catch (error) {
    handleApplicationError(error);
  }
};

/**
 * Mark application as editable
 */
export const markApplicationEditable = async (id: string): Promise<Application> => {
  try {
    console.log(`Marking application ${id} as editable`);
    
    const response = await apiClient.put(`/applications/${id}/status`, {
      status: 'editable',
      comments: 'Application marked as editable for revision'
    });
    
    console.log('Application marked as editable successfully:', response);
    return mapApplicationResponse(response);
  } catch (error) {
    handleApplicationError(error);
  }
};

/**
 * Resubmit an application
 */
export const resubmitApplication = async (id: string): Promise<Application> => {
  try {
    console.log(`Resubmitting application ${id}`);
    
    const response = await apiClient.put(`/applications/${id}/status`, {
      status: 'submitted',
      comments: 'Application resubmitted by researcher'
    });
    
    console.log('Application resubmitted successfully:', response);
    return mapApplicationResponse(response);
  } catch (error) {
    handleApplicationError(error);
  }
};

/**
 * Update application for revision with new content
 */
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

    // Create a new revision note entry if revision notes are provided
    const newRevisionNote = {
      revisionNumber: 0, // Will be set by backend based on current revision count
      notes: revisionNotes || 'Application revised and resubmitted by researcher',
      submittedAt: new Date().toISOString()
    };

    let payload: ApplicationUpdateData = {
      proposalTitle: newProposalTitle,
      status: 'submitted',
      revisionNote: newRevisionNote,
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
    return mapApplicationResponse(response);
  } catch (error) {
    handleApplicationError(error);
  }
};
