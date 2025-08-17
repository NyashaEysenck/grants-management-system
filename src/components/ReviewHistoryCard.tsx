import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { MessageSquare, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { ReviewHistoryEntry } from '../services/applicationsService';

interface ReviewHistoryCardProps {
  history: ReviewHistoryEntry[];
  onUpdateApplication?: () => void;
  canUpdate?: boolean;
}

const ReviewHistoryCard: React.FC<ReviewHistoryCardProps> = ({
  history,
  onUpdateApplication,
  canUpdate = false,
}) => {
  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No review history available yet.</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'needs_revision':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'needs_revision':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const hasRequestedChanges = history.some(h => h.status === 'needs_revision');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Review History ({history.length})
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
        {history.map((review) => (
          <div key={review.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(review.status)}
                  <span className="font-medium">{review.reviewerName}</span>
                  <Badge className={getStatusColor(review.status)}>
                    {review.status.replace('_', ' ').toUpperCase()}
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

export default ReviewHistoryCard;
