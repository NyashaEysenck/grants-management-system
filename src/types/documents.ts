export interface Document {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
  uploadedBy: string;
  applicationId?: string;
  versions?: DocumentVersion[];
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
  isAnnotated?: boolean;
}

export interface DocumentUploadResponse {
  success: boolean;
  filename?: string;
  error?: string;
}
