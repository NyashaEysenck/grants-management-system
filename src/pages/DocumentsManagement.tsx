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
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const loadDocuments = async (isRetry = false) => {
    try {
      if (isRetry) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      console.log('Loading documents...');
      const docs = await documentsService.getAllDocuments();
      
      if (!Array.isArray(docs)) {
        throw new Error('Invalid response format: expected array of documents');
      }
      
      setDocuments(docs);
      setRetryCount(0); // Reset retry count on success
      
      if (isRetry) {
        toast({
          title: "✅ Documents Refreshed",
          description: `Successfully loaded ${docs.length} documents.`,
        });
      }
      
      console.log(`Successfully loaded ${docs.length} documents`);
      
    } catch (error) {
      console.error('Error loading documents:', error);
      setDocuments([]);
      
      let errorMessage = "Failed to load documents. Please try again.";
      let errorTitle = "Loading Error";
      
      if (error instanceof Error) {
        if (error.message.includes('Network')) {
          errorTitle = "Network Error";
          errorMessage = "Unable to connect to the server. Please check your internet connection and try again.";
        } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
          errorTitle = "Access Denied";
          errorMessage = "You don't have permission to view documents. Please check your login status.";
        } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          errorTitle = "Authentication Error";
          errorMessage = "Your session has expired. Please log in again.";
        } else if (error.message.includes('500')) {
          errorTitle = "Server Error";
          errorMessage = "The server is experiencing issues. Please try again later.";
        } else if (error.message.includes('Invalid response format')) {
          errorTitle = "Data Error";
          errorMessage = "Received invalid data from server. Please contact support if this persists.";
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      setRetryCount(prev => prev + 1);
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
      
    } finally {
      setLoading(false);
      setIsRefreshing(false);
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
      setError(null);
      console.log(`Searching documents for: "${searchQuery}"`);
      
      const searchResults = await documentsService.searchDocuments(searchQuery);
      
      if (!Array.isArray(searchResults)) {
        throw new Error('Invalid search response format');
      }
      
      setDocuments(searchResults);
      
      toast({
        title: "Search Complete",
        description: `Found ${searchResults.length} document${searchResults.length !== 1 ? 's' : ''} matching "${searchQuery}"`,
      });
      
      console.log(`Search completed: ${searchResults.length} results found`);
      
    } catch (error) {
      console.error('Search error:', error);
      
      let errorMessage = "Failed to search documents. Please try again.";
      let errorTitle = "Search Failed";
      
      if (error instanceof Error) {
        if (error.message.includes('Network')) {
          errorTitle = "Network Error";
          errorMessage = "Unable to connect to search service. Please check your connection.";
        } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
          errorTitle = "Search Access Denied";
          errorMessage = "You don't have permission to search documents.";
        } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          errorTitle = "Authentication Error";
          errorMessage = "Your session expired. Please log in again to search.";
        } else if (error.message.includes('Invalid search response')) {
          errorTitle = "Search Error";
          errorMessage = "Search service returned invalid data. Please try again.";
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
      
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    loadDocuments(true);
  };

  const handleRefresh = () => {
    loadDocuments(true);
  };

  const handleViewDocument = (document: Document) => {
    try {
      setSelectedDocument(document);
      setIsViewerOpen(true);
    } catch (error) {
      console.error('Error opening document viewer:', error);
      toast({
        title: "Error",
        description: "Failed to open document viewer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleVersionUploaded = () => {
    setIsViewerOpen(false);
    loadDocuments(true); // Refresh the documents list
    toast({
      title: "✅ Success",
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

  // Show loading state for initial load
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

  // Show error state if there's an error and no documents
  if (error && documents.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Documents</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
            <div className="flex justify-center gap-3">
              <Button onClick={handleRetry} disabled={isRefreshing}>
                {isRefreshing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Retrying...
                  </>
                ) : (
                  'Try Again'
                )}
              </Button>
              {retryCount > 2 && (
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Refresh Page
                </Button>
              )}
            </div>
            {retryCount > 0 && (
              <p className="text-sm text-gray-500 mt-3">
                Retry attempt: {retryCount}
              </p>
            )}
          </div>
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
          <p className="text-gray-600 mt-1">
            View and manage grant application documents
            {documents.length > 0 && (
              <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {documents.length} document{documents.length !== 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {error && (
            <div className="text-sm text-red-600 mr-3">
              ⚠️ Some data may be outdated
            </div>
          )}
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            {isRefreshing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                Refreshing...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </>
            )}
          </Button>
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
              <p className="text-gray-600 mb-4">
                {searchQuery || selectedFolder !== 'all' 
                  ? 'Try adjusting your search criteria or filters.'
                  : 'No documents have been uploaded yet.'
                }
              </p>
              {error && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center gap-2 text-yellow-800">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-sm">Some documents may not be displayed due to loading errors</span>
                  </div>
                </div>
              )}
              {(searchQuery || selectedFolder !== 'all') && (
                <div className="flex justify-center gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedFolder('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                  <Button variant="outline" onClick={handleRefresh}>
                    Refresh Documents
                  </Button>
                </div>
              )}
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
