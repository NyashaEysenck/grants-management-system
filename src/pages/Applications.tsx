import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  getAllApplications, 
  getApplicationsByUser, 
  getStatusColor,
  updateApplicationStatus,
  withdrawApplication,
  markApplicationEditable,
  markApplicationNeedsRevision,
  resubmitApplication,
  canWithdrawApplication,
  canResubmitApplication,
  canUpdateApplication,
  getReviewerFeedback,
  confirmContractReceipt,
  getApplicationRevisionHistory,
  type Application 
} from '../services/applicationsService';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { Eye, Filter, UserPlus, RotateCcw, Trash2, Edit, Send, CheckCircle, FileText, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ReviewerAssignmentDialog from '../components/ReviewerAssignmentDialog';
import SignOffInitiationDialog from '../components/SignOffInitiationDialog';
import SignOffStatusCard from '../components/SignOffStatusCard';
import ReviewerFeedbackCard from '../components/ReviewerFeedbackCard';
import ApplicationUpdateDialog from '../components/ApplicationUpdateDialog';
import { submitContract } from '../services/applicationsService';

interface ReviewFormData {
  comments: string;
  decision: 'approved' | 'rejected' | 'under_review' | 'needs_revision';
}

const Applications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
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

  // For researchers, show their applications
  if (user.role.toLowerCase() === 'researcher') {
    const userApplications = getApplicationsByUser(user.email);
    
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

    const handleResubmitApplication = (applicationId: string) => {
      const success = resubmitApplication(applicationId);
      if (success) {
        toast({
          title: "Application Resubmitted",
          description: "Your application has been successfully resubmitted.",
        });
        // Force component re-render by getting fresh data
      } else {
        toast({
          title: "Cannot Resubmit",
          description: "Application cannot be resubmitted at this time.",
          variant: "destructive"
        });
      }
    };

    const handleContractUpload = (applicationId: string) => {
      const fileName = prompt('Enter contract filename (for demo):');
      if (fileName) {
        const success = submitContract(applicationId, fileName);
        if (success) {
          toast({
            title: "Contract Uploaded",
            description: "Your signed contract has been submitted for review.",
          });
          // Force component re-render by getting fresh data
        }
      }
    };

    const openFeedbackDialog = (application: Application) => {
      setSelectedApplication(application);
      setIsFeedbackDialogOpen(true);
    };

    const openUpdateDialog = (application: Application) => {
      setSelectedApplication(application);
      setIsUpdateDialogOpen(true);
    };
    
    return (
      <div className="max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-600 mt-2">Track the status of your grant applications</p>
        </div>

        {userApplications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">You haven't submitted any applications yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Grant Applications</CardTitle>
              </CardHeader>
              <CardContent>
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
                    {userApplications.map((application) => {
                      const feedback = getReviewerFeedback(application.id);
                      const revisionHistory = getApplicationRevisionHistory(application.id);
                      
                      return (
                        <TableRow key={application.id}>
                          <TableCell className="font-medium">
                            {application.proposalTitle}
                          </TableCell>
                          <TableCell>Research Grant</TableCell>
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
                              {revisionHistory.count > 0 ? `${revisionHistory.count} revision(s)` : 'Original'}
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
                              {canResubmitApplication(application) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleResubmitApplication(application.id)}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <Send className="h-4 w-4 mr-1" />
                                  Resubmit
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
                              {feedback.length > 0 && (
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
              </CardContent>
            </Card>

            {/* Sign-off Status Cards */}
            {userApplications
              .filter(app => app.status === 'awaiting_signoff' || app.status === 'signoff_complete' || app.status === 'contract_pending' || app.status === 'contract_received')
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
                      <span className="font-medium">Revisions:</span> {getApplicationRevisionHistory(selectedApplication.id).count}
                    </div>
                  </div>
                </div>

                <ReviewerFeedbackCard 
                  feedback={getReviewerFeedback(selectedApplication.id)}
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
            onSuccess={() => {/* Force component re-render by getting fresh data */}}
          />
        )}
      </div>
    );
  }

  // For grants manager, show review interface
  if (user.role.toLowerCase() === 'grants manager') {
    const allApplications = getAllApplications();
    
    // Filter applications
    const filteredApplications = allApplications.filter(app => {
      if (statusFilter !== 'all' && app.status !== statusFilter) return false;
      if (typeFilter !== 'all' && typeFilter !== 'research') return false;
      return true;
    });

    // Calculate status counts
    const statusCounts = {
      submitted: allApplications.filter(app => app.status === 'submitted').length,
      under_review: allApplications.filter(app => app.status === 'under_review').length,
      approved: allApplications.filter(app => app.status === 'approved').length,
      rejected: allApplications.filter(app => app.status === 'rejected').length,
      withdrawn: allApplications.filter(app => app.status === 'withdrawn').length,
      editable: allApplications.filter(app => app.status === 'editable').length,
      needs_revision: allApplications.filter(app => app.status === 'needs_revision').length,
      total: allApplications.length
    };

    const handleReviewSubmit = (data: ReviewFormData) => {
      if (!selectedApplication) return;
      
      let success = false;
      if (data.decision === 'needs_revision') {
        success = markApplicationNeedsRevision(selectedApplication.id, data.comments);
      } else {
        success = updateApplicationStatus(selectedApplication.id, data.decision);
      }
      
      if (success) {
        toast({
          title: "Application Updated",
          description: `Application status changed to ${data.decision.replace('_', ' ')}.`
        });
        setIsReviewDialogOpen(false);
        setSelectedApplication(null);
        form.reset();
        // Force component re-render by getting fresh data
      } else {
        toast({
          title: "Error",
          description: "Failed to update application status.",
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

    const openReviewDialog = (application: Application) => {
      setSelectedApplication(application);
      form.setValue('comments', application.reviewComments || '');
      setIsReviewDialogOpen(true);
    };

    const openAssignReviewers = (application: Application) => {
      setSelectedApplication(application);
      setIsAssignReviewersOpen(true);
    };

    const openSignOffInitiation = (application: Application) => {
      setSelectedApplication(application);
      setIsSignOffInitiationOpen(true);
    };

    return (
      <div className="max-w-7xl space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Application Review</h1>
          <p className="text-gray-600 mt-2">Review and manage grant applications</p>
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
              <div className="text-2xl font-bold text-green-600">{statusCounts.approved}</div>
              <p className="text-sm text-gray-600">Approved</p>
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
                      <SelectItem value="approved">Approved</SelectItem>
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
                      <SelectItem value="research">Research Grant</SelectItem>
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
                  <TableHead>Grant Type</TableHead>
                  <TableHead>Submission Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Revisions</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((application) => {
                  const revisionHistory = getApplicationRevisionHistory(application.id);
                  
                  return (
                    <TableRow key={application.id}>
                      <TableCell className="font-medium">
                        {application.proposalTitle}
                      </TableCell>
                      <TableCell>{application.applicantName}</TableCell>
                      <TableCell>Research Grant</TableCell>
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
                          {revisionHistory.count > 0 ? `${revisionHistory.count} revision(s)` : 'Original'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedApplication(application);
                              form.setValue('comments', application.reviewComments || '');
                              setIsReviewDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openAssignReviewers(application)}
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Assign
                          </Button>
                          {application.status === 'approved' && (
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

                {/* Reviewer Feedback Section */}
                {getReviewerFeedback(selectedApplication.id).length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold">Reviewer Feedback</h4>
                    {getReviewerFeedback(selectedApplication.id).map((feedback) => (
                      <div key={feedback.id} className="border p-4 rounded-lg bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">{feedback.reviewerName}</p>
                            <p className="text-sm text-gray-600">{feedback.reviewerEmail}</p>
                            <p className="text-sm font-medium capitalize text-blue-600">{feedback.decision.replace('_', ' ')}</p>
                          </div>
                          <p className="text-xs text-gray-400">
                            {format(new Date(feedback.submittedAt), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">{feedback.comments}</p>
                        {feedback.annotatedFileName && (
                          <p className="text-sm text-blue-600 mt-2">📎 {feedback.annotatedFileName}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Review Form */}
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleReviewSubmit)} className="space-y-4">
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
                              <SelectItem value="approved">Approve</SelectItem>
                              <SelectItem value="rejected">Reject</SelectItem>
                              <SelectItem value="needs_revision">Request Revision</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsReviewDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">
                        Submit Review
                      </Button>
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
