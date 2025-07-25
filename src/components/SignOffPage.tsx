
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
import { FileText, CheckCircle, XCircle, DollarSign, User } from 'lucide-react';
import { getApplicationBySignOffToken, submitSignOffApproval, type Application, type SignOffApproval } from '../services/applicationsService';
import { useToast } from '@/hooks/use-toast';

interface SignOffFormData {
  approverName: string;
  comments: string;
  decision: 'approved' | 'rejected';
}

const SignOffPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [application, setApplication] = useState<Application | null>(null);
  const [approval, setApproval] = useState<SignOffApproval | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<SignOffFormData>({
    defaultValues: {
      approverName: '',
      comments: '',
      decision: 'approved',
    },
  });

  useEffect(() => {
    if (token) {
      const result = getApplicationBySignOffToken(token);
      if (result) {
        setApplication(result.application);
        setApproval(result.approval);
        form.setValue('approverName', result.approval.approverName || '');
      } else {
        toast({
          title: "Invalid Sign-off Link",
          description: "This sign-off link is not valid or has expired.",
          variant: "destructive"
        });
        navigate('/');
      }
    }
  }, [token, navigate, toast, form]);

  const onSubmit = async (data: SignOffFormData) => {
    if (!application || !approval || !token) return;

    const success = submitSignOffApproval(token, data.decision, data.comments, data.approverName);

    if (success) {
      setIsSubmitted(true);
      toast({
        title: "Approval Submitted",
        description: `Your ${data.decision} decision has been recorded successfully.`,
      });
    } else {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your approval. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (!application || !approval) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Loading application...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSubmitted || approval.status !== 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            {approval.status === 'approved' ? (
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            ) : (
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            )}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {approval.status === 'pending' ? 'Approval Submitted' : `Already ${approval.status}`}
            </h2>
            <p className="text-gray-600">
              {approval.status === 'pending' 
                ? 'Your approval decision has been submitted successfully.'
                : `You have already ${approval.status} this application.`
              }
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getRoleTitle = (role: string) => {
    switch (role) {
      case 'DORI': return 'Director of Research & Innovation';
      case 'DVC': return 'Deputy Vice-Chancellor';  
      case 'VC': return 'Vice-Chancellor';
      default: return role;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Grant Award Sign-off</h1>
          <p className="text-gray-600">Please review the grant award and provide your approval decision.</p>
        </div>

        {/* Application Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Grant Award Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">{application.proposalTitle}</h3>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Principal Investigator:</span> {application.applicantName}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Email:</span> {application.email}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Submission Date:</span>{' '}
                    {format(new Date(application.submissionDate), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-lg font-semibold text-green-600">
                  <DollarSign className="h-5 w-5" />
                  Award Amount: ${application.awardAmount?.toLocaleString()}
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-sm font-medium text-blue-800">
                    <User className="h-4 w-4" />
                    Your Role: {getRoleTitle(approval.role)}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sign-off Form */}
        <Card>
          <CardHeader>
            <CardTitle>Approval Decision</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="approverName"
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
                          className="justify-start"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          type="button"
                          variant={field.value === 'rejected' ? 'destructive' : 'outline'}
                          onClick={() => field.onChange('rejected')}
                          className="justify-start"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="comments"
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
                    Submit Decision
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

export default SignOffPage;
