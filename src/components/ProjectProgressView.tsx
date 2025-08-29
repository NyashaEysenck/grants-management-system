import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Download, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { format } from 'date-fns';

interface ProgressSubmission {
  milestone_id: string;
  milestone_title: string;
  due_date: string;
  status: string;
  progress_report_filename: string;
  progress_report_date: string;
  is_overdue: boolean;
}

interface ProgressData {
  project_id: string;
  project_title: string;
  progress_submissions: ProgressSubmission[];
  total_milestones: number;
  submitted_reports: number;
}

interface ProjectProgressViewProps {
  projectId: string;
  userRole: string;
}

const ProjectProgressView = ({ projectId, userRole }: ProjectProgressViewProps) => {
  const { toast } = useToast();
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProgressData();
  }, [projectId]);

  const loadProgressData = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/projects/${projectId}/progress-submissions`);
      setProgressData(response);
    } catch (error) {
      console.error('Failed to load progress data:', error);
      toast({
        title: 'Load Failed',
        description: 'Failed to load progress submissions.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string, isOverdue: boolean) => {
    if (isOverdue) {
      return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string, isOverdue: boolean) => {
    if (isOverdue) {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const downloadProgressReport = async (milestoneId: string, filename: string) => {
    try {
      // In a real implementation, this would download the actual file
      toast({
        title: 'Download Started',
        description: `Downloading ${filename}...`,
      });
      // Placeholder for actual download implementation
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: 'Failed to download progress report.',
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center text-muted-foreground">Loading progress submissions...</div>
        </CardContent>
      </Card>
    );
  }

  if (!progressData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center text-muted-foreground">Failed to load progress data.</div>
        </CardContent>
      </Card>
    );
  }

  const completionRate = (progressData.submitted_reports / progressData.total_milestones) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Progress Submissions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Total Reports</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {progressData.submitted_reports}/{progressData.total_milestones}
            </div>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">Completion Rate</span>
            </div>
            <div className="text-2xl font-bold text-green-900">
              {Math.round(completionRate)}%
            </div>
          </div>
          
          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-900">Overdue Reports</span>
            </div>
            <div className="text-2xl font-bold text-yellow-900">
              {progressData.progress_submissions.filter(s => s.is_overdue).length}
            </div>
          </div>
        </div>

        {/* Progress Submissions List */}
        {progressData.progress_submissions.length > 0 ? (
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Submitted Progress Reports</h4>
            {progressData.progress_submissions.map((submission) => (
              <div key={submission.milestone_id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(submission.status, submission.is_overdue)}
                    <div>
                      <h5 className="font-medium">{submission.milestone_title}</h5>
                      <p className="text-sm text-muted-foreground">
                        Due: {format(new Date(submission.due_date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={getStatusColor(submission.status, submission.is_overdue)}
                  >
                    {submission.is_overdue ? 'Overdue' : submission.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{submission.progress_report_filename}</p>
                      <p className="text-xs text-muted-foreground">
                        Submitted: {format(new Date(submission.progress_report_date), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadProgressReport(submission.milestone_id, submission.progress_report_filename)}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h4 className="font-medium mb-1">No Progress Reports Submitted</h4>
            <p className="text-sm text-muted-foreground">
              Progress reports will appear here once submitted by the researcher.
            </p>
          </div>
        )}

        {/* Action Buttons for Grants Managers */}
        {userRole.toLowerCase() === 'grants manager' && progressData.progress_submissions.length > 0 && (
          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" className="flex-1">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Review Meeting
            </Button>
            <Button variant="outline" className="flex-1">
              <FileText className="h-4 w-4 mr-2" />
              Generate Progress Summary
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectProgressView;