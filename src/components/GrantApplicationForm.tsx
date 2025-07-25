
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
import { saveBiodata, getBiodata, type ResearcherBiodata } from '../services/applicationsService';
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
}

const GrantApplicationForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
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

  const onSubmit = (data: ApplicationFormData) => {
    // Save biodata for future use
    saveBiodataData();
    
    console.log('Application submitted:', data);
    
    // Clear draft from localStorage after successful submission
    if (id) {
      const draftKey = `grant-application-draft-${id}`;
      localStorage.removeItem(draftKey);
    }
    
    toast({
      title: "Application Submitted",
      description: "Your grant application has been successfully submitted!",
    });
    
    // Navigate back to grant details after submission
    setTimeout(() => {
      navigate(`/grant-call/${id}`);
    }, 2000);
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
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Submit Application
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default GrantApplicationForm;
