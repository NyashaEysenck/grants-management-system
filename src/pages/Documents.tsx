import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../context/AuthContext';
import { documentsService, Document, DocumentFolder } from '../services/documentsService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Folder, 
  Award, 
  BarChart3, 
  Upload, 
  Download, 
  Trash2, 
  Search, 
  Clock, 
  User, 
  Plus,
  File
} from 'lucide-react';
import { format } from 'date-fns';

interface UploadFormData {
  name: string;
  folder: DocumentFolder['name'];
  notes?: string;
}

interface VersionUploadData {
  notes?: string;
}

const Documents = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<DocumentFolder['name'] | 'all'>('all');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);

  const uploadForm = useForm<UploadFormData>({
    defaultValues: {
      name: '',
      folder: 'Applications',
      notes: ''
    }
  });

  const versionForm = useForm<VersionUploadData>({
    defaultValues: {
      notes: ''
    }
  });

  if (!user) {
    return (
      <div className="max-w-7xl">
        <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
        <p className="text-gray-600 mt-4">Please log in to access documents.</p>
      </div>
    );
  }

  const isRestrictedUser = user.role.toLowerCase() === 'researcher';
  const folders = documentsService.getFolders().filter(folder => 
    documentsService.canAccessFolder(folder.name, user.role)
  );

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      uploadForm.setValue('name', file.name.split('.')[0]);
      // Store file info for upload
      sessionStorage.setItem('pendingFile', JSON.stringify({
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type: file.type
      }));
      setIsUploadDialogOpen(true);
    }
  }, [uploadForm]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'image/*': ['.jpg', '.jpeg', '.png', '.gif']
    }
  });

  const handleUpload = async (data: UploadFormData) => {
    const pendingFile = sessionStorage.getItem('pendingFile');
    if (!pendingFile) {
      toast({
        title: "Error",
        description: "No file selected for upload.",
        variant: "destructive"
      });
      return;
    }

    const fileInfo = JSON.parse(pendingFile);
    
    try {
      await documentsService.uploadDocument(
        data.name,
        data.folder,
        fileInfo,
        data.notes
      );

      toast({
        title: "Success",
        description: "Document uploaded successfully.",
      });

      setIsUploadDialogOpen(false);
      uploadForm.reset();
      sessionStorage.removeItem('pendingFile');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload document.",
        variant: "destructive"
      });
    }
  };

  const handleVersionUpload = async (data: VersionUploadData) => {
    if (!selectedDocument) return;

    const pendingFile = sessionStorage.getItem('pendingFile');
    if (!pendingFile) {
      toast({
        title: "Error",
        description: "No file selected for upload.",
        variant: "destructive"
      });
      return;
    }

    const fileInfo = JSON.parse(pendingFile);
    
    const success = await documentsService.uploadNewVersion(
      selectedDocument.id,
      fileInfo,
      data.notes
    );

    if (success) {
      toast({
        title: "Success",
        description: "New version uploaded successfully.",
      });
      setIsVersionDialogOpen(false);
      setSelectedDocument(null);
      versionForm.reset();
      sessionStorage.removeItem('pendingFile');
    } else {
      toast({
        title: "Error",
        description: "Failed to upload new version.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = (documentId: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      const success = documentsService.deleteDocument(documentId);
      if (success) {
        toast({
          title: "Success",
          description: "Document deleted successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete document.",
          variant: "destructive"
        });
      }
    }
  };

  const handleVersionDelete = (documentId: string, versionId: string) => {
    if (window.confirm('Are you sure you want to delete this version?')) {
      const success = documentsService.deleteVersion(documentId, versionId);
      if (success) {
        toast({
          title: "Success",
          description: "Version deleted successfully.",
        });
        // Refresh selected document
        const updated = documentsService.getDocumentById(documentId);
        setSelectedDocument(updated || null);
      } else {
        toast({
          title: "Error",
          description: "Cannot delete the only remaining version.",
          variant: "destructive"
        });
      }
    }
  };

  const handleDownload = (document: Document, version?: any) => {
    // Simulate download
    const fileName = version ? version.fileName : document.versions[document.versions.length - 1]?.fileName;
    toast({
      title: "Download Started",
      description: `Downloading ${fileName}...`,
    });
  };

  const getFilteredDocuments = async () => {
    let documents = isRestrictedUser 
      ? documentsService.getDocumentsByUser(user.email)
      : await documentsService.getAllDocuments();

    if (selectedFolder !== 'all') {
      documents = documents.filter(doc => doc.folder === selectedFolder);
    }

    if (searchQuery.trim()) {
      documents = await documentsService.searchDocuments(searchQuery, user.email, isRestrictedUser);
    }

    return documents;
  };

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      FileText,
      Folder,
      Award,
      BarChart3
    };
    return icons[iconName] || File;
  };

  const stats = documentsService.getDocumentStats();
  const [filteredDocuments, setFilteredDocuments] = React.useState<Document[]>([]);

  React.useEffect(() => {
    const loadDocuments = async () => {
      const docs = await getFilteredDocuments();
      setFilteredDocuments(docs);
    };
    loadDocuments();
  }, [searchQuery, selectedFolder, isRestrictedUser, user.email]);

  return (
    <div className="max-w-7xl space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Document Center</h1>
          <p className="text-gray-600 mt-2">Manage documents with version control and lifecycle tracking</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <p className="text-sm text-gray-600">Total Documents</p>
          </CardContent>
        </Card>
        {folders.map((folder) => {
          const IconComponent = getIconComponent(folder.icon);
          return (
            <Card key={folder.name}>
              <CardContent className="p-4 text-center">
                <IconComponent className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                <div className="text-xl font-bold text-gray-900">{stats[folder.name] || 0}</div>
                <p className="text-sm text-gray-600">{folder.name}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            {isDragActive ? (
              <p className="text-blue-600">Drop the file here...</p>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">Drag & drop a file here, or click to select</p>
                <p className="text-sm text-gray-400">Supports PDF, DOC, DOCX, TXT, and image files</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedFolder} onValueChange={(value: any) => setSelectedFolder(value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by folder" />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                <SelectItem value="all">All Folders</SelectItem>
                {folders.map((folder) => (
                  <SelectItem key={folder.name} value={folder.name}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Documents ({filteredDocuments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-8">
              <Folder className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No documents found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Folder</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Last Modified</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell className="font-medium">{document.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{document.folder}</Badge>
                    </TableCell>
                    <TableCell>v{document.currentVersion}</TableCell>
                    <TableCell>
                      {format(new Date(document.lastModified), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>{document.createdBy}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(document)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedDocument(document);
                            setIsVersionHistoryOpen(true);
                          }}
                        >
                          <Clock className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedDocument(document);
                            // Create file input for new version
                            const input = window.document.createElement('input');
                            input.type = 'file';
                            input.accept = '.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif';
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) {
                                sessionStorage.setItem('pendingFile', JSON.stringify({
                                  name: file.name,
                                  size: `${(file.size / 1024).toFixed(1)} KB`,
                                  type: file.type
                                }));
                                setIsVersionDialogOpen(true);
                              }
                            };
                            input.click();
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        {(!isRestrictedUser || document.createdBy === user.email) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(document.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <Form {...uploadForm}>
            <form onSubmit={uploadForm.handleSubmit(handleUpload)} className="space-y-4">
              <FormField
                control={uploadForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter document name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={uploadForm.control}
                name="folder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Folder</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select folder" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white z-50">
                        {folders.map((folder) => (
                          <SelectItem key={folder.name} value={folder.name}>
                            {folder.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={uploadForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Add notes about this document" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Upload</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Version Upload Dialog */}
      <Dialog open={isVersionDialogOpen} onOpenChange={setIsVersionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload New Version</DialogTitle>
          </DialogHeader>
          <Form {...versionForm}>
            <form onSubmit={versionForm.handleSubmit(handleVersionUpload)} className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">
                  Uploading new version for: <strong>{selectedDocument?.name}</strong>
                </p>
              </div>

              <FormField
                control={versionForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Version Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe changes in this version" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsVersionDialogOpen(false);
                    setSelectedDocument(null);
                    sessionStorage.removeItem('pendingFile');
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Upload Version</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Version History Dialog */}
      <Dialog open={isVersionHistoryOpen} onOpenChange={setIsVersionHistoryOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Version History - {selectedDocument?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedDocument && (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Version</TableHead>
                    <TableHead>File Name</TableHead>
                    <TableHead>Uploaded By</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedDocument.versions.map((version) => (
                    <TableRow key={version.id}>
                      <TableCell>
                        <Badge variant={version.versionNumber === selectedDocument.currentVersion ? 'default' : 'secondary'}>
                          v{version.versionNumber}
                          {version.versionNumber === selectedDocument.currentVersion && ' (Current)'}
                        </Badge>
                      </TableCell>
                      <TableCell>{version.fileName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          {version.uploadedBy}
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(version.uploadedAt), 'MMM dd, yyyy HH:mm')}
                      </TableCell>
                      <TableCell>{version.fileSize}</TableCell>
                      <TableCell>{version.notes || '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(selectedDocument, version)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          {selectedDocument.versions.length > 1 && (!isRestrictedUser || version.uploadedBy === user.email) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleVersionDelete(selectedDocument.id, version.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Documents;