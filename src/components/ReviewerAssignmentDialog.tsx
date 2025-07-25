
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { assignReviewers, generateReviewToken, storeReviewToken, type Application } from '../services/applicationsService';
import { Plus, X, Send, ExternalLink, Copy } from 'lucide-react';

interface ReviewerAssignmentDialogProps {
  application: Application;
  isOpen: boolean;
  onClose: () => void;
}

const ReviewerAssignmentDialog = ({ application, isOpen, onClose }: ReviewerAssignmentDialogProps) => {
  const { toast } = useToast();
  const [reviewerEmails, setReviewerEmails] = useState<string[]>(['']);
  const [emailMessage, setEmailMessage] = useState(`
You have been assigned to review a grant application: "${application.proposalTitle}"

Please use the link below to access the review form:
[REVIEW_LINK]

Thank you for your time and expertise.
  `.trim());
  const [generatedLinks, setGeneratedLinks] = useState<{ email: string; link: string }[]>([]);

  const addReviewerField = () => {
    setReviewerEmails([...reviewerEmails, '']);
  };

  const removeReviewerField = (index: number) => {
    setReviewerEmails(reviewerEmails.filter((_, i) => i !== index));
  };

  const updateReviewerEmail = (index: number, email: string) => {
    const updated = [...reviewerEmails];
    updated[index] = email;
    setReviewerEmails(updated);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Link copied to clipboard",
    });
  };

  const handleAssignReviewers = () => {
    const validEmails = reviewerEmails.filter(email => email.trim() && email.includes('@'));
    
    if (validEmails.length === 0) {
      toast({
        title: "Error",
        description: "Please enter at least one valid email address.",
        variant: "destructive"
      });
      return;
    }

    // Generate review tokens and store them
    const reviewLinks: { email: string; link: string }[] = [];
    validEmails.forEach(email => {
      const token = generateReviewToken();
      storeReviewToken(application.id, token);
      const reviewLink = `${window.location.origin}/review/${token}`;
      reviewLinks.push({ email, link: reviewLink });
    });

    // Assign reviewers
    const success = assignReviewers(application.id, validEmails);
    
    if (success) {
      setGeneratedLinks(reviewLinks);
      
      toast({
        title: "Reviewers Assigned",
        description: `Successfully assigned ${validEmails.length} reviewer(s). Review links generated below.`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to assign reviewers.",
        variant: "destructive"
      });
    }
  };

  const handleClose = () => {
    setGeneratedLinks([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Reviewers</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">{application.proposalTitle}</h3>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Applicant:</span> {application.applicantName}
            </p>
          </div>

          {generatedLinks.length === 0 ? (
            <>
              <div className="space-y-4">
                <Label>Reviewer Email Addresses</Label>
                {reviewerEmails.map((email, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="reviewer@domain.com"
                      value={email}
                      onChange={(e) => updateReviewerEmail(index, e.target.value)}
                      className="flex-1"
                    />
                    {reviewerEmails.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeReviewerField(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addReviewerField}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Reviewer
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailMessage">Email Message Template</Label>
                <Textarea
                  id="emailMessage"
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  className="min-h-[120px]"
                  placeholder="Customize the message sent to reviewers..."
                />
                <p className="text-xs text-gray-500">
                  [REVIEW_LINK] will be replaced with the unique review link for each reviewer.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={handleAssignReviewers}>
                  <Send className="h-4 w-4 mr-2" />
                  Assign Reviewers
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <h4 className="font-semibold text-green-700">✅ Reviewers Successfully Assigned</h4>
                <p className="text-sm text-gray-600">
                  Click the links below to test the review workflow:
                </p>
                
                {generatedLinks.map((item, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{item.email}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(item.link)}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copy
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => window.open(item.link, '_blank')}
                            className="flex items-center gap-1"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Open Review Form
                          </Button>
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1 truncate">
                            {item.link}
                          </code>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleClose}>
                  Done
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewerAssignmentDialog;
