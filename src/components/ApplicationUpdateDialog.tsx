
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Upload, FileText, RotateCcw } from 'lucide-react';
import { Application, updateApplicationForRevision } from '../services/applicationsService';
import { useToast } from '@/hooks/use-toast';

interface UpdateFormData {
  proposalTitle: string;
  proposalFile: string;
  revisionNotes: string;
}

interface ApplicationUpdateDialogProps {
  application: Application;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ApplicationUpdateDialog: React.FC<ApplicationUpdateDialogProps> = ({
  application,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  
  const form = useForm<UpdateFormData>({
    defaultValues: {
      proposalTitle: application.proposalTitle,
      proposalFile: application.proposalFileName || '',
      revisionNotes: '',
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      form.setValue('proposalFile', file.name);
    }
  };

  const onSubmit = async (data: UpdateFormData) => {
    console.log('Resubmit button clicked in update dialog for application:', application.id);
    
    try {
      setIsSubmitting(true);
      setUploadProgress(0);
      console.log('Calling updateApplicationForRevision...');
      await updateApplicationForRevision(
        application.id,
        data.proposalTitle,
        selectedFile || undefined,
        data.revisionNotes,
        (pct) => setUploadProgress(pct)
      );
      
      console.log('Application revision update successful');
      toast({
        title: "Application Updated",
        description: "Your revised application has been resubmitted for review.",
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Application revision update failed:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Update Application
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Reviewer Notes (from managers/reviewers) */}
          {application.reviewerFeedback && application.reviewerFeedback.length > 0 && (
            <div className="border rounded-md p-4 bg-blue-50">
              <h3 className="font-semibold mb-2 text-blue-900">Reviewer Notes</h3>
              <p className="text-xs text-blue-700 mb-3">Feedback from grants managers and reviewers</p>
              <div className="space-y-3 max-h-60 overflow-auto pr-2">
                {application.reviewerFeedback.map((fb) => (
                  <div key={fb.id} className="border rounded p-3 bg-white">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium">{fb.reviewerName || 'Reviewer'}</p>
                        {fb.reviewerEmail && (
                          <p className="text-xs text-gray-500">{fb.reviewerEmail}</p>
                        )}
                        <p className="text-xs font-medium text-blue-700 mt-1 capitalize">{fb.decision?.replace('_', ' ') || 'feedback'}</p>
                      </div>
                      {fb.submittedAt && (
                        <p className="text-xs text-gray-400">{new Date(fb.submittedAt).toLocaleString()}</p>
                      )}
                    </div>
                    {fb.comments && (
                      <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{fb.comments}</p>
                    )}
                    {fb.annotatedFileName && (
                      <p className="text-xs text-blue-600 mt-2"> {fb.annotatedFileName}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Revision Notes History (from researcher) */}
          {application.revisionNotes && application.revisionNotes.length > 0 && (
            <div className="border rounded-md p-4 bg-green-50">
              <h3 className="font-semibold mb-2 text-green-900">Your Revision History</h3>
              <p className="text-xs text-green-700 mb-3">Your previous revision notes and changes</p>
              <div className="space-y-3 max-h-60 overflow-auto pr-2">
                {application.revisionNotes
                  .sort((a, b) => b.revisionNumber - a.revisionNumber)
                  .map((note) => (
                  <div key={note.id} className="border rounded p-3 bg-white">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-green-700">Revision #{note.revisionNumber}</p>
                        <p className="text-xs text-gray-500">By you</p>
                      </div>
                      <p className="text-xs text-gray-400">{new Date(note.submittedAt).toLocaleString()}</p>
                    </div>
                    <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{note.notes}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Revision #{(application.revisionCount || 0) + 1}</h4>
            <p className="text-sm text-blue-700">
              You can update your proposal title and upload a revised document based on reviewer feedback.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="proposalTitle"
                rules={{ required: "Proposal title is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proposal Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter updated proposal title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Label htmlFor="proposalFile">Updated Proposal Document (optional)</Label>
                <div className="text-sm text-gray-600">
                  Current file: <span className="font-medium">{application.proposalFileName || 'No file on record'}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Input
                      id="proposalFile"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  <Upload className="h-5 w-5 text-gray-400" />
                </div>
                {selectedFile && (
                  <p className="text-sm text-gray-600">Selected: {selectedFile.name}</p>
                )}
                {isSubmitting && (
                  <div className="w-full bg-gray-200 rounded h-2 mt-2">
                    <div
                      className="bg-blue-600 h-2 rounded"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>

              <FormField
                control={form.control}
                name="revisionNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Revision Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the changes you made in response to reviewer feedback..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  <FileText className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Submitting…' : 'Resubmit Application'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationUpdateDialog;
