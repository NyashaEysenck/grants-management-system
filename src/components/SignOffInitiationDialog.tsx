
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { initiateSignOffWorkflow, type Application } from '../services/applicationsService';
import { UserPlus, DollarSign, ExternalLink, Copy } from 'lucide-react';

interface SignOffInitiationDialogProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
}

interface Approver {
  role: 'DORI' | 'DVC' | 'VC';
  email: string;
  name: string;
}

const SignOffInitiationDialog = ({ application, isOpen, onClose }: SignOffInitiationDialogProps) => {
  const { toast } = useToast();
  const [awardAmount, setAwardAmount] = useState<string>('');
  const [approvers, setApprovers] = useState<Approver[]>([
    { role: 'DORI', email: '', name: '' },
    { role: 'DVC', email: '', name: '' },
    { role: 'VC', email: '', name: '' },
  ]);
  const [generatedLinks, setGeneratedLinks] = useState<{ role: string; name: string; email: string; link: string }[]>([]);

  const handleApproverChange = (index: number, field: 'email' | 'name', value: string) => {
    const updated = [...approvers];
    updated[index][field] = value;
    setApprovers(updated);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Link copied to clipboard",
    });
  };

  const handleSubmit = () => {
    if (!application) return;

    const amount = parseFloat(awardAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid award amount.",
        variant: "destructive"
      });
      return;
    }

    const validApprovers = approvers.filter(a => a.email && a.name);
    if (validApprovers.length !== 3) {
      toast({
        title: "Incomplete Information",
        description: "Please provide email and name for all approvers.",
        variant: "destructive"
      });
      return;
    }

    const success = initiateSignOffWorkflow(application.id, amount, validApprovers);
    if (success) {
      // Generate sign-off links
      const signOffLinks = validApprovers.map(approver => ({
        role: approver.role,
        name: approver.name,
        email: approver.email,
        link: `${window.location.origin}/signoff/${application.id}/${approver.role}`
      }));

      setGeneratedLinks(signOffLinks);
      
      toast({
        title: "Sign-off Initiated",
        description: "Approval workflow has been started. Sign-off links generated below.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to initiate sign-off workflow.",
        variant: "destructive"
      });
    }
  };

  const handleClose = () => {
    setGeneratedLinks([]);
    onClose();
  };

  if (!application) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Initiate Sign-off Workflow
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">{application.proposalTitle}</h3>
              <p className="text-sm text-gray-600">Applicant: {application.applicantName}</p>
            </CardContent>
          </Card>

          {generatedLinks.length === 0 ? (
            <>
              <div>
                <Label htmlFor="awardAmount" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Award Amount
                </Label>
                <Input
                  id="awardAmount"
                  type="number"
                  placeholder="Enter award amount"
                  value={awardAmount}
                  onChange={(e) => setAwardAmount(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Approval Chain</h4>
                {approvers.map((approver, index) => (
                  <Card key={approver.role}>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-sm font-medium">{approver.role}</Label>
                          <div className="text-xs text-gray-500 mt-1">
                            {approver.role === 'DORI' && 'Director of Research & Innovation'}
                            {approver.role === 'DVC' && 'Deputy Vice-Chancellor'}
                            {approver.role === 'VC' && 'Vice-Chancellor'}
                          </div>
                        </div>
                        <div>
                          <Label htmlFor={`name-${approver.role}`}>Name</Label>
                          <Input
                            id={`name-${approver.role}`}
                            placeholder="Full name"
                            value={approver.name}
                            onChange={(e) => handleApproverChange(index, 'name', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`email-${approver.role}`}>Email</Label>
                          <Input
                            id={`email-${approver.role}`}
                            type="email"
                            placeholder="email@institution.edu"
                            value={approver.email}
                            onChange={(e) => handleApproverChange(index, 'email', e.target.value)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  Initiate Sign-off
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <h4 className="font-semibold text-green-700">✅ Sign-off Workflow Initiated</h4>
                <p className="text-sm text-gray-600">
                  Click the links below to test the approval workflow:
                </p>
                
                {generatedLinks.map((item, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">{item.role} - {item.name}</span>
                            <p className="text-sm text-gray-600">{item.email}</p>
                          </div>
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
                            Open Sign-off Form
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

export default SignOffInitiationDialog;
