import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Download,
  Clock,
  User
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { format } from 'date-fns';
import type { Project } from '@/services/projects/api/types';

interface FinalReportReviewProps {
  project: Project;
  userRole: string;
  userEmail: string;
  onUpdate: () => void;
}

const FinalReportReview = ({ project, userRole, userEmail, onUpdate }: FinalReportReviewProps) => {
  const { toast } = useToast();
  const [reviewNotes, setReviewNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const finalReport = project.final_report;
  const canReview = userRole.toLowerCase() === 'grants manager' && 
                   finalReport?.status === 'submitted';

  const handleReview = async (status: 'approved' | 'revision_required') => {
    if (!reviewNotes.trim()) {
      toast({
        title: "Review Notes Required",
        description: "Please add review comments before submitting.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      await apiClient.post(`/projects/${project.id}/final-report/review`, {
        status,
        comments: reviewNotes.trim()
      });

      toast({
        title: "Review Submitted",
        description: `Final reports have been ${status === 'approved' ? 'approved' : 'sent back for revision'}.`,
      });

      setReviewNotes('');
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Review Failed",
        description: error.response?.data?.detail || "Failed to submit review.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerClosureProcess = async () => {
    setIsProcessing(true);
    try {
      await apiClient.put(`/projects/${project.id}/closure/trigger`);
      
      toast({
        title: "Closure Process Initiated",
        description: "Project closure process has been triggered successfully.",
      });

      onUpdate();
    } catch (error: any) {
      toast({
        title: "Failed to Trigger Closure",
        description: error.response?.data?.detail || "Failed to trigger closure process.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadReport = (reportType: 'narrative' | 'financial') => {
    // Placeholder for actual download implementation
    toast({
      title: 'Download Started',
      description: `Downloading ${reportType} report...`,
    });
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'revision_required':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="h-3 w-3 mr-1" />Revision Required</Badge>;
      case 'submitted':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />Awaiting Review</Badge>;
      case 'under_review':
        return <Badge className="bg-purple-100 text-purple-800"><Clock className="h-3 w-3 mr-1" />Under Review</Badge>;
      default:
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Draft</Badge>;
    }
  };

  if (!finalReport) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Final Report Review
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3" />
            <p>No final reports have been submitted yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Final Report Review
          </CardTitle>
          {getStatusBadge(finalReport.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Report Files */}
        <div className="space-y-4">
          <h4 className="font-semibold">Submitted Reports</h4>
          
          {finalReport.narrative_report && (
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Narrative Report</p>
                  <p className="text-sm text-muted-foreground">
                    {finalReport.narrative_report.filename} • 
                    Uploaded {format(new Date(finalReport.narrative_report.uploaded_date), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => downloadReport('narrative')}
              >
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            </div>
          )}

          {finalReport.financial_report && (
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Financial Report</p>
                  <p className="text-sm text-muted-foreground">
                    {finalReport.financial_report.filename} • 
                    Uploaded {format(new Date(finalReport.financial_report.uploaded_date), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => downloadReport('financial')}
              >
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            </div>
          )}
        </div>

        {/* Previous Review */}
        {finalReport.reviewed_by && finalReport.review_notes && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Previous Review</span>
            </div>
            <p className="text-sm text-muted-foreground mb-1">
              Reviewed by {finalReport.reviewed_by} on {finalReport.reviewed_date && format(new Date(finalReport.reviewed_date), 'MMM dd, yyyy')}
            </p>
            <p className="text-sm">{finalReport.review_notes}</p>
          </div>
        )}

        {/* Review Form (Grants Manager) */}
        {canReview && (
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900">Submit Review</h4>
            <div className="space-y-3">
              <div>
                <Label htmlFor="reviewNotes">Review Comments</Label>
                <Textarea
                  id="reviewNotes"
                  placeholder="Add your detailed review comments..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="mt-1 min-h-[120px]"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleReview('approved')}
                  disabled={isProcessing || !reviewNotes.trim()}
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Reports
                </Button>
                <Button
                  onClick={() => handleReview('revision_required')}
                  disabled={isProcessing || !reviewNotes.trim()}
                  variant="outline"
                  className="flex-1"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Request Revision
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Trigger Closure Process */}
        {finalReport.status === 'approved' && userRole.toLowerCase() === 'grants manager' && (
          <div className="space-y-4 p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-900">Initiate Project Closure</h4>
            <p className="text-sm text-green-700">
              Final reports have been approved. You can now trigger the formal project closure process.
            </p>
            <Button
              onClick={triggerClosureProcess}
              disabled={isProcessing}
              className="w-full"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Trigger Closure Process
            </Button>
          </div>
        )}

        {/* Status Information */}
        <div className="text-sm text-muted-foreground">
          <p>
            Status: {finalReport.status} • 
            Last updated: {format(new Date(project.updated_at), 'MMM dd, yyyy HH:mm')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinalReportReview;