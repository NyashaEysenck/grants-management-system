
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { FileText, CheckCircle, XCircle, DollarSign, User, Calendar } from 'lucide-react';
import { getProjectByVCToken, submitVCSignOff, type Project } from '../services/projectsService';
import { useToast } from '@/hooks/use-toast';

interface VCSignOffFormData {
  vcName: string;
  decision: 'approved' | 'rejected';
  notes: string;
}

const VCSignOffPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<VCSignOffFormData>({
    defaultValues: {
      vcName: '',
      decision: 'approved',
      notes: '',
    },
  });

  useEffect(() => {
    if (token) {
      const foundProject = getProjectByVCToken(token);
      if (foundProject) {
        setProject(foundProject);
        
        // Check if already signed off
        if (foundProject.closureWorkflow?.status === 'signed_off' || foundProject.closureWorkflow?.status === 'closed') {
          setIsSubmitted(true);
        }
      } else {
        toast({
          title: "Invalid Sign-off Link",
          description: "This sign-off link is not valid or has expired.",
          variant: "destructive"
        });
        navigate('/');
      }
    }
  }, [token, navigate, toast]);

  const onSubmit = async (data: VCSignOffFormData) => {
    if (!project || !token) return;

    const success = submitVCSignOff(token, data.decision, data.notes, data.vcName);

    if (success) {
      setIsSubmitted(true);
      toast({
        title: "Sign-off Submitted",
        description: `Project has been ${data.decision} successfully.`,
      });
    } else {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your sign-off. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Loading project...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSubmitted || project.closureWorkflow?.status === 'signed_off' || project.closureWorkflow?.status === 'closed') {
    const decision = project.closureWorkflow?.vcSignedBy ? 'signed off' : 'processed';
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Project {decision}</h2>
            <p className="text-gray-600">
              {project.closureWorkflow?.vcSignedBy 
                ? `This project has been signed off by ${project.closureWorkflow.vcSignedBy}.`
                : 'Your sign-off decision has been submitted successfully.'
              }
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vice-Chancellor Project Sign-off</h1>
          <p className="text-gray-600">Please review the project closure and provide your final approval.</p>
        </div>

        {/* Project Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Project Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">{project.title}</h3>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Project Period:</span>{' '}
                    {format(new Date(project.startDate), 'MMM dd, yyyy')} - {format(new Date(project.endDate), 'MMM dd, yyyy')}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Status:</span>{' '}
                    <span className="capitalize">{project.status.replace('_', ' ')}</span>
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800 mb-2">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-medium">Project Completion</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    All milestones completed and final reports submitted for closure.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Final Reports Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Final Reports Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-900">Narrative Report</span>
                </div>
                <p className="text-sm text-green-700">
                  {project.finalReport?.narrativeReport?.filename || 'narrative_report_final.pdf'}
                </p>
                <p className="text-xs text-green-600">
                  Status: {project.finalReport?.status === 'approved' ? 'Approved by Grants Manager' : 'Submitted'}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-900">Financial Report</span>
                </div>
                <p className="text-sm text-green-700">
                  {project.finalReport?.financialReport?.filename || 'financial_report_final.pdf'}
                </p>
                <p className="text-xs text-green-600">
                  Status: {project.finalReport?.status === 'approved' ? 'Approved by Grants Manager' : 'Submitted'}
                </p>
              </div>
            </div>
            
            {project.finalReport?.reviewNotes && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-800 mb-1">Grants Manager Review:</p>
                <p className="text-sm text-blue-700">{project.finalReport.reviewNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sign-off Form */}
        <Card>
          <CardHeader>
            <CardTitle>Final Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="vcName"
                  rules={{ required: "Name is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="decision"
                  rules={{ required: "Decision is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Decision *</FormLabel>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <Button
                          type="button"
                          variant={field.value === 'approved' ? 'default' : 'outline'}
                          onClick={() => field.onChange('approved')}
                          className="justify-center"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve Project Closure
                        </Button>
                        <Button
                          type="button"
                          variant={field.value === 'rejected' ? 'destructive' : 'outline'}
                          onClick={() => field.onChange('rejected')}
                          className="justify-center"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject Closure
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comments (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Add any comments about your decision..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end pt-6">
                  <Button type="submit" size="lg">
                    Submit Final Decision
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VCSignOffPage;
