
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { uploadProgressReport, getMilestoneStatusColor, type Project, type Milestone, updateMilestoneStatus } from '../services/projects';
import { Calendar, Upload, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import { format, isAfter } from 'date-fns';

interface MilestoneTimelineProps {
  project: Project;
  onUpdate: () => void;
}

const MilestoneTimeline = ({ project, onUpdate }: MilestoneTimelineProps) => {
  const { toast } = useToast();
  const [uploadingReport, setUploadingReport] = useState<string | null>(null);

  const handleProgressReportUpload = async (milestoneId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingReport(milestoneId);

    try {
      const success = await uploadProgressReport(project.id, milestoneId, file);
      
      if (success) {
        toast({
          title: "Progress Report Uploaded",
          description: "Progress report has been successfully uploaded.",
        });
        onUpdate();
      } else {
        throw new Error('Failed to upload progress report');
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload progress report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadingReport(null);
    }
  };

  const getTimelineProgress = () => {
    const completed = project.milestones.filter(m => m.status === 'completed').length;
    return Math.round((completed / project.milestones.length) * 100);
  };

  const isOverdue = (milestone: Milestone) => {
    return milestone.is_overdue || (
      isAfter(new Date(), new Date(milestone.due_date)) && 
      milestone.status !== 'completed' && 
      !milestone.progress_report_uploaded
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Milestone Timeline
        </CardTitle>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-gray-600">{getTimelineProgress()}%</span>
          </div>
          <Progress value={getTimelineProgress()} className="h-2" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {project.milestones.map((milestone, index) => (
            <div key={milestone.id} className="relative">
              {/* Timeline connector */}
              {index < project.milestones.length - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
              )}
              
              <div className="flex gap-4">
                {/* Timeline dot */}
                <div className="flex-shrink-0 mt-1">
                  <div className={`w-3 h-3 rounded-full border-2 ${
                    milestone.status === 'completed' 
                      ? 'bg-green-500 border-green-500' 
                      : isOverdue(milestone)
                      ? 'bg-red-500 border-red-500'
                      : milestone.status === 'in_progress'
                      ? 'bg-blue-500 border-blue-500'
                      : 'bg-gray-300 border-gray-300'
                  }`}></div>
                </div>

                {/* Milestone content */}
                <div className="flex-1 border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium flex items-center gap-2">
                        {milestone.title}
                        {isOverdue(milestone) && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                        {milestone.status === 'completed' && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-gray-500">
                          Due: {format(new Date(milestone.due_date), 'MMM dd, yyyy')}
                        </span>
                        {isOverdue(milestone) && (
                          <Badge variant="destructive" className="text-xs">
                            Overdue
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Badge className={getMilestoneStatusColor(milestone.status)}>
                      {milestone.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>

                  {/* Progress Report Section */}
                  <div className="mt-3 p-3 bg-gray-50 rounded">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">Progress Report</span>
                      </div>
                      
                      {milestone.progress_report_uploaded ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <div className="text-right">
                            <p className="text-sm font-medium">Submitted</p>
                            <p className="text-xs">{milestone.progress_report_filename}</p>
                            {milestone.progress_report_date && (
                              <p className="text-xs text-gray-500">
                                {format(new Date(milestone.progress_report_date), 'MMM dd, yyyy')}
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`report-${milestone.id}`} className="cursor-pointer">
                            <div className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                              <Upload className="h-4 w-4" />
                              <span className="text-sm">
                                {uploadingReport === milestone.id ? 'Uploading...' : 'Upload Report'}
                              </span>
                            </div>
                          </Label>
                          <Input
                            id={`report-${milestone.id}`}
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => handleProgressReportUpload(milestone.id, e)}
                            className="hidden"
                            disabled={uploadingReport === milestone.id}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MilestoneTimeline;
