
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getCallById } from '../services/grantCalls';
import { ArrowLeft, Calendar, Building, Tag, Users, FileText, Target } from 'lucide-react';

const GrantCallDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [grantCall, setGrantCall] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGrantCall = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const call = await getCallById(id);
        setGrantCall(call);
      } catch (error) {
        console.error('Error loading grant call:', error);
        setGrantCall(null);
      } finally {
        setLoading(false);
      }
    };
    
    loadGrantCall();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading grant call details...</div>
      </div>
    );
  }

  if (!grantCall) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Grant Call Not Found</h1>
          <p className="text-gray-600 mb-6">The requested grant call could not be found.</p>
          <Button onClick={() => navigate('/dashboard')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleApplyNow = () => {
    navigate(`/grant-call/${id}/apply`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button onClick={handleBackToDashboard} variant="outline" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{grantCall.title}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {grantCall.status}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span className="font-semibold text-red-600">
                  Deadline: {new Date(grantCall.deadline).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Scope & Objectives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{grantCall.scope}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Eligibility Criteria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{grantCall.eligibility}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{grantCall.requirements}</p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Grant Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Tag className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-medium">{grantCall.type}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Building className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Sponsor</p>
                  <p className="font-medium">{grantCall.sponsor}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Application Deadline</p>
                  <p className="font-medium text-red-600">
                    {new Date(grantCall.deadline).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Button 
                className="w-full" 
                size="lg" 
                onClick={handleApplyNow}
                disabled={grantCall.status !== 'Open'}
              >
                Apply Now
              </Button>
              {grantCall.status !== 'Open' && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  This grant call is currently closed
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GrantCallDetails;
