import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  XCircle, 
  FileText,
  AlertTriangle,
  Award
} from 'lucide-react';
import { awardAcceptanceService } from '@/services/applicationsService';

interface AwardAcceptanceDialogProps {
  applicationId: string;
  applicationTitle: string;
  awardAmount?: number;
  isOpen: boolean;
  onClose: () => void;
  onDecisionMade: () => void;
}

const AwardAcceptanceDialog = ({
  applicationId,
  applicationTitle,
  awardAmount,
  isOpen,
  onClose,
  onDecisionMade
}: AwardAcceptanceDialogProps) => {
  const { toast } = useToast();
  const [comments, setComments] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState<'accept' | 'reject' | null>(null);

  const handleDecision = async (decision: 'accepted' | 'rejected') => {
    setIsProcessing(true);
    try {
      await awardAcceptanceService.submitAwardDecision(applicationId, decision, comments);

      toast({
        title: decision === 'accepted' ? 'Award Accepted' : 'Award Rejected',
        description: `You have successfully ${decision} the award.`,
        variant: decision === 'accepted' ? 'default' : 'destructive'
      });

      onDecisionMade();
      onClose();
      setComments('');
      setShowConfirmation(null);
    } catch (error: any) {
      toast({
        title: 'Submission Failed',
        description: error.response?.data?.detail || 'Failed to submit your decision.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const renderConfirmationView = () => {
    const isAccepting = showConfirmation === 'accept';
    
    return (
      <div className="space-y-4">
        <div className={`p-4 rounded-lg ${isAccepting ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            {isAccepting ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            <h4 className={`font-semibold ${isAccepting ? 'text-green-900' : 'text-red-900'}`}>
              Confirm {isAccepting ? 'Acceptance' : 'Rejection'}
            </h4>
          </div>
          <p className={`text-sm ${isAccepting ? 'text-green-800' : 'text-red-800'}`}>
            {isAccepting 
              ? 'Are you sure you want to accept this award? This action cannot be undone.'
              : 'Are you sure you want to reject this award? This action cannot be undone.'
            }
          </p>
        </div>

        {comments && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <Label className="text-sm font-medium text-gray-700">Your Comments:</Label>
            <p className="text-sm text-gray-600 mt-1">{comments}</p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => handleDecision(isAccepting ? 'accepted' : 'rejected')}
            disabled={isProcessing}
            variant={isAccepting ? 'default' : 'destructive'}
            className="flex-1"
          >
            {isProcessing ? 'Processing...' : `Confirm ${isAccepting ? 'Accept' : 'Reject'}`}
          </Button>
          <Button
            onClick={() => setShowConfirmation(null)}
            variant="outline"
            disabled={isProcessing}
            className="flex-1"
          >
            Back
          </Button>
        </div>
      </div>
    );
  };

  const renderDecisionForm = () => (
    <div className="space-y-6">
      {/* Award Details */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start gap-3">
          <Award className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Congratulations!</h4>
            <p className="text-sm text-blue-800 mb-2">
              Your proposal "{applicationTitle}" has been approved for funding.
            </p>
            {awardAmount && (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                Award Amount: ${awardAmount.toLocaleString()}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Important Notice */}
      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-yellow-900 mb-1">Important Notice</h4>
            <p className="text-sm text-yellow-800">
              Please review the award document carefully before making your decision. 
              Once you accept or reject the award, this decision cannot be changed.
            </p>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="space-y-2">
        <Label htmlFor="comments">Comments (Optional)</Label>
        <Textarea
          id="comments"
          placeholder="Add any comments about your decision..."
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          className="min-h-[80px]"
        />
        <p className="text-xs text-muted-foreground">
          Your comments will be recorded with your decision.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          onClick={() => setShowConfirmation('accept')}
          className="flex-1"
          variant="default"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Accept Award
        </Button>
        <Button
          onClick={() => setShowConfirmation('reject')}
          className="flex-1"
          variant="destructive"
        >
          <XCircle className="h-4 w-4 mr-2" />
          Reject Award
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {showConfirmation ? 'Confirm Decision' : 'Award Decision Required'}
          </DialogTitle>
          <DialogDescription>
            {showConfirmation 
              ? 'Please confirm your decision regarding this award.'
              : 'You have received an award for your research proposal. Please review and make your decision.'
            }
          </DialogDescription>
        </DialogHeader>
        
        {showConfirmation ? renderConfirmationView() : renderDecisionForm()}
      </DialogContent>
    </Dialog>
  );
};

export default AwardAcceptanceDialog;