import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  FileText, 
  Download, 
  Trash2, 
  CheckCircle,
  AlertCircle 
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { format } from 'date-fns';

interface AwardDocument {
  id: string;
  filename: string;
  file_type: string;
  uploaded_at: string;
  uploaded_by: string;
}

interface AwardDocumentUploadProps {
  applicationId: string;
  userRole: string;
  onDocumentUploaded?: () => void;
}

const AwardDocumentUpload = ({ applicationId, userRole, onDocumentUploaded }: AwardDocumentUploadProps) => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<AwardDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const canUpload = userRole.toLowerCase() === 'grants manager';

  // Load existing award documents
  const loadDocuments = useCallback(async () => {
    try {
      const response = await apiClient.get(`/applications/${applicationId}/award-documents`);
      setDocuments(response);
    } catch (error) {
      console.error('Failed to load award documents:', error);
    } finally {
      setIsLoading(false);
    }
  }, [applicationId]);

  React.useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const uploadDocument = useCallback(async (file: File) => {
    if (!canUpload) return;

    setIsUploading(true);
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

      toast({
        title: "Award Document Uploaded",
        description: "Award document has been uploaded successfully.",
      });

      // Reload documents and notify parent
      await loadDocuments();
      onDocumentUploaded?.();
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.response?.data?.detail || "Failed to upload award document.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  }, [applicationId, canUpload, toast, loadDocuments, onDocumentUploaded]);

  const downloadDocument = async (documentId: string, filename: string) => {
    try {
      const response = await apiClient.get(
        `/applications/${applicationId}/award-documents/${documentId}/download`
      );

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
    } catch (error: any) {
      toast({
        title: "Download Failed",
        description: "Failed to download award document.",
        variant: "destructive"
      });
    }
  };

  const deleteDocument = async (documentId: string) => {
    if (!canUpload) return;

    try {
      await apiClient.delete(`/applications/${applicationId}/award-documents/${documentId}`);
      
      toast({
        title: "Document Deleted",
        description: "Award document has been removed.",
      });

      await loadDocuments();
      onDocumentUploaded?.();
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete award document.",
        variant: "destructive"
      });
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      uploadDocument(acceptedFiles[0]);
    }
  }, [uploadDocument]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    disabled: !canUpload || isUploading
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center text-muted-foreground">Loading award documents...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Award Documents
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        {canUpload && (
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
              ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary hover:bg-primary/5'}
            `}
          >
            <input {...getInputProps()} />
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            {isUploading ? (
              <p className="text-sm text-muted-foreground">Uploading...</p>
            ) : isDragActive ? (
              <p className="text-sm text-muted-foreground">Drop the award document here</p>
            ) : (
              <div>
                <p className="text-sm font-medium mb-1">Upload Award Document</p>
                <p className="text-xs text-muted-foreground">
                  Drag and drop or click to select (PDF, DOC, DOCX)
                </p>
              </div>
            )}
          </div>
        )}

        {/* Documents List */}
        {documents.length > 0 ? (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Uploaded Documents</h4>
            {documents.map((document) => (
              <div key={document.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{document.filename}</p>
                    <p className="text-xs text-muted-foreground">
                      Uploaded {format(new Date(document.uploaded_at), 'MMM dd, yyyy HH:mm')} by {document.uploaded_by}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Available
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadDocument(document.id, document.filename)}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                  {canUpload && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteDocument(document.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">No award documents uploaded yet</p>
            {!canUpload && (
              <p className="text-xs mt-1">Award documents will appear here once uploaded by grants manager</p>
            )}
          </div>
        )}

        {/* Info Message */}
        {!canUpload && documents.length === 0 && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Award Document Pending</p>
                <p>Your application has been approved. The grants manager will upload your award document shortly.</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AwardDocumentUpload;