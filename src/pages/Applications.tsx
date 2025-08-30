import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  getAllApplications, 
  getUserApplications,
  getApplication,
  type Application 
} from '../services/applicationsService';
import { getAllCalls } from '../services/grantCalls';
import type { GrantCall } from '../services/grantCalls/api/types';
import { useToast } from '@/hooks/use-toast';
import ApplicationListView from '../components/ApplicationListView';
import ApplicationDetailView from '../components/ApplicationDetailView';

const Applications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [grantCalls, setGrantCalls] = useState<GrantCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  if (!user) {
    return (
      <div className="max-w-7xl">
        <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
        <p className="text-gray-600 mt-4">Please log in to view applications.</p>
      </div>
    );
  }

  const isManager = user.role.toLowerCase() === 'grants manager';

  const loadApplications = async (showToast = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const [apps, calls] = await Promise.all([
        isManager ? getAllApplications() : getUserApplications(),
        getAllCalls()
      ]);
      
      setApplications(apps);
      setGrantCalls(calls);
      
      if (showToast) {
        toast({
          title: "Applications Refreshed",
          description: `Successfully loaded ${apps.length} applications.`,
        });
      }
    } catch (error: any) {
      console.error('Error loading applications:', error);
      setError(error.message || 'Failed to load applications');
      setApplications([]);
      setGrantCalls([]);
      
      toast({
        title: "Failed to Load Applications",
        description: error.message || 'Unable to connect to the server. Please try again.',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [user.email, isManager]);

  const handleSelectApplication = async (application: Application) => {
    try {
      // Fetch full application details
      const fullApp = await getApplication(application.id);
      setSelectedApplication(fullApp);
    } catch (error: any) {
      toast({
        title: "Unable to Load Application",
        description: error.message || 'Cannot load application details from server. Please try again.',
        variant: "destructive"
      });
    }
  };

  const handleBackToList = () => {
    setSelectedApplication(null);
  };

  const handleUpdate = () => {
    loadApplications();
    // If we're viewing a specific application, refresh its details
    if (selectedApplication) {
      handleSelectApplication(selectedApplication);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Applications</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
          <div className="space-x-4">
            <button 
              onClick={() => loadApplications(true)} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Retry
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl space-y-6">
      {selectedApplication ? (
        <ApplicationDetailView
          application={selectedApplication}
          grantCalls={grantCalls}
          isManager={isManager}
          userRole={user.role}
          onBack={handleBackToList}
          onUpdate={handleUpdate}
        />
      ) : (
        <ApplicationListView
          applications={applications}
          grantCalls={grantCalls}
          isManager={isManager}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          onSelectApplication={handleSelectApplication}
          onRefresh={() => loadApplications(true)}
          loading={loading}
        />
      )}
    </div>
  );
};

export default Applications;