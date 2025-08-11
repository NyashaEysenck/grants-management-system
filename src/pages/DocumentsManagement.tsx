import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { documentsService } from '../services/documentsService';
import { useAuth } from '../context/AuthContext';
import DocumentViewer from '../components/DocumentViewer';
import { Search, FileText, Calendar, User, Eye, Filter } from 'lucide-react';
import type { Document, DocumentFolder } from '../services/documentsService';

const DocumentsManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const documentFolders: DocumentFolder[] = [
    { 
      name: 'Applications', 
      description: 'Grant application documents',
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
      name: 'Reports', 
      description: 'Progress reports and final submissions',
      icon: 'BarChart3',
      accessRoles: ['Researcher', 'Grants Manager', 'Admin']
    },
    { 
      name: 'Awards', 
      description: 'Award letters and funding agreements',
      icon: 'Award',
      accessRoles: ['Researcher', 'Grants Manager', 'Admin']
    }
  ];

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchQuery, selectedFolder]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await documentsService.getAllDocuments();
      setDocuments(Array.isArray(docs) ? docs : []);
    } catch (error) {
      console.error('Error loading documents:', error);
      setDocuments([]);
      toast({
        title: "Error",
        description: "Failed to load documents. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = () => {
    // Ensure documents is always an array
    if (!Array.isArray(documents)) {
      setFilteredDocuments([]);
      return;
    }

    let filtered = documents;

    // Filter by folder
    if (selectedFolder !== 'all') {
      filtered = filtered.filter(doc => doc.folder === selectedFolder);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.name?.toLowerCase().includes(query) ||
        doc.createdBy?.toLowerCase().includes(query) ||
        (doc.versions && Array.isArray(doc.versions) && doc.versions.some(version => 
          version.fileName?.toLowerCase().includes(query)
        )) ||
        (doc.tags && Array.isArray(doc.tags) && doc.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    setFilteredDocuments(filtered);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      filterDocuments();
      return;
    }

    try {
      setLoading(true);
      const searchResults = await documentsService.searchDocuments(searchQuery);
      setDocuments(searchResults);
    } catch (error) {
      toast({
        title: "Search Failed",
        description: "Failed to search documents. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document);
    setIsViewerOpen(true);
  };

  const handleVersionUploaded = () => {
    setIsViewerOpen(false);
    loadDocuments(); // Refresh the documents list
    toast({
      title: "Success",
      description: "Document updated successfully.",
    });
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatFileSize = (sizeStr: string): string => {
    if (sizeStr.includes('KB') || sizeStr.includes('MB') || sizeStr.includes('GB')) {
      return sizeStr;
    }
    
    const bytes = parseInt(sizeStr);
    if (isNaN(bytes)) return sizeStr;
    
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  if (loading && documents.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Documents Management</h1>
          <p className="text-gray-600 mt-1">View and manage grant application documents</p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search documents by name, author, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Folders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Folders</SelectItem>
                  {documentFolders.map((folder) => (
                    <SelectItem key={folder.name} value={folder.name}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleSearch} variant="outline">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Found</h3>
              <p className="text-gray-600">
                {searchQuery || selectedFolder !== 'all' 
                  ? 'Try adjusting your search criteria or filters.'
                  : 'No documents have been uploaded yet.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredDocuments.map((document) => {
            const latestVersion = document.versions[document.versions.length - 1];
            return (
              <Card key={document.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-blue-600 mt-1" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{document.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
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
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Current Version:</span> v{document.currentVersion} - {latestVersion.fileName} ({formatFileSize(latestVersion.fileSize)})
                          </div>
                          {document.tags && document.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {document.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Dialog open={isViewerOpen && selectedDocument?.id === document.id} onOpenChange={(open) => {
                        setIsViewerOpen(open);
                        if (!open) setSelectedDocument(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewDocument(document)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Document Details</DialogTitle>
                          </DialogHeader>
                          {selectedDocument && (
                            <DocumentViewer 
                              document={selectedDocument} 
                              onVersionUploaded={handleVersionUploaded}
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Summary Stats */}
      {filteredDocuments.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Showing {filteredDocuments.length} of {documents.length} documents
              </span>
              <span>
                Total versions: {filteredDocuments.reduce((sum, doc) => sum + doc.versions.length, 0)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DocumentsManagement;
