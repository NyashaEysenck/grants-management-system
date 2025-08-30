export interface DocumentVersion {
  id: string;
  versionNumber: number;
  fileName: string;
  uploadedBy: string;
  uploadedAt: string;
  fileSize: string;
  notes?: string;
}

export interface Document {
  id: string;
  name: string;
  folder: 'Applications' | 'Projects' | 'Awards' | 'Reports';
  currentVersion: number;
  versions: DocumentVersion[];
  createdBy: string;
  createdAt: string;
  lastModified: string;
  tags?: string[];
}

export interface DocumentFolder {
  name: 'Applications' | 'Projects' | 'Awards' | 'Reports';
  description: string;
  icon: string;
  accessRoles: string[];
}

import api, { apiClient } from '../lib/api';

class DocumentsService {
  private documents: Document[] = [];

  constructor() {
    this.loadDocuments();
  }

  private loadDocuments(): void {
    // TO DO: implement API call to load documents
  }

  async getAllDocuments(): Promise<Document[]> {
    try {
      const response = await apiClient.get<Document[]>('/documents/');
      return response || [];
    } catch (error) {
      console.error('Error fetching documents:', error);
      return [];
    }
  }

  getDocumentsByUser(email: string): Document[] {
    return this.documents.filter(doc => 
      doc.versions.some(version => version.uploadedBy === email)
    );
  }

  async getDocumentsByFolder(folder: DocumentFolder['name']): Promise<Document[]> {
    try {
      return await apiClient.get<Document[]>(`/documents?folder=${folder}`);
    } catch (error) {
      console.error('Error fetching documents by folder:', error);
      return [];
    }
  }

  getDocumentById(id: string): Document | undefined {
    return this.documents.find(doc => doc.id === id);
  }

  async searchDocuments(query: string, userEmail?: string, isRestrictedUser = false): Promise<Document[]> {
    try {
      return await apiClient.get<Document[]>(`/documents?search=${encodeURIComponent(query)}`);
    } catch (error) {
      console.error('Error searching documents:', error);
      return [];
    }
  }

  async uploadDocument(
    name: string,
    folder: DocumentFolder['name'],
    file: File,
    notes?: string,
    onProgress?: (progress: number) => void
  ): Promise<{ id: string; message: string; filename: string; size: string }> {
    try {
      // Validate file before upload
      if (!file) {
        throw new Error('No file selected for upload');
      }

      if (file.size === 0) {
        throw new Error('Cannot upload empty file');
      }

      // Check file size (max 50MB)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        throw new Error(`File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds maximum allowed size of 50MB`);
      }

      // Check file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`File type "${file.type}" is not supported. Please upload PDF, Word, Excel, or text files.`);
      }

      console.log(`Starting upload: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

      const formData = new FormData();
      formData.append('name', name);
      formData.append('folder', folder);
      formData.append('file', file);
      if (notes) {
        formData.append('notes', notes);
      }

      // Use apiClient for proper authentication and error handling
      // Note: We lose progress tracking but gain proper auth handling
      try {
        // Simulate progress for user feedback
        if (onProgress) {
          onProgress(10);
          setTimeout(() => onProgress(30), 100);
          setTimeout(() => onProgress(60), 300);
          setTimeout(() => onProgress(90), 500);
        }

        const response = await apiClient.post('/documents/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 300000, // 5 minute timeout
        });

        if (onProgress) {
          onProgress(100);
        }

        console.log('Document uploaded successfully:', response);
        return response;
      } catch (error: any) {
        console.error('Upload error:', error);
        
        let errorMessage = 'Upload failed';
        if (error.response?.data?.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response?.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (error.response?.status === 403) {
          errorMessage = 'You do not have permission to upload documents.';
        } else if (error.response?.status === 413) {
          errorMessage = 'File too large. Please choose a smaller file.';
        } else if (error.message?.includes('timeout')) {
          errorMessage = 'Upload timed out. Please try again with a smaller file or check your connection.';
        } else if (error.message?.includes('Network')) {
          errorMessage = 'Network error during upload. Please check your connection and try again.';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        throw new Error(errorMessage);
      }

    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  async uploadNewVersion(
    documentId: string,
    file: File,
    notes?: string
  ): Promise<{ message: string; filename: string; size: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (notes) {
        formData.append('notes', notes);
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/documents/${documentId}/upload-version`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Version upload failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading new version:', error);
      throw error;
    }
  }

  async downloadDocument(documentId: string): Promise<void> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/documents/${documentId}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Download failed');
      }

      // Get filename from Content-Disposition header or use a default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'document';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading document:', error);
      throw error;
    }
  }

  // Download application document by filename for grants managers and reviewers
  async downloadApplicationDocument(applicationId: string, filename: string): Promise<void> {
    try {
      // Use the axios instance directly so we can access headers
      const response = await api.get(`/applications/${applicationId}/document/${encodeURIComponent(filename)}`, {
        responseType: 'blob',
        timeout: 60000, // 1 minute timeout for large files
      });

      // Get the content type from the response
      const contentType = response.headers['content-type'] || 'application/octet-stream';
      
      // Create a blob from the response data
      const blob = new Blob([response.data], { type: contentType });
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element to trigger the download
      const a = document.createElement('a');
      a.href = url;
      
      // Try to get the filename from Content-Disposition header, fallback to the provided filename
      let downloadFilename = filename;
      const contentDisposition = response.headers['content-disposition'] || '';
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      
      if (filenameMatch && filenameMatch[1]) {
        downloadFilename = filenameMatch[1].replace(/['"]/g, '');
      }
      
      // Set the download attribute with the filename
      a.download = downloadFilename;
      
      // Append to body, click and remove
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log('Application document downloaded successfully:', downloadFilename);
    } catch (error: any) {
      console.error('Error downloading application document:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error:', error.message);
      }
      
      let errorMessage = 'Failed to download document';
      if (error.response?.status === 404) {
        errorMessage = 'Document not found. It may have been deleted or moved.';
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to download this document.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Download timed out. The file may be too large or your connection is slow.';
      } else if (error.message?.includes('Network')) {
        errorMessage = 'Network error during download. Please check your connection.';
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      throw new Error(errorMessage);
    }
  }

  deleteDocument(documentId: string): boolean {
    const initialLength = this.documents.length;
    this.documents = this.documents.filter(doc => doc.id !== documentId);
    
    if (this.documents.length < initialLength) {
      return true;
    }
    return false;
  }

  deleteVersion(documentId: string, versionId: string): boolean {
    const document = this.documents.find(doc => doc.id === documentId);
    if (!document || document.versions.length <= 1) return false;

    const versionIndex = document.versions.findIndex(v => v.id === versionId);
    if (versionIndex === -1) return false;

    document.versions.splice(versionIndex, 1);
    
    // Update current version if we deleted the current one
    if (document.versions.length > 0) {
      document.currentVersion = Math.max(...document.versions.map(v => v.versionNumber));
      document.lastModified = new Date().toISOString();
    }

    return true;
  }

  getFolders(): DocumentFolder[] {
    return [
      {
        name: 'Applications',
        description: 'Grant application documents and proposals',
        icon: 'FileText',
        accessRoles: ['Researcher', 'Grants Manager', 'Admin']
      },
      {
        name: 'Projects',
        description: 'Active project documents and deliverables',
        icon: 'Folder',
        accessRoles: ['Researcher', 'Grants Manager', 'Admin']
      },
      {
        name: 'Awards',
        description: 'Award letters and funding agreements',
        icon: 'Award',
        accessRoles: ['Researcher', 'Grants Manager', 'Admin']
      },
      {
        name: 'Reports',
        description: 'Progress reports and final submissions',
        icon: 'BarChart3',
        accessRoles: ['Researcher', 'Grants Manager', 'Admin']
      }
    ];
  }

  canAccessFolder(folder: DocumentFolder['name'], userRole: string): boolean {
    const folderInfo = this.getFolders().find(f => f.name === folder);
    return folderInfo?.accessRoles.includes(userRole) || false;
  }

  getDocumentStats(): Record<string, number> {
    const stats: Record<string, number> = {
      total: this.documents.length,
      Applications: 0,
      Projects: 0,
      Awards: 0,
      Reports: 0
    };

    this.documents.forEach(doc => {
      stats[doc.folder] = (stats[doc.folder] || 0) + 1;
    });

    return stats;
  }
}

export const documentsService = new DocumentsService();

// Award Document Management Functions
export interface AwardDocument {
  id: string;
  filename: string;
  file_type: string;
  uploaded_at: string;
  uploaded_by: string;
}

export const awardDocumentService = {
  // Get all award documents for an application
  async getAwardDocuments(applicationId: string): Promise<AwardDocument[]> {
    try {
      const response = await apiClient.get<AwardDocument[]>(`/applications/${applicationId}/award-documents`);
      return response || [];
    } catch (error) {
      console.error('Error fetching award documents:', error);
      throw error;
    }
  },

  // Upload an award document
  async uploadAwardDocument(applicationId: string, file: File): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      await apiClient.post(
        `/applications/${applicationId}/award-documents/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
    } catch (error) {
      console.error('Error uploading award document:', error);
      throw error;
    }
  },

  // Download an award document
  async downloadAwardDocument(applicationId: string, documentId: string, filename: string): Promise<void> {
    try {
      const response = await apiClient.get(`/applications/${applicationId}/award-documents/${documentId}/download`);

      // Create download link
      const byteCharacters = atob(response.file_data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: response.file_type });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading award document:', error);
      throw error;
    }
  },

  // Delete an award document
  async deleteAwardDocument(applicationId: string, documentId: string): Promise<void> {
    try {
      await apiClient.delete(`/applications/${applicationId}/award-documents/${documentId}`);
    } catch (error) {
      console.error('Error deleting award document:', error);
      throw error;
    }
  }
};

// Export the downloadApplicationDocument function for use in components
export const downloadApplicationDocument = (applicationId: string, filename: string): Promise<void> => 
  documentsService.downloadApplicationDocument(applicationId, filename);