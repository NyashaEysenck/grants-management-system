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

import { apiClient } from '../lib/api';

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
      return await apiClient.get<Document[]>('/documents');
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
    notes?: string
  ): Promise<{ id: string; message: string; filename: string; size: string }> {
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('folder', folder);
      formData.append('file', file);
      if (notes) {
        formData.append('notes', notes);
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/documents/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      return await response.json();
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

  deleteDocument(documentId: string): boolean {
    const initialLength = this.documents.length;
    this.documents = this.documents.filter(doc => doc.id !== documentId);
    
    if (this.documents.length < initialLength) {
      this.saveDocuments();
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

    this.saveDocuments();
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