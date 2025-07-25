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

class DocumentsService {
  private documents: Document[] = [];
  private readonly STORAGE_KEY = 'documents';

  constructor() {
    this.loadDocuments();
  }

  private loadDocuments(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      this.documents = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load documents:', error);
      this.documents = [];
    }
  }

  private saveDocuments(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.documents));
    } catch (error) {
      console.error('Failed to save documents:', error);
    }
  }

  getAllDocuments(): Document[] {
    return [...this.documents];
  }

  getDocumentsByUser(email: string): Document[] {
    return this.documents.filter(doc => 
      doc.versions.some(version => version.uploadedBy === email)
    );
  }

  getDocumentsByFolder(folder: DocumentFolder['name']): Document[] {
    return this.documents.filter(doc => doc.folder === folder);
  }

  getDocumentById(id: string): Document | undefined {
    return this.documents.find(doc => doc.id === id);
  }

  searchDocuments(query: string, userEmail?: string, isRestrictedUser = false): Document[] {
    let docs = isRestrictedUser ? this.getDocumentsByUser(userEmail!) : this.documents;
    
    if (!query.trim()) return docs;
    
    const searchTerm = query.toLowerCase();
    return docs.filter(doc => 
      doc.name.toLowerCase().includes(searchTerm) ||
      doc.versions.some(version => 
        version.fileName.toLowerCase().includes(searchTerm)
      ) ||
      doc.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  uploadDocument(
    name: string,
    folder: DocumentFolder['name'],
    fileName: string,
    uploadedBy: string,
    fileSize: string,
    notes?: string
  ): Document {
    const now = new Date().toISOString();
    const documentId = `doc-${Date.now()}`;
    
    const firstVersion: DocumentVersion = {
      id: `${documentId}-v1`,
      versionNumber: 1,
      fileName,
      uploadedBy,
      uploadedAt: now,
      fileSize,
      notes
    };

    const newDocument: Document = {
      id: documentId,
      name,
      folder,
      currentVersion: 1,
      versions: [firstVersion],
      createdBy: uploadedBy,
      createdAt: now,
      lastModified: now,
      tags: []
    };

    this.documents.push(newDocument);
    this.saveDocuments();
    return newDocument;
  }

  uploadNewVersion(
    documentId: string,
    fileName: string,
    uploadedBy: string,
    fileSize: string,
    notes?: string
  ): boolean {
    const document = this.documents.find(doc => doc.id === documentId);
    if (!document) return false;

    const now = new Date().toISOString();
    const newVersionNumber = document.currentVersion + 1;
    
    const newVersion: DocumentVersion = {
      id: `${documentId}-v${newVersionNumber}`,
      versionNumber: newVersionNumber,
      fileName,
      uploadedBy,
      uploadedAt: now,
      fileSize,
      notes
    };

    document.versions.push(newVersion);
    document.currentVersion = newVersionNumber;
    document.lastModified = now;

    this.saveDocuments();
    return true;
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