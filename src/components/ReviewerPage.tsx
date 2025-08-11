
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { FileText, Upload, CheckCircle, Download } from 'lucide-react';
import { getApplicationByReviewToken, submitReviewerFeedback, type Application } from '../services/applicationsService';
import { downloadApplicationDocument } from '../services/documentsService';
import { useToast } from '@/hooks/use-toast';

interface ReviewFormData {
  reviewerName: string;
  reviewerEmail: string;
  comments: string;
  decision: 'approve' | 'reject' | 'request_changes';
  annotatedFile: File | null;
}

const ReviewerPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [application, setApplication] = useState<Application | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<ReviewFormData>({
    defaultValues: {
      reviewerName: '',
      reviewerEmail: '',
      comments: '',
      decision: 'approve',
      annotatedFile: null,
    },
  });

  useEffect(() => {
    if (token) {
      const app = getApplicationByReviewToken(token);
      if (app) {
        setApplication(app);
      } else {
        toast({
          title: "Invalid Review Link",
          description: "This review link is not valid or has expired.",
          variant: "destructive"
        });
        navigate('/');
      }
    }
  }, [token, navigate, toast]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      form.setValue('annotatedFile', file);
    }
  };

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

  const onSubmit = async (data: ReviewFormData) => {
    if (!application || !token) return;

    const success = submitReviewerFeedback({
      applicationId: application.id,
      reviewerEmail: data.reviewerEmail,
      reviewerName: data.reviewerName,
      comments: data.comments,
      decision: data.decision,
      annotatedFileName: selectedFile?.name,
      reviewToken: token,
    });

    if (success) {
      setIsSubmitted(true);
      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback. Your review has been submitted successfully.",
      });
    } else {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your review. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (!application) {
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

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Submitted</h2>
            <p className="text-gray-600">
              Thank you for your feedback. Your review has been submitted successfully.
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Grant Application Review</h1>
          <p className="text-gray-600">Please review the application and provide your feedback.</p>
        </div>

        {/* Application Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Application Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-lg">{application.proposalTitle}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Applicant:</span> {application.applicantName}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Email:</span> {application.email}
                </p>
                {application.biodata && (
                  <>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Age:</span> {application.biodata.age} years old
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">First-time Applicant:</span>{' '}
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        application.biodata.firstTimeApplicant 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {application.biodata.firstTimeApplicant ? 'Yes' : 'No'}
                      </span>
                    </p>
                  </>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Submission Date:</span>{' '}
                  {format(new Date(application.submissionDate), 'MMM dd, yyyy')}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Grant ID:</span> {application.grantId}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Document Uploaded:</span>{' '}
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    application.proposalFileName 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {application.proposalFileName ? 'Yes' : 'No'}
                  </span>
                </p>
                {application.proposalFileName && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">File Name:</span> {application.proposalFileName}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleDownloadDocument}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      View Document
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Review Form */}
        <Card>
          <CardHeader>
            <CardTitle>Review Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="reviewerName"
                    rules={{ required: "Name is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reviewerEmail"
                    rules={{ 
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address"
                      }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter your email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="decision"
                  rules={{ required: "Decision is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Review Decision *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your decision" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="approve">Approve</SelectItem>
                          <SelectItem value="reject">Reject</SelectItem>
                          <SelectItem value="request_changes">Request Changes</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="comments"
                  rules={{ required: "Comments are required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Review Comments *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Provide detailed feedback on the application..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <Label htmlFor="annotatedFile">Annotated File (Optional)</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="annotatedFile"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <Upload className="h-5 w-5 text-gray-400" />
                  </div>
                  {selectedFile && (
                    <p className="text-sm text-gray-600">Selected: {selectedFile.name}</p>
                  )}
                </div>

                <div className="flex justify-end pt-6">
                  <Button type="submit" size="lg">
                    Submit Review
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

export default ReviewerPage;
