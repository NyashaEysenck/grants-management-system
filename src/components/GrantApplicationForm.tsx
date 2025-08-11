
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, Send, Upload, User } from 'lucide-react';
import { getCallById } from '../services/grantCallsService';
import { saveBiodata, getBiodata, submitApplication, type ResearcherBiodata } from '../services/applicationsService';
import { documentsService } from '../services/documentsService';
import { useToast } from '@/hooks/use-toast';

interface ApplicationFormData {
  // Biodata fields
  name: string;
  age: number;
  email: string;
  firstTimeApplicant: boolean;
  // Application fields
  grantType: string;
  proposalTitle: string;
  proposalFile: string;
  // Additional application fields
  institution?: string;
  department?: string;
  projectSummary?: string;
  objectives?: string;
  methodology?: string;
  expectedOutcomes?: string;
  budgetAmount?: number;
  budgetJustification?: string;
  timeline?: string;
}

const GrantApplicationForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const grantCall = id ? getCallById(id) : null;
  
  const form = useForm<ApplicationFormData>({
    defaultValues: {
      name: '',
      age: 0,
      email: '',
      firstTimeApplicant: false,
      grantType: grantCall?.type || '',
      proposalTitle: '',
      proposalFile: '',
    },
  });

  // Load draft from localStorage on component mount
  useEffect(() => {
    if (id) {
      const draftKey = `grant-application-draft-${id}`;
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        try {
          const draftData = JSON.parse(savedDraft);
          form.reset(draftData);
        } catch (error) {
          console.error('Error loading draft:', error);
        }
      }
    }
  }, [id, form]);

  // Load biodata when email changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'email' && value.email && value.email.includes('@')) {
        const biodata = getBiodata(value.email);
        if (biodata) {
          form.setValue('name', biodata.name);
          form.setValue('age', biodata.age);
          form.setValue('firstTimeApplicant', biodata.firstTimeApplicant);
          
          toast({
            title: "Biodata Loaded",
            description: "Your researcher information has been automatically filled.",
          });
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form, toast]);

  // Update grant type when grantCall changes
  useEffect(() => {
    if (grantCall) {
      form.setValue('grantType', grantCall.type);
    }
  }, [grantCall, form]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      form.setValue('proposalFile', file.name);
    }
  };

  const saveDraft = () => {
    if (!id) return;
    
    const formData = form.getValues();
    const draftKey = `grant-application-draft-${id}`;
    localStorage.setItem(draftKey, JSON.stringify(formData));
    
    toast({
      title: "Draft Saved",
      description: "Your application has been saved as a draft.",
    });
  };

  const saveBiodataData = () => {
    const formData = form.getValues();
    if (formData.email) {
      const biodata: ResearcherBiodata = {
        name: formData.name,
        age: formData.age,
        email: formData.email,
        firstTimeApplicant: formData.firstTimeApplicant,
      };
      saveBiodata(formData.email, biodata);
    }
  };

  const onSubmit = async (data: ApplicationFormData) => {
    console.log('Form submission started with data:', data);
    setIsSubmitting(true);
    
    // Validate required fields
    if (!data.name?.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter your full name.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (!data.email?.trim()) {
      toast({
        title: "Validation Error", 
        description: "Please enter your email address.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (!data.proposalTitle?.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a proposal title.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (!selectedFile) {
      toast({
        title: "Document Required",
        description: "Please select a proposal document to upload.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (!id || !grantCall) {
      toast({
        title: "System Error",
        description: "Grant call information is missing. Please try refreshing the page.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Show loading toast
    toast({
      title: "Submitting Application",
      description: "Please wait while we process your application...",
    });

    try {
      console.log('Starting application submission process...');
      
      // Save biodata for future use
      saveBiodataData();
      
      // Step 1: Upload the document first
      console.log('Uploading document...');
      let uploadResult;
      try {
        uploadResult = await documentsService.uploadDocument(
          data.proposalTitle || 'Grant Application Document',
          'Applications',
          selectedFile,
          `Grant application for ${grantCall.title}`
        );
        console.log('Document uploaded successfully:', uploadResult);
      } catch (uploadError) {
        console.error('Document upload failed:', uploadError);
        throw new Error(`Document upload failed: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
      }
      
      // Step 2: Submit the complete application to backend
      console.log('Submitting application data...');
      const applicationData = {
        grantId: id,
        applicantName: data.name,
        email: data.email,
        proposalTitle: data.proposalTitle,
        institution: data.institution || 'Not specified',
        department: data.department || 'Not specified',
        projectSummary: data.projectSummary || grantCall.scope,
        objectives: data.objectives || `Research objectives for ${data.proposalTitle}`,
        methodology: data.methodology || 'Research methodology to be detailed',
        expectedOutcomes: data.expectedOutcomes || 'Expected research outcomes',
        budgetAmount: parseFloat(data.budgetAmount?.toString() || '0'),
        budgetJustification: data.budgetJustification || 'Budget justification to be provided',
        timeline: data.timeline || '12 months',
        biodata: {
          name: data.name,
          age: data.age,
          email: data.email,
          firstTimeApplicant: data.firstTimeApplicant
        },
        proposalFileName: uploadResult.filename
      };

      let submittedApplication;
      try {
        submittedApplication = await submitApplication(applicationData);
        console.log('Application submitted successfully:', {
          applicationId: submittedApplication.id,
          documentId: uploadResult.id,
          documentFilename: uploadResult.filename
        });
      } catch (submissionError) {
        console.error('Application submission failed:', submissionError);
        throw new Error(`Application submission failed: ${submissionError instanceof Error ? submissionError.message : 'Unknown error'}`);
      }
      
      // Success feedback
      toast({
        title: "✅ Application Submitted Successfully!",
        description: `Your application "${data.proposalTitle}" has been submitted and is now under review.`,
      });
      
      // Clear draft after successful submission
      if (id) {
        const draftKey = `grant-application-draft-${id}`;
        localStorage.removeItem(draftKey);
        console.log('Draft cleared from localStorage');
      }
      
      // Navigate to applications page after a short delay to let user see the success message
      setTimeout(() => {
        navigate('/applications');
      }, 2000);
      
    } catch (error) {
      console.error('Error during application submission process:', error);
      
      // Provide specific error messages based on error type
      let errorMessage = "Failed to submit application. Please try again.";
      let errorTitle = "Submission Failed";
      
      if (error instanceof Error) {
        if (error.message.includes('Document upload failed')) {
          errorTitle = "Document Upload Failed";
          errorMessage = error.message + " Please check your file and try again.";
        } else if (error.message.includes('Application submission failed')) {
          errorTitle = "Application Submission Failed";
          errorMessage = error.message + " Please check your connection and try again.";
        } else if (error.message.includes('Network')) {
          errorTitle = "Network Error";
          errorMessage = "Unable to connect to the server. Please check your internet connection and try again.";
        } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
          errorTitle = "Permission Error";
          errorMessage = "You don't have permission to submit this application. Please check your login status.";
        } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          errorTitle = "Authentication Error";
          errorMessage = "Your session has expired. Please log in again and try submitting.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(`/grant-call/${id}`);
  };

  if (!grantCall) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Grant Call Not Found</h1>
          <p className="text-gray-600 mb-6">Cannot create application for unknown grant call.</p>
          <Button onClick={() => navigate('/dashboard')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button onClick={handleBack} variant="outline" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Grant Details
        </Button>
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Grant Application</h1>
          <p className="text-lg text-gray-600">{grantCall.title}</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Researcher Biodata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Researcher Biodata
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="email"
                  rules={{ 
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter your email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  rules={{ required: "Name is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="age"
                  rules={{ 
                    required: "Age is required",
                    min: { value: 18, message: "Must be at least 18 years old" },
                    max: { value: 100, message: "Please enter a valid age" }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Enter your age" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="firstTimeApplicant"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">First-time Applicant</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Is this your first grant application?
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Application Details */}
          <Card>
            <CardHeader>
              <CardTitle>Application Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="grantType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grant Type</FormLabel>
                    <FormControl>
                      <Input {...field} disabled className="bg-gray-50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="proposalTitle"
                rules={{ required: "Proposal title is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proposal Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your proposal title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Label htmlFor="proposalFile">Proposal Document *</Label>
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
                {form.formState.errors.proposalFile && (
                  <p className="text-sm text-red-600">Proposal document is required</p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={saveDraft}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save as Draft
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Application
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default GrantApplicationForm;
