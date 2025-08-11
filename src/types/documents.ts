export interface Document {
  id: string;
  name: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
  uploadedBy: string;
  applicationId?: string;
  folder: string;
  createdAt: string;
  createdBy: string;
  currentVersion: number;
  lastModified: string;
  tags?: string[];
  versions: DocumentVersion[];
}

export interface DocumentVersion {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
  uploadedBy: string;
  version: number;
  versionNumber: number;
  fileName: string;
  fileSize: string;
  notes?: string;
  isAnnotated?: boolean;
}

export interface DocumentUploadResponse {
  success: boolean;
  filename?: string;
  error?: string;
}
