import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { documentsService } from '../services/documentsService';
import { useAuth } from '../context/AuthContext';
import { Download, Upload, FileText, Calendar, User } from 'lucide-react';
import type { Document, DocumentVersion } from '../types/documents';

interface DocumentViewerProps {
  document: Document;
  onVersionUploaded?: () => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ document, onVersionUploaded }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadNotes, setUploadNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const canUploadVersion = user?.role === 'Reviewer' || user?.role === 'Admin';
  const latestVersion = document.versions[document.versions.length - 1];

  const handleDownload = async () => {
    try {
      await documentsService.downloadDocument(document.id);
      toast({
        title: "Download Started",
        description: "The document download has started.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to download document.",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUploadVersion = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      await documentsService.uploadNewVersion(
        document.id,
        selectedFile,
        uploadNotes || undefined
      );
      
      toast({
        title: "Version Uploaded",
        description: "New document version has been uploaded successfully.",
      });
      
      setSelectedFile(null);
      setUploadNotes('');
      onVersionUploaded?.();
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload new version.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (sizeStr: string): string => {
    // If it's already formatted, return as is
    if (sizeStr.includes('KB') || sizeStr.includes('MB') || sizeStr.includes('GB')) {
      return sizeStr;
    }
    
    // Otherwise assume it's bytes and format
    const bytes = parseInt(sizeStr);
    if (isNaN(bytes)) return sizeStr;
    
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Document Info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {document.name}
              </CardTitle>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <Badge variant="outline">{document.folder}</Badge>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(document.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {document.createdBy}
                </span>
              </div>
            </div>
            <Button onClick={handleDownload} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download Latest
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Current Version (v{document.currentVersion})</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">File:</span> {latestVersion.fileName}
                  </div>
                  <div>
                    <span className="font-medium">Size:</span> {formatFileSize(latestVersion.fileSize)}
                  </div>
                  <div>
                    <span className="font-medium">Uploaded:</span> {formatDate(latestVersion.uploadedAt)}
                  </div>
                </div>
                {latestVersion.notes && (
                  <div className="mt-3 pt-3 border-t">
                    <span className="font-medium">Notes:</span> {latestVersion.notes}
                  </div>
                )}
              </div>
            </div>

            {document.tags && document.tags.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {document.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Version History */}
      {document.versions.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Version History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {document.versions.slice().reverse().map((version) => (
                <div key={version.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Badge variant={version.versionNumber === document.currentVersion ? "default" : "outline"}>
                        v{version.versionNumber}
                      </Badge>
                      <span className="font-medium">{version.fileName}</span>
                      <span className="text-sm text-gray-500">{formatFileSize(version.fileSize)}</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Uploaded by {version.uploadedBy} on {formatDate(version.uploadedAt)}
                    </div>
                    {version.notes && (
                      <div className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Notes:</span> {version.notes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload New Version (for Reviewers) */}
      {canUploadVersion && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload New Version
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="newVersionFile">Select File</Label>
              <Input
                id="newVersionFile"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {selectedFile && (
                <p className="text-sm text-gray-600 mt-1">Selected: {selectedFile.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="uploadNotes">Notes (Optional)</Label>
              <Input
                id="uploadNotes"
                placeholder="Add notes about this version..."
                value={uploadNotes}
                onChange={(e) => setUploadNotes(e.target.value)}
              />
            </div>

            <Button 
              onClick={handleUploadVersion} 
              disabled={!selectedFile || isUploading}
              className="w-full"
            >
              {isUploading ? 'Uploading...' : 'Upload New Version'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DocumentViewer;
