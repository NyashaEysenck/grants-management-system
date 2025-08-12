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
  // Legacy fields for compatibility
  filename?: string;
  originalName?: string;
  size?: number;
  mimeType?: string;
  uploadedAt?: string;
  uploadedBy?: string;
  applicationId?: string;
}

export interface DocumentVersion {
  id: string;
  versionNumber: number;
  fileName: string;
  uploadedBy: string;
  uploadedAt: string;
  fileSize: string;
  notes?: string;
  // Legacy fields for compatibility
  filename?: string;
  originalName?: string;
  size?: number;
  mimeType?: string;
  version?: number;
  isAnnotated?: boolean;
}

export interface DocumentUploadResponse {
  success: boolean;
  filename?: string;
  error?: string;
}
