
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { uploadFinalReport, submitFinalReports, type Project } from '../services/projects';
import { Upload, FileText, DollarSign, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface FinalReportUploadProps {
  project: Project;
  onUpdate: () => void;
}

const FinalReportUpload = ({ project, onUpdate }: FinalReportUploadProps) => {
  const { toast } = useToast();
  const [narrativeFile, setNarrativeFile] = useState<File | null>(null);
  const [financialFile, setFinancialFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const finalReport = project.final_report;
  const isSubmitted = finalReport?.status === 'submitted' || finalReport?.status === 'under_review' || finalReport?.status === 'approved';

  const handleFileChange = (type: 'narrative' | 'financial', file: File | null) => {
    if (type === 'narrative') {
      setNarrativeFile(file);
    } else {
      setFinancialFile(file);
    }
  };

  const handleUpload = async (type: 'narrative' | 'financial') => {
    const file = type === 'narrative' ? narrativeFile : financialFile;
    if (!file) return;

    try {
      const success = await uploadFinalReport(project.id, type, file);
      if (success) {
        toast({
          title: "Report Uploaded",
          description: `${type === 'narrative' ? 'Narrative' : 'Financial'} report uploaded successfully.`,
        });
        onUpdate();
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload report. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSubmitReports = async () => {
    if (!finalReport?.narrative_report || !finalReport?.financial_report) {
      toast({
        title: "Missing Reports",
        description: "Please upload both narrative and financial reports before submitting.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const success = submitFinalReports(project.id);
      if (success) {
        toast({
          title: "Reports Submitted",
          description: "Final reports have been submitted for review.",
        });
        onUpdate();
      }
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Failed to submit reports. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'under_review':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />Under Review</Badge>;
      case 'submitted':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Submitted</Badge>;
      case 'revision_required':
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="h-3 w-3 mr-1" />Revision Required</Badge>;
      default:
        return <Badge variant="outline">Draft</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Final Reports
          </CardTitle>
          {finalReport?.status && getStatusBadge(finalReport.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {finalReport?.review_notes && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-800 mb-1">Review Notes:</p>
            <p className="text-sm text-muted-foreground">{finalReport.review_notes}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Narrative Report */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <Label className="font-medium">Narrative Report</Label>
            </div>
            
            {finalReport?.narrative_report ? (
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium">{finalReport.narrative_report.filename}</p>
                <p className="text-xs text-green-600">
                  Uploaded: {new Date(finalReport.narrative_report.uploaded_date).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileChange('narrative', e.target.files?.[0] || null)}
                  disabled={isSubmitted}
                />
                <Button
                  onClick={() => handleUpload('narrative')}
                  disabled={!narrativeFile || isSubmitted}
                  size="sm"
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Narrative Report
                </Button>
              </div>
            )}
          </div>

          {/* Financial Report */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <Label className="font-medium">Financial Report</Label>
            </div>
            
            {finalReport?.financial_report ? (
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium">{finalReport.financial_report.filename}</p>
                <p className="text-xs text-green-600">
                  Uploaded: {new Date(finalReport.financial_report.uploaded_date).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  type="file"
                  accept=".pdf,.xls,.xlsx"
                  onChange={(e) => handleFileChange('financial', e.target.files?.[0] || null)}
                  disabled={isSubmitted}
                />
                <Button
                  onClick={() => handleUpload('financial')}
                  disabled={!financialFile || isSubmitted}
                  size="sm"
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Financial Report
                </Button>
              </div>
            )}
          </div>
        </div>

        {finalReport?.narrative_report && finalReport?.financial_report && !isSubmitted && (
          <div className="pt-4 border-t">
            <Button
              onClick={handleSubmitReports}
              disabled={isSubmitting}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Final Reports for Review'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FinalReportUpload;
