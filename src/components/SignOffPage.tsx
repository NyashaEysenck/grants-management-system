
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
import { FileText, CheckCircle, XCircle, DollarSign, User, Download } from 'lucide-react';
import { getApplicationBySignOffToken, submitSignOffApproval } from '../services/applications/api/signOffApi';
import { downloadApplicationDocument } from '../services/documentsService';
import { type Application, type SignOffApproval } from '../services/applications/types';
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
    const loadApplicationData = async () => {
      if (!token) return;
      
      try {
        const result = await getApplicationBySignOffToken(token);
        if (result) {
          setApplication(result.application);
          setApproval(result.approval);
          // Set approver name from approval data
          const approverName = result.approval?.approverName || '';
          form.setValue('approverName', approverName);
          console.log('Setting approver name:', approverName, 'from approval:', result.approval);
          
          // Check if already submitted
          if (result.approval.status !== 'pending') {
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
      } catch (error) {
        toast({
          title: "Error Loading Application",
          description: "Failed to load application details. Please try again.",
          variant: "destructive"
        });
        navigate('/');
      }
    };
    
    loadApplicationData();
  }, [token, navigate, toast, form]);

  const handleDownloadDocument = async () => {
    if (!application?.proposalFileName) {
      toast({
        title: "No Document",
        description: "No document has been uploaded for this application.",
        variant: "destructive"
      });
      return;
    }

    try {
      await downloadApplicationDocument(application.id, application.proposalFileName);
      toast({
        title: "Download Started",
        description: "The document download has started.",
      });
    } catch (error: any) {
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download the document.",
        variant: "destructive"
      });
    }
  };

  const onSubmit = async (data: SignOffFormData) => {
    if (!application || !approval || !token) return;

    try {
      const result = await submitSignOffApproval(token, {
        decision: data.decision,
        comments: data.comments,
        approverName: data.approverName
      });

      if (result?.success) {
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
    } catch (error) {
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
          <p className="text-gray-600">Please review the grant award details below and provide your approval decision.</p>
          {approval && (
            <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              <User className="h-4 w-4 mr-2" />
              Signing as: {getRoleTitle(approval.role)}
            </div>
          )}
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
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">{application.proposalTitle}</h3>
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Principal Investigator</h4>
                    <p className="text-sm">
                      <span className="font-medium">Name:</span> {application.applicantName}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Email:</span> {application.email}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Application Details</h4>
                    <p className="text-sm">
                      <span className="font-medium">Grant Call:</span> {application.grantId}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Status:</span> 
                      <span className="ml-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        {application.status}
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Submission Date:</span>{' '}
                      {format(new Date(application.submissionDate), 'MMM dd, yyyy')}
                    </p>
                    {application.deadline && (
                      <p className="text-sm">
                        <span className="font-medium">Deadline:</span>{' '}
                        {format(new Date(application.deadline), 'MMM dd, yyyy')}
                      </p>
                    )}
                  </div>

                  {/* Application Document */}
                  {application.proposalFileName && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h4 className="font-medium text-sm text-blue-700 mb-2">Application Document</h4>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span className="text-sm text-blue-800">{application.proposalFileName}</span>
                          {application.proposalFileSize && (
                            <span className="text-xs text-blue-600">
                              ({(application.proposalFileSize / 1024 / 1024).toFixed(1)} MB)
                            </span>
                          )}
                        </div>
                        <Button variant="outline" size="sm" onClick={handleDownloadDocument}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 text-xl font-bold text-green-700">
                    <DollarSign className="h-6 w-6" />
                    Award Amount
                  </div>
                  <div className="text-2xl font-bold text-green-800 mt-1">
                    ${application.awardAmount?.toLocaleString() || 'Not specified'}
                  </div>
                </div>

                {/* Biodata if available */}
                {application.biodata && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Principal Investigator Bio</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><span className="font-medium">Name:</span> {application.biodata.name}</p>
                      <p><span className="font-medium">Age:</span> {application.biodata.age}</p>
                      <p><span className="font-medium">Email:</span> {application.biodata.email}</p>
                      <p><span className="font-medium">First-time Applicant:</span> {application.biodata.firstTimeApplicant ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                )}

                {/* Review History */}
                {application.reviewHistory && application.reviewHistory.length > 0 && (
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <h4 className="font-medium text-sm text-yellow-700 mb-2">Review History</h4>
                    <p className="text-xs text-yellow-600">
                      {application.reviewHistory.length} review(s) completed
                    </p>
                  </div>
                )}
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
                      <FormLabel>
                        Your Full Name *
                        {approval?.approverName && (
                          <span className="text-xs text-gray-500 ml-2">(Pre-filled)</span>
                        )}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your full name" 
                          {...field} 
                          disabled={!!approval?.approverName}
                          className={approval?.approverName ? "bg-gray-100 text-gray-700" : ""}
                          readOnly={!!approval?.approverName}
                        />
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
