import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  Eye, 
  UserPlus, 
  RotateCcw, 
  Edit, 
  CheckCircle, 
  FileText, 
  MessageSquare, 
  Download,
  Trash2,
  Send 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  getStatusColor,
  updateApplicationStatus,
  withdrawApplication,
  markApplicationEditable,
  canWithdrawApplication,
  canUpdateApplication,
  contractReceiptService,
  addReviewComment,
  type Application 
} from '../services/applicationsService';
import { downloadApplicationDocument } from '../services/documentsService';
import { downloadAwardLetter, generateAwardLetter } from '../services/applications/api/applicationsApi';
import type { GrantCall } from '../services/grantCalls/api/types';
import ReviewerAssignmentDialog from './ReviewerAssignmentDialog';
import SignOffInitiationDialog from './SignOffInitiationDialog';
import SignOffStatusCard from './SignOffStatusCard';
import ReviewerFeedbackCard from './ReviewerFeedbackCard';
import ApplicationUpdateDialog from './ApplicationUpdateDialog';

interface ApplicationDetailViewProps {
  application: Application;
  grantCalls: GrantCall[];
  isManager: boolean;
  userRole: string;
  onBack: () => void;
  onUpdate: () => void;
}

interface ReviewFormData {
  comments: string;
  decision: Application['status'];
}

const ApplicationDetailView: React.FC<ApplicationDetailViewProps> = ({
  application,
  grantCalls,
  isManager,
  userRole,
  onBack,
  onUpdate
}) => {
  const { toast } = useToast();
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isAssignReviewersOpen, setIsAssignReviewersOpen] = useState(false);
  const [isSignOffInitiationOpen, setIsSignOffInitiationOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);

  const form = useForm<ReviewFormData>({
    defaultValues: {
      comments: '',
      decision: 'under_review' as Application['status']
    }
  });

  // Get grant call info
  const grantCall = grantCalls.find(call => call.id === application.grantId);

  const handleWithdrawApplication = async () => {
    try {
      await withdrawApplication(application.id);
      toast({
        title: "Application Withdrawn",
        description: "Your application has been successfully withdrawn.",
      });
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Cannot Withdraw",
        description: error.message || "Application cannot be withdrawn at this time.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadDocument = async () => {
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

  const handleDownloadAwardLetter = async () => {
    try {
      await downloadAwardLetter(application.id);
      toast({
        title: 'Download Started',
        description: 'The award letter download has started.',
      });
    } catch (error: any) {
      toast({
        title: 'Download Failed',
        description: error.message || 'Failed to download the award letter.',
        variant: 'destructive',
      });
    }
  };

  const handleGenerateAwardLetter = async () => {
    try {
      await generateAwardLetter(application.id);
      toast({
        title: 'Award Letter Generated',
        description: 'Award letter has been successfully generated.',
      });
      onUpdate();
    } catch (error: any) {
      toast({
        title: 'Generation Failed',
        description: error.message || 'Failed to generate award letter.',
        variant: 'destructive',
      });
    }
  };

  const handleMarkEditable = async () => {
    try {
      await markApplicationEditable(application.id);
      toast({
        title: "Application Marked Editable",
        description: "The applicant can now edit and resubmit their application.",
      });
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to mark application as editable.",
        variant: "destructive"
      });
    }
  };

  const handleConfirmContractReceipt = async () => {
    try {
      await contractReceiptService.confirmReceipt(application.id);
      toast({
        title: "Contract Receipt Confirmed",
        description: "Contract receipt has been confirmed successfully.",
      });
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Confirmation Failed",
        description: error.message || "Failed to confirm contract receipt.",
        variant: "destructive"
      });
    }
  };

  const handleReviewSubmit = async (data: ReviewFormData) => {
    try {
      await addReviewComment(application.id, {
        comments: data.comments,
        reviewerName: "Grant Manager",
        reviewerEmail: "manager@example.com",
        status: data.decision
      });
      
      await updateApplicationStatus(application.id, data.decision, data.comments);
      
      toast({
        title: "Review Submitted",
        description: "Your review has been submitted successfully.",
      });
      
      setIsReviewDialogOpen(false);
      form.reset();
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Review Failed",
        description: error.message || "Failed to submit review.",
        variant: "destructive"
      });
    }
  };

  const openFeedbackDialog = () => {
    setIsFeedbackDialogOpen(true);
  };

  const openUpdateDialog = () => {
    setIsUpdateDialogOpen(true);
  };

  const openAssignReviewers = () => {
    setIsAssignReviewersOpen(true);
  };

  const openSignOffInitiation = () => {
    setIsSignOffInitiationOpen(true);
  };

  const openReviewDialog = () => {
    setIsReviewDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{application.proposalTitle}</h1>
          <p className="text-gray-600">Application Details</p>
        </div>
      </div>

      {/* Application Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Application Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">Applicant</label>
              <p className="text-sm font-medium">{application.applicantName}</p>
              <p className="text-sm text-gray-600">{application.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Grant Type</label>
              <p className="text-sm">{grantCall?.type || 'Unknown'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Submission Date</label>
              <p className="text-sm">{format(new Date(application.submissionDate), 'MMM dd, yyyy HH:mm')}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="mt-1">
                <Badge className={getStatusColor(application.status)}>
                  {application.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </div>
            {application.revisionCount && application.revisionCount > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-500">Revisions</label>
                <p className="text-sm">{application.revisionCount} revision(s)</p>
              </div>
            )}
            {application.awardAmount && (
              <div>
                <label className="text-sm font-medium text-gray-500">Award Amount</label>
                <p className="text-sm font-medium text-green-600">${application.awardAmount.toLocaleString()}</p>
              </div>
            )}
          </div>

          {/* Biodata (Manager view) */}
          {isManager && application.biodata && (
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-medium mb-3">Researcher Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Age</label>
                  <p className="text-sm">{application.biodata.age} years</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">First-time Applicant</label>
                  <p className="text-sm">
                    <Badge variant={application.biodata.firstTimeApplicant ? 'default' : 'secondary'}>
                      {application.biodata.firstTimeApplicant ? 'Yes' : 'No'}
                    </Badge>
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Available Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {/* Document Download */}
            {application.proposalFileName && (
              <Button
                variant="outline"
                onClick={handleDownloadDocument}
                className="text-blue-600 hover:text-blue-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Document
              </Button>
            )}

            {/* Researcher Actions */}
            {!isManager && (
              <>
                <Button
                  variant="outline"
                  onClick={openFeedbackDialog}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  View Feedback
                </Button>

                {canWithdrawApplication(application) && (
                  <Button
                    variant="outline"
                    onClick={handleWithdrawApplication}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Withdraw
                  </Button>
                )}

                {canUpdateApplication(application) && (
                  <Button
                    variant="outline"
                    onClick={openUpdateDialog}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Update Application
                  </Button>
                )}
              </>
            )}

            {/* Manager Actions */}
            {isManager && (
              <>
                <Button
                  variant="outline"
                  onClick={openReviewDialog}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Review Application
                </Button>

                <Button
                  variant="outline"
                  onClick={openAssignReviewers}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign Reviewers
                </Button>

                {application.status === 'manager_approved' && (
                  <Button
                    variant="outline"
                    onClick={openSignOffInitiation}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Initiate Sign-off
                  </Button>
                )}

                {application.status === 'signoff_approved' && !application.awardLetterGenerated && (
                  <Button
                    variant="outline"
                    onClick={handleGenerateAwardLetter}
                    className="text-purple-600 hover:text-purple-700"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Award Letter
                  </Button>
                )}

                {application.awardLetterGenerated && (
                  <Button
                    variant="outline"
                    onClick={handleDownloadAwardLetter}
                    className="text-green-600 hover:text-green-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Award Letter
                  </Button>
                )}

                {application.status === 'rejected' && (
                  <Button
                    variant="outline"
                    onClick={handleMarkEditable}
                    className="text-orange-600 hover:text-orange-700"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Mark Editable
                  </Button>
                )}

                {application.status === 'contract_pending' && (
                  <Button
                    variant="outline"
                    onClick={handleConfirmContractReceipt}
                    className="text-green-600 hover:text-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm Contract Receipt
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Review History */}
      {application.reviewHistory && application.reviewHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Review History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {application.reviewHistory.map((review, index) => (
                <div key={review.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{review.reviewerName}</p>
                      <p className="text-sm text-gray-600">{review.reviewerEmail}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(review.status as Application['status'])}>
                        {review.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1">
                        {format(new Date(review.submittedAt), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{review.comments}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sign-off Status Card */}
      {(application.status === 'awaiting_signoff' || 
        application.status === 'signoff_approved' || 
        application.status === 'award_pending_acceptance' || 
        application.status === 'award_accepted' || 
        application.status === 'contract_pending' || 
        application.status === 'contract_received') && (
        <SignOffStatusCard 
          application={application}
          userRole={userRole}
          onUpdate={onUpdate}
        />
      )}

      {/* Dialogs */}
      {isReviewDialogOpen && isManager && (
        <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Application</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">{application.proposalTitle}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Applicant:</span> {application.applicantName}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {application.email}
                  </div>
                  <div>
                    <span className="font-medium">Grant Type:</span> {grantCall?.type || 'Unknown'}
                  </div>
                  <div>
                    <span className="font-medium">Submitted:</span> {format(new Date(application.submissionDate), 'MMM dd, yyyy')}
                  </div>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleReviewSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="decision"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Decision</FormLabel>
                        <FormControl>
                          <select {...field} className="w-full p-2 border rounded">
                            <option value="under_review">Under Review</option>
                            <option value="manager_approved">Approve</option>
                            <option value="rejected">Reject</option>
                            <option value="needs_revision">Needs Revision</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="comments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Comments</FormLabel>
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
                  
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      <Send className="h-4 w-4 mr-2" />
                      Submit Review
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Other Dialogs */}
      {isAssignReviewersOpen && (
        <ReviewerAssignmentDialog
          application={application}
          isOpen={isAssignReviewersOpen}
          onClose={() => setIsAssignReviewersOpen(false)}
        />
      )}

      {isSignOffInitiationOpen && (
        <SignOffInitiationDialog
          application={application}
          isOpen={isSignOffInitiationOpen}
          onClose={() => setIsSignOffInitiationOpen(false)}
        />
      )}

      {isUpdateDialogOpen && (
        <ApplicationUpdateDialog
          application={application}
          isOpen={isUpdateDialogOpen}
          onClose={() => setIsUpdateDialogOpen(false)}
          onSuccess={onUpdate}
        />
      )}

      {isFeedbackDialogOpen && (
        <ReviewerFeedbackCard
          feedback={application.reviewHistory || []}
          onUpdateApplication={onUpdate}
          canUpdate={!isManager}
        />
      )}
    </div>
  );
};

export default ApplicationDetailView;
