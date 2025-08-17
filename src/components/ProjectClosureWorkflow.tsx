
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  initiateVCSignOff, 
  generateClosureCertificate, 
  archiveProjectDocuments,
  reviewFinalReports,
  submitFinalReports
} from '../services/projects';
import { type Project } from '../services/projects/api/types';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Download, 
  Archive,
  User,
  Send
} from 'lucide-react';

interface ProjectClosureWorkflowProps {
  project: Project;
  userRole: string;
  userEmail: string;
  onUpdate: () => void;
}

const ProjectClosureWorkflow = ({ project, userRole, userEmail, onUpdate }: ProjectClosureWorkflowProps) => {
  const { toast } = useToast();
  const [reviewNotes, setReviewNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const finalReport = project.final_report;
  const closureWorkflow = project.closure_workflow;

  const handleReviewFinalReports = async (status: 'approved' | 'revision_required') => {
    if (!reviewNotes.trim()) {
      toast({
        title: "Review Notes Required",
        description: "Please add review notes before submitting.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const success = reviewFinalReports(project.id, status, reviewNotes, userEmail);
      if (success) {
        toast({
          title: "Review Submitted",
          description: `Final reports have been ${status === 'approved' ? 'approved' : 'sent back for revision'}.`,
        });
        setReviewNotes('');
        onUpdate();
      }
    } catch (error) {
      toast({
        title: "Review Failed",
        description: "Failed to submit review. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInitiateVCSignOff = async () => {
    setIsProcessing(true);
    try {
      const token = initiateVCSignOff(project.id);
      if (token) {
        toast({
          title: "VC Sign-off Initiated",
          description: "Vice-Chancellor has been notified for final approval.",
        });
        console.log(`VC Sign-off link: /vc-signoff/${token}`);
        onUpdate();
      }
    } catch (error) {
      toast({
        title: "Failed to Initiate Sign-off",
        description: "Failed to initiate VC sign-off. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateClosureCertificate = async () => {
    setIsProcessing(true);
    try {
      const success = generateClosureCertificate(project.id);
      if (success) {
        toast({
          title: "Closure Certificate Generated",
          description: "Project closure certificate has been generated successfully.",
        });
        onUpdate();
      }
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate closure certificate. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleArchiveDocuments = async () => {
    setIsProcessing(true);
    try {
      const success = archiveProjectDocuments(project.id);
      if (success) {
        toast({
          title: "Documents Archived",
          description: "All project documents have been archived to the Document Center.",
        });
        onUpdate();
      }
    } catch (error) {
      toast({
        title: "Archive Failed",
        description: "Failed to archive documents. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getClosureStatusBadge = () => {
    const status = closureWorkflow?.status || 'pending';
    switch (status) {
      case 'closed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Closed</Badge>;
      case 'signed_off':
        return <Badge className="bg-blue-100 text-blue-800"><CheckCircle className="h-3 w-3 mr-1" />Signed Off</Badge>;
      case 'vc_review':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Awaiting VC Approval</Badge>;
      default:
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pending Closure</Badge>;
    }
  };

  const canReviewReports = userRole.toLowerCase() === 'grants manager' && 
                          finalReport?.status === 'submitted';
  const canInitiateSignOff = userRole.toLowerCase() === 'grants manager' && 
                            finalReport?.status === 'approved' && 
                            closureWorkflow?.status !== 'vc_review';
  const canGenerateCertificate = closureWorkflow?.status === 'signed_off' && 
                                !closureWorkflow?.closure_certificate_generated;
  const canArchive = closureWorkflow?.closure_certificate_generated && 
                    project.status !== 'closed';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Project Closure
          </CardTitle>
          {getClosureStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Final Report Review (Grants Manager) */}
        {canReviewReports && (
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900">Review Final Reports</h4>
            <div className="space-y-3">
              <div>
                <Label htmlFor="reviewNotes">Review Notes</Label>
                <Textarea
                  id="reviewNotes"
                  placeholder="Add your review comments..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleReviewFinalReports('approved')}
                  disabled={isProcessing || !reviewNotes.trim()}
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Reports
                </Button>
                <Button
                  onClick={() => handleReviewFinalReports('revision_required')}
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

        {/* VC Sign-off Initiation (Grants Manager) */}
        {canInitiateSignOff && (
          <div className="space-y-4 p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-900">Initiate VC Sign-off</h4>
            <p className="text-sm text-green-700">
              Final reports have been approved. Initiate Vice-Chancellor sign-off to close the project.
            </p>
            <Button
              onClick={handleInitiateVCSignOff}
              disabled={isProcessing}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              Send to VC for Final Approval
            </Button>
          </div>
        )}

        {/* VC Sign-off Status */}
        {closureWorkflow?.status === 'vc_review' && (
          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="font-medium text-yellow-900">Awaiting VC Approval</span>
            </div>
            <p className="text-sm text-yellow-700">
              The project has been sent to the Vice-Chancellor for final sign-off.
            </p>
          </div>
        )}

        {/* VC Signed Off */}
        {closureWorkflow?.status === 'signed_off' && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">VC Approved</span>
            </div>
            <p className="text-sm text-blue-700 mb-2">
              Signed off by: {closureWorkflow.vc_signed_by}
            </p>
            <p className="text-sm text-blue-700">
              Date: {new Date(closureWorkflow.vc_signed_date).toLocaleDateString()}
            </p>
            {closureWorkflow.vc_notes && (
              <div className="mt-2 p-2 bg-white rounded">
                <p className="text-xs font-medium text-blue-800">VC Notes:</p>
                <p className="text-sm text-blue-700">{closureWorkflow.vc_notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Generate Closure Certificate */}
        {canGenerateCertificate && (
          <div className="space-y-4 p-4 bg-purple-50 rounded-lg">
            <h4 className="font-semibold text-purple-900">Generate Closure Certificate</h4>
            <Button
              onClick={handleGenerateClosureCertificate}
              disabled={isProcessing}
              className="w-full"
            >
              <FileText className="h-4 w-4 mr-2" />
              Generate Closure Certificate
            </Button>
          </div>
        )}

        {/* Download Closure Certificate */}
        {closureWorkflow?.closure_certificate_generated && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Closure Certificate</p>
                <p className="text-sm text-gray-600">
                  Certificate generated on {closureWorkflow.closure_certificate_date}
                </p>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        )}

        {/* Archive Documents */}
        {canArchive && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900">Archive Project</h4>
            <p className="text-sm text-gray-600">
              Archive all project documents to the Document Center and mark the project as closed.
            </p>
            <Button
              onClick={handleArchiveDocuments}
              disabled={isProcessing}
              variant="outline"
              className="w-full"
            >
              <Archive className="h-4 w-4 mr-2" />
              Archive Project Documents
            </Button>
          </div>
        )}

        {/* Closed Status */}
        {project.status === 'closed' && (
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-900">Project Closed</span>
            </div>
            <p className="text-sm text-green-700">
              This project has been successfully closed and all documents have been archived.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectClosureWorkflow;
