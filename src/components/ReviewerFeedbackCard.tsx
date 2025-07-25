
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { MessageSquare, FileText, Download, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { ReviewerFeedback } from '../services/applicationsService';

interface ReviewerFeedbackCardProps {
  feedback: ReviewerFeedback[];
  onUpdateApplication?: () => void;
  canUpdate?: boolean;
}

const ReviewerFeedbackCard: React.FC<ReviewerFeedbackCardProps> = ({
  feedback,
  onUpdateApplication,
  canUpdate = false,
}) => {
  if (feedback.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No reviewer feedback available yet.</p>
        </CardContent>
      </Card>
    );
  }

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case 'approve':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'reject':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'request_changes':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-600" />;
    }
  };

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'approve':
        return 'bg-green-100 text-green-800';
      case 'reject':
        return 'bg-red-100 text-red-800';
      case 'request_changes':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const hasRequestedChanges = feedback.some(f => f.decision === 'request_changes');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Reviewer Feedback ({feedback.length})
          </span>
          {canUpdate && hasRequestedChanges && (
            <Button onClick={onUpdateApplication} size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Update Application
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {feedback.map((review) => (
          <div key={review.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {getDecisionIcon(review.decision)}
                  <span className="font-medium">{review.reviewerName || 'Anonymous Reviewer'}</span>
                  <Badge className={getDecisionColor(review.decision)}>
                    {review.decision.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{review.reviewerEmail}</p>
              </div>
              <div className="text-xs text-gray-400">
                {format(new Date(review.submittedAt), 'MMM dd, yyyy HH:mm')}
              </div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{review.comments}</p>
            </div>
            
            {review.annotatedFileName && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <FileText className="h-4 w-4" />
                <span>Annotated file: {review.annotatedFileName}</span>
                <Button variant="ghost" size="sm" className="h-auto p-0 text-blue-600 hover:text-blue-700">
                  <Download className="h-3 w-3 ml-1" />
                </Button>
              </div>
            )}
          </div>
        ))}
        
        {hasRequestedChanges && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Action Required</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  One or more reviewers have requested changes to your application. 
                  Please review the feedback above and update your application accordingly.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewerFeedbackCard;
