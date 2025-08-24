import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  getAllApplications, 
  getUserApplications,
  getApplicationsByUser, 
  getStatusColor,
  updateApplicationStatus,
  withdrawApplication,
  markApplicationEditable,
  markApplicationNeedsRevision,
  canWithdrawApplication,
  canUpdateApplication,
  confirmContractReceipt,
  getApplication,
  addReviewComment,
  type Application 
} from '../services/applicationsService';
import { getAllCalls } from '../services/grantCalls';
import type { GrantCall } from '../services/grantCalls/api/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { Eye, Filter, UserPlus, RotateCcw, Trash2, Edit, Send, CheckCircle, FileText, MessageSquare, Search, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { downloadApplicationDocument } from '../services/documentsService';
import ReviewerAssignmentDialog from '../components/ReviewerAssignmentDialog';
import SignOffInitiationDialog from '../components/SignOffInitiationDialog';
import SignOffStatusCard from '../components/SignOffStatusCard';
import ReviewerFeedbackCard from '../components/ReviewerFeedbackCard';
import ApplicationUpdateDialog from '../components/ApplicationUpdateDialog';
import { submitContract } from '../services/applicationsService';

interface ReviewFormData {
  comments: string;
  decision: 'manager_approved' | 'rejected' | 'under_review' | 'needs_revision';
}

const Applications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [grantCalls, setGrantCalls] = useState<GrantCall[]>([]);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isAssignReviewersOpen, setIsAssignReviewersOpen] = useState(false);
  const [isSignOffInitiationOpen, setIsSignOffInitiationOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  
  const form = useForm<ReviewFormData>({
    defaultValues: {
      comments: '',
      decision: 'under_review'
    }
  });
  
  if (!user) {
    return (
      <div className="max-w-7xl">
        <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
        <p className="text-gray-600 mt-4">Please log in to view applications.</p>
      </div>
    );
  }

  // For researchers, show their applications with search and filter
  if (user.role.toLowerCase() === 'researcher') {
    const [userApplications, setUserApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    // Create a mapping of grant call ID to grant call type for researcher view
    const grantCallTypeMap = useMemo(() => {
      const map = new Map<string, string>();
      grantCalls.forEach(call => {
        map.set(call.id, call.type);
      });
      return map;
    }, [grantCalls]);

    const loadUserApplications = async (showToast = false) => {
      try {
        setLoading(true);
        setError(null);
        console.log('Loading applications for researcher...');
        
        const [applications, calls] = await Promise.all([
          getUserApplications(),
          getAllCalls()
        ]);
        
        setUserApplications(applications);
        setGrantCalls(calls);
        
        if (showToast) {
          toast({
            title: "Applications Refreshed",
            description: `Successfully loaded ${applications.length} applications.`,
          });
        }
        
        console.log(`Loaded ${applications.length} applications and ${calls.length} grant calls for researcher`);
      } catch (error: any) {
        console.error('Error loading researcher applications:', error);
        setError(error.message || 'Failed to load applications');
        setUserApplications([]); // Clear applications on error
        setGrantCalls([]);
        
        toast({
          title: "Failed to Load Applications",
          description: error.message || 'Unable to connect to the server. Please try again.',
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      loadUserApplications();
    }, [user.email]);

    const handleRetryResearcher = () => {
      setRetryCount(prev => prev + 1);
      loadUserApplications(true);
    };

    // Get unique statuses for filter options
    const availableStatuses = useMemo(() => {
      const statuses = [...new Set(userApplications.map(app => app.status))];
      return statuses.sort();
    }, [userApplications]);

    // Filter and search applications
    const filteredApplications = useMemo(() => {
      return userApplications.filter(app => {
        // Search filter
        const matchesSearch = searchQuery === '' || 
          app.proposalTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.status.toLowerCase().includes(searchQuery.toLowerCase());

        // Status filter
        const matchesStatus = statusFilter === 'all' || app.status === statusFilter;

        return matchesSearch && matchesStatus;
      });
    }, [userApplications, searchQuery, statusFilter]);
    
    const handleWithdrawApplication = (applicationId: string) => {
      const success = withdrawApplication(applicationId);
      if (success) {
        toast({
          title: "Application Withdrawn",
          description: "Your application has been successfully withdrawn.",
        });
        // Force component re-render by getting fresh data
      } else {
        toast({
          title: "Cannot Withdraw",
          description: "Application cannot be withdrawn at this time.",
          variant: "destructive"
        });
      }
    };



    const handleContractUpload = (applicationId: string) => {
      const success = submitContract(applicationId, 'contract.pdf');
      if (success) {
        toast({
          title: "Contract Submitted",
          description: "Your contract has been successfully submitted.",
        });
      } else {
        toast({
          title: "Submission Failed",
          description: "Failed to submit contract. Please try again.",
          variant: "destructive"
        });
      }
    };

    const openFeedbackDialog = async (application: Application) => {
      try {
        // Fetch full application details to ensure reviewer feedback and latest data are present
        const fullApp = await getApplication(application.id);
        setSelectedApplication(fullApp);
        setIsFeedbackDialogOpen(true);
      } catch (error: any) {
        // Do NOT fallback to mock data - only show live backend data
        console.error('Failed to fetch latest application details for feedback:', error);
        toast({
          title: "Unable to Load Application",
          description: error.message || 'Cannot load application details from server. Please try again.',
          variant: "destructive"
        });
        // Do not open the dialog if we can't get live data
      }
    };

    const openUpdateDialog = async (application: Application) => {
      try {
        // Fetch full application details to ensure reviewer feedback and latest data are present
        const fullApp = await getApplication(application.id);
        setSelectedApplication(fullApp);
        setIsUpdateDialogOpen(true);
      } catch (error: any) {
        // Do NOT fallback to mock data - only show live backend data
        console.error('Failed to fetch latest application details:', error);
        toast({
          title: "Unable to Load Application",
          description: error.message || 'Cannot load application details from server. Please try again.',
          variant: "destructive"
        });
        // Do not open the dialog if we can't get live data
      }
    };

    const clearFilters = () => {
      setSearchQuery('');
      setStatusFilter('all');
    };

    // Loading state
    if (loading) {
      return (
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your applications...</p>
          </div>
        </div>
      );
    }

    // Error state with retry functionality
    if (error && !loading) {
      return (
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Your Applications</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
            <div className="space-x-4">
              <Button onClick={handleRetryResearcher} className="bg-blue-600 hover:bg-blue-700">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retry
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            </div>
            {retryCount > 0 && (
              <p className="text-sm text-gray-500 mt-4">
                Retry attempts: {retryCount}
              </p>
            )}
          </div>
        </div>
      );
    }
    
    return (
      <div className="max-w-7xl space-y-6">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
            <p className="text-gray-600 mt-2">Track the status of your grant applications</p>
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={() => loadUserApplications(true)} 
              variant="outline"
              disabled={loading}
              className="flex items-center"
            >
              <svg className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {userApplications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">You haven't submitted any applications yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Search and Filter Section */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Search Input */}
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by proposal title, applicant name, email, or status..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="flex gap-3">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-48">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {availableStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.replace('_', ' ').toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {(searchQuery || statusFilter !== 'all') && (
                      <Button variant="outline" onClick={clearFilters}>
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </div>

                {/* Results Summary */}
                <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                  <span>
                    Showing {filteredApplications.length} of {userApplications.length} applications
                  </span>
                  {(searchQuery || statusFilter !== 'all') && (
                    <span className="text-blue-600">
                      Filters active
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Grant Applications</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredApplications.length === 0 ? (
                  <div className="text-center py-8">
                    {userApplications.length === 0 ? (
                      <p className="text-gray-500">You haven't submitted any applications yet.</p>
                    ) : (
                      <div>
                        <p className="text-gray-500 mb-2">No applications match your search criteria.</p>
                        <Button variant="outline" onClick={clearFilters}>
                          Clear Filters
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Proposal Title</TableHead>
                        <TableHead>Grant Type</TableHead>
                        <TableHead>Submission Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Revisions</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.map((application) => {
                      const history = application.reviewHistory || [];
                      
                      return (
                        <TableRow key={application.id}>
                          <TableCell className="font-medium">
                            {application.proposalTitle}
                          </TableCell>
                          <TableCell>
                            {grantCallTypeMap.get(application.grantId) || 'Unknown'}
                          </TableCell>
                          <TableCell>
                            {format(new Date(application.submissionDate), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                              {application.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">
                              {application.revisionCount && application.revisionCount > 0 ? `${application.revisionCount} revision(s)` : 'Original'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2 flex-wrap">
                              {canWithdrawApplication(application) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleWithdrawApplication(application.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Withdraw
                                </Button>
                              )}

                              {canUpdateApplication(application) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openUpdateDialog(application)}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Update
                                </Button>
                              )}
                              {history.length > 0 && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openFeedbackDialog(application)}
                                >
                                  <MessageSquare className="h-4 w-4 mr-1" />
                                  View Feedback
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Sign-off Status Cards */}
            {filteredApplications
              .filter(app => app.status === 'awaiting_signoff' || app.status === 'signoff_approved' || app.status === 'contract_pending' || app.status === 'contract_received')
              .map(application => (
                <SignOffStatusCard 
                  key={application.id} 
                  application={application}
                  onContractUpload={handleContractUpload}
                />
              ))
            }
          </div>
        )}

        {/* Feedback Dialog for Researchers */}
        <Dialog open={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Application Details & Feedback</DialogTitle>
            </DialogHeader>
            
            {selectedApplication && (
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">{selectedApplication.proposalTitle}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Status:</span> {selectedApplication.status.replace('_', ' ').toUpperCase()}
                    </div>
                    <div>
                      <span className="font-medium">Revisions:</span> {selectedApplication.revisionCount || 0}
                    </div>
                  </div>
                </div>

                <ReviewerFeedbackCard 
                  feedback={selectedApplication.reviewHistory || []}
                  canUpdate={canUpdateApplication(selectedApplication)}
                  onUpdateApplication={() => {
                    setIsFeedbackDialogOpen(false);
                    openUpdateDialog(selectedApplication);
                  }}
                />
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Application Update Dialog */}
        {selectedApplication && (
          <ApplicationUpdateDialog
            application={selectedApplication}
            isOpen={isUpdateDialogOpen}
            onClose={() => setIsUpdateDialogOpen(false)}
            onSuccess={() => { loadUserApplications(true); }}
          />
        )}
      </div>
    );
  }

  // For grants manager, show review interface
  if (user.role.toLowerCase() === 'grants manager') {
    const [allApplications, setAllApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    const loadApplications = async (showToast = false) => {
      try {
        setLoading(true);
        setError(null);
        console.log('Loading applications for grants manager...');
        
        const [applications, calls] = await Promise.all([
          getAllApplications(),
          getAllCalls()
        ]);
        
        setAllApplications(applications);
        setGrantCalls(calls);
        
        if (showToast) {
          toast({
            title: "Applications Refreshed",
            description: `Successfully loaded ${applications.length} applications.`,
          });
        }
        
        console.log(`Loaded ${applications.length} applications and ${calls.length} grant calls successfully`);
      } catch (error: any) {
        console.error('Error loading applications:', error);
        setError(error.message || 'Failed to load applications');
        setAllApplications([]); // Clear applications on error
        setGrantCalls([]);
        
        toast({
          title: "Failed to Load Applications",
          description: error.message || 'Unable to connect to the server. Please try again.',
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      loadApplications();
    }, []);

    const handleRetry = () => {
      setRetryCount(prev => prev + 1);
      loadApplications(true);
    };
    
    // Create a mapping of grant call ID to grant call type
    const grantCallTypeMap = useMemo(() => {
      const map = new Map<string, string>();
      grantCalls.forEach(call => {
        map.set(call.id, call.type);
      });
      return map;
    }, [grantCalls]);

    // Filter applications
    const filteredApplications = allApplications.filter(app => {
      if (statusFilter !== 'all' && app.status !== statusFilter) return false;
      if (typeFilter !== 'all') {
        const grantType = grantCallTypeMap.get(app.grantId);
        if (grantType !== typeFilter) return false;
      }
      return true;
    });

    // Calculate status counts
    const statusCounts = {
      submitted: allApplications.filter(app => app.status === 'submitted').length,
      under_review: allApplications.filter(app => app.status === 'under_review').length,
      manager_approved: allApplications.filter(app => app.status === 'manager_approved').length,
      signoff_approved: allApplications.filter(app => app.status === 'signoff_approved').length,
      rejected: allApplications.filter(app => app.status === 'rejected').length,
      withdrawn: allApplications.filter(app => app.status === 'withdrawn').length,
      editable: allApplications.filter(app => app.status === 'editable').length,
      needs_revision: allApplications.filter(app => app.status === 'needs_revision').length,
      total: allApplications.length
    };

    const handleAddReview = async () => {
      if (!selectedApplication) return;
      
      const comments = form.getValues('comments');
      if (!comments.trim()) {
        toast({
          title: "Comments Required",
          description: "Please enter review comments before adding a review.",
          variant: "destructive"
        });
        return;
      }
      
      try {
        await addReviewComment(selectedApplication.id, {
          reviewerEmail: user.email,
          reviewerName: user.name || 'Grants Manager',
          comments: comments,
          status: selectedApplication.status // Keep current status
        });
        
        toast({
          title: "Review Added",
          description: "Your review comment has been added successfully.",
        });
        
        // Clear the comments field
        form.setValue('comments', '');
        
        // Refresh selectedApplication with latest data
        const updatedApp = await getApplication(selectedApplication.id);
        setSelectedApplication(updatedApp);
        
        // Refresh applications data
        loadApplications();
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to add review comment.",
          variant: "destructive"
        });
      }
    };

    const handleStatusChange = async (data: ReviewFormData) => {
      if (!selectedApplication) return;
      
      try {
        await updateApplicationStatus(selectedApplication.id, data.decision);
        
        toast({
          title: "Status Updated",
          description: `Application status changed to ${data.decision.replace('_', ' ')}.`
        });
        setIsReviewDialogOpen(false);
        setSelectedApplication(null);
        form.reset();
        
        // Refresh applications data
        loadApplications();
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to update application status.",
          variant: "destructive"
        });
      }
    };

    const handleMarkEditable = (applicationId: string) => {
      const success = markApplicationEditable(applicationId);
      if (success) {
        toast({
          title: "Application Marked Editable",
          description: "The researcher can now resubmit this application.",
        });
        // Force component re-render by getting fresh data
      }
    };

    const handleConfirmContractReceipt = (applicationId: string) => {
      const success = confirmContractReceipt(applicationId);
      if (success) {
        toast({
          title: "Contract Receipt Confirmed",
          description: "Contract receipt has been confirmed.",
        });
        // Force component re-render by getting fresh data
      }
    };

    const openReviewDialog = async (application: Application) => {
      try {
        // Fetch fresh application data to ensure latest review history
        const fullApp = await getApplication(application.id);
        setSelectedApplication(fullApp);
        form.setValue('comments', '');
        setIsReviewDialogOpen(true);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || 'Failed to load application details',
          variant: "destructive"
        });
      }
    };

    const openAssignReviewers = (application: Application) => {
      setSelectedApplication(application);
      setIsAssignReviewersOpen(true);
    };

    const openSignOffInitiation = (application: Application) => {
      setSelectedApplication(application);
      setIsSignOffInitiationOpen(true);
    };

    const handleDownloadDocument = async (application: Application) => {
      if (!application.proposalFileName) {
        toast({
          title: "No Document",
          description: "No document has been uploaded for this application.",
          variant: "destructive"
        });
        return;
      }

      try {
        await downloadApplicationDocument(application.id, application.proposalFileName);
        toast({
          title: "Download Started",
          description: "The document download has started.",
        });
      } catch (error: any) {
        toast({
          title: "Download Failed",
          description: error.message || "Failed to download the document.",
          variant: "destructive"
        });
      }
    };

    if (loading) {
      return (
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading applications...</p>
          </div>
        </div>
      );
    }

    // Error state with retry functionality
    if (error && !loading) {
      return (
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Applications</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
            <div className="space-x-4">
              <Button onClick={handleRetry} className="bg-blue-600 hover:bg-blue-700">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retry
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            </div>
            {retryCount > 0 && (
              <p className="text-sm text-gray-500 mt-4">
                Retry attempts: {retryCount}
              </p>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-7xl space-y-6">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Application Review</h1>
            <p className="text-gray-600 mt-2">Review and manage grant applications</p>
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={() => loadApplications(true)} 
              variant="outline"
              disabled={loading}
              className="flex items-center"
            >
              <svg className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{statusCounts.total}</div>
              <p className="text-sm text-gray-600">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{statusCounts.submitted}</div>
              <p className="text-sm text-gray-600">Submitted</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{statusCounts.under_review}</div>
              <p className="text-sm text-gray-600">Under Review</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{statusCounts.manager_approved}</div>
              <p className="text-sm text-gray-600">Manager Approved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-emerald-600">{statusCounts.signoff_approved}</div>
              <p className="text-sm text-gray-600">Sign-off Approved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{statusCounts.rejected}</div>
              <p className="text-sm text-gray-600">Rejected</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{statusCounts.editable}</div>
              <p className="text-sm text-gray-600">Editable</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-indigo-600">{statusCounts.needs_revision}</div>
              <p className="text-sm text-gray-600">Needs Revision</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Filter className="h-5 w-5 text-gray-500" />
              <div className="flex gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="manager_approved">Manager Approved</SelectItem>
                      <SelectItem value="signoff_approved">Sign-off Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="withdrawn">Withdrawn</SelectItem>
                      <SelectItem value="editable">Editable</SelectItem>
                      <SelectItem value="needs_revision">Needs Revision</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Grant Type</label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="ORI">ORI</SelectItem>
                      <SelectItem value="External">External</SelectItem>
                      <SelectItem value="Scholarship">Scholarship</SelectItem>
                      <SelectItem value="Travel/Conference">Travel/Conference</SelectItem>
                      <SelectItem value="GOVT">GOVT</SelectItem>
                      <SelectItem value="Fellowship">Fellowship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle>Applications ({filteredApplications.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proposal Title</TableHead>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>First-time</TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead>Grant Type</TableHead>
                  <TableHead>Submission Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Revisions</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((application) => {
                  return (
                    <TableRow key={application.id}>
                      <TableCell className="font-medium">
                        {application.proposalTitle}
                      </TableCell>
                      <TableCell>{application.applicantName}</TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {application.biodata?.age ? `${application.biodata.age} yrs` : 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {application.biodata ? (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            application.biodata.firstTimeApplicant 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {application.biodata.firstTimeApplicant ? 'Yes' : 'No'}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          application.proposalFileName 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {application.proposalFileName ? 'Yes' : 'No'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {grantCallTypeMap.get(application.grantId) || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        {format(new Date(application.submissionDate), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                          {application.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {application.revisionCount && application.revisionCount > 0 ? `${application.revisionCount} revision(s)` : 'Original'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openReviewDialog(application)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                          {application.proposalFileName && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadDocument(application)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              View Doc
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openAssignReviewers(application)}
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Assign
                          </Button>
                          {application.status === 'manager_approved' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openSignOffInitiation(application)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Initiate Sign-off
                            </Button>
                          )}
                          {application.status === 'rejected' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkEditable(application.id)}
                              className="text-orange-600 hover:text-orange-700"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Mark Editable
                            </Button>
                          )}
                          {application.status === 'contract_pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleConfirmContractReceipt(application.id)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Confirm Receipt
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Review Dialog */}
        <Dialog open={isReviewDialogOpen && user.role.toLowerCase() === 'grants manager'} onOpenChange={setIsReviewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Application</DialogTitle>
            </DialogHeader>
            
            {selectedApplication && (
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">{selectedApplication.proposalTitle}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Applicant:</span> {selectedApplication.applicantName}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {selectedApplication.email}
                    </div>
                    {selectedApplication.biodata && (
                      <>
                        <div>
                          <span className="font-medium">Age:</span> {selectedApplication.biodata.age} years old
                        </div>
                        <div>
                          <span className="font-medium">First-time Applicant:</span>{' '}
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            selectedApplication.biodata.firstTimeApplicant 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {selectedApplication.biodata.firstTimeApplicant ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </>
                    )}
                    <div>
                      <span className="font-medium">Document Uploaded:</span>{' '}
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        selectedApplication.proposalFileName 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedApplication.proposalFileName ? 'Yes' : 'No'}
                      </span>
                    </div>
                    {selectedApplication.proposalFileName && (
                      <div className="space-y-2">
                        <div>
                          <span className="font-medium">File Name:</span> {selectedApplication.proposalFileName}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadDocument(selectedApplication)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          View Document
                        </Button>
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Submission Date:</span>{' '}
                      {format(new Date(selectedApplication.submissionDate), 'MMM dd, yyyy')}
                    </div>
                    <div>
                      <span className="font-medium">Current Status:</span>{' '}
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedApplication.status)}`}>
                        {selectedApplication.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Review History Section */}
                {selectedApplication.reviewHistory && selectedApplication.reviewHistory.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Review History</h4>
                    {selectedApplication.reviewHistory.map((review) => (
                      <div key={review.id} className="border rounded-lg p-3 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">{review.reviewerName}</p>
                            <p className="text-xs text-gray-500">{review.reviewerEmail}</p>
                          </div>
                          <p className="text-xs text-gray-400">
                            {format(new Date(review.submittedAt), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap text-sm">{review.comments}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Review Form */}
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleStatusChange)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="comments"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Review Comments</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter your review comments..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="decision"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Decision</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select decision" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="under_review">Under Review</SelectItem>
                              <SelectItem value="manager_approved">Manager Approve</SelectItem>
                              <SelectItem value="rejected">Reject</SelectItem>
                              <SelectItem value="needs_revision">Request Revision</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-between pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddReview}
                        className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                      >
                        Add Review
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsReviewDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">
                          Update Status
                        </Button>
                      </div>
                    </div>
                  </form>
                </Form>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Sign-off Initiation Dialog */}
        {selectedApplication && (
          <SignOffInitiationDialog
            application={selectedApplication}
            isOpen={isSignOffInitiationOpen}
            onClose={() => {
              setIsSignOffInitiationOpen(false);
              setSelectedApplication(null);
            }}
          />
        )}

        {/* Reviewer Assignment Dialog */}
        {selectedApplication && (
          <ReviewerAssignmentDialog
            application={selectedApplication}
            isOpen={isAssignReviewersOpen}
            onClose={() => {
              setIsAssignReviewersOpen(false);
              setSelectedApplication(null);
            }}
          />
        )}
      </div>
    );
  }

  // For admin or other roles
  return (
    <div className="max-w-7xl">
      <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
      <p className="text-gray-600 mt-2">Application management features will be available here.</p>
    </div>
  );
};

export default Applications;
