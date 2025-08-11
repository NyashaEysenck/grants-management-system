export interface Document {
  id: string;
  name: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  folder: 'Applications' | 'Projects' | 'Awards' | 'Reports';
  currentVersion: number;
  versions: DocumentVersion[];
  createdBy: string;
  createdAt: string;
  lastModified: string;
  uploadedAt: string;
  uploadedBy: string;
  applicationId?: string;
  tags?: string[];
}

export interface DocumentVersion {
  id: string;
  versionNumber: number;
  filename: string;
  fileName: string;
  originalName: string;
  size: number;
  fileSize: string;
  mimeType: string;
  uploadedAt: string;
  uploadedBy: string;
  version: number;
  isAnnotated?: boolean;
  notes?: string;
}

export interface DocumentUploadResponse {
  success: boolean;
  filename?: string;
  error?: string;
}
