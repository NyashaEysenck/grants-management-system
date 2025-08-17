
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { createRequisition, submitRequisition, type Project } from '../services/projects';
import { DollarSign } from 'lucide-react';

interface FundRequisitionFormProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const FundRequisitionForm = ({ project, isOpen, onClose, onSuccess }: FundRequisitionFormProps) => {
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [milestoneId, setMilestoneId] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableMilestones = project.milestones.filter(
    milestone => milestone.status === 'in_progress' || milestone.status === 'completed'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !milestoneId || !notes.trim()) {
      toast({
        title: "Incomplete Form",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await submitRequisition(project.id, {
        milestone_id: milestoneId,
        amount: amountNum,
        notes: notes.trim(),
        requested_date: new Date().toISOString()
      });

      if (success) {
        toast({
          title: "Requisition Submitted",
          description: "Your fund requisition has been submitted for review.",
        });
        
        // Reset form
        setAmount('');
        setMilestoneId('');
        setNotes('');
        
        onSuccess();
        onClose();
      } else {
        throw new Error('Failed to submit requisition');
      }
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Failed to submit requisition. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedMilestone = availableMilestones.find(m => m.id === milestoneId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Fund Requisition Request
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-1">{project.title}</h3>
            <p className="text-sm text-gray-600">Project ID: {project.id}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="milestone">Milestone *</Label>
            <Select value={milestoneId} onValueChange={setMilestoneId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a milestone" />
              </SelectTrigger>
              <SelectContent>
                {availableMilestones.map((milestone) => (
                  <SelectItem key={milestone.id} value={milestone.id}>
                    {milestone.title} ({milestone.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedMilestone && (
              <p className="text-xs text-gray-500 mt-1">
                Due: {new Date(selectedMilestone.due_date).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount Requested *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Justification & Notes *</Label>
            <Textarea
              id="notes"
              placeholder="Provide details about how the funds will be used and justification for the request..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Requisition'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FundRequisitionForm;
