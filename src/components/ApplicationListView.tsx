import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Search, Filter, Eye } from 'lucide-react';
import { getStatusColor, type Application } from '../services/applicationsService';
import type { GrantCall } from '../services/grantCalls/api/types';

interface ApplicationListViewProps {
  applications: Application[];
  grantCalls: GrantCall[];
  isManager: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
  onSelectApplication: (application: Application) => void;
  onRefresh: () => void;
  loading: boolean;
}

const ApplicationListView: React.FC<ApplicationListViewProps> = ({
  applications,
  grantCalls,
  isManager,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  onSelectApplication,
  onRefresh,
  loading
}) => {
  // Create a mapping of grant call ID to grant call type
  const grantCallTypeMap = React.useMemo(() => {
    const map = new Map<string, string>();
    grantCalls.forEach(call => {
      map.set(call.id, call.type);
    });
    return map;
  }, [grantCalls]);

  // Get unique statuses for filter options
  const availableStatuses = React.useMemo(() => {
    const statuses = [...new Set(applications.map(app => app.status))];
    return statuses.sort();
  }, [applications]);

  // Filter applications
  const filteredApplications = React.useMemo(() => {
    return applications.filter(app => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        app.proposalTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.status.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;

      // Type filter (for managers)
      const grantType = grantCallTypeMap.get(app.grantId) || 'Unknown';
      const matchesType = typeFilter === 'all' || grantType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [applications, searchQuery, statusFilter, typeFilter, grantCallTypeMap]);

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setTypeFilter('all');
  };

  // Status counts for manager view
  const statusCounts = React.useMemo(() => {
    const counts = {
      total: applications.length,
      submitted: 0,
      under_review: 0,
      manager_approved: 0,
      signoff_approved: 0,
      rejected: 0,
      editable: 0,
      needs_revision: 0
    };

    applications.forEach(app => {
      if (app.status === 'submitted') counts.submitted++;
      else if (app.status === 'under_review') counts.under_review++;
      else if (app.status === 'manager_approved') counts.manager_approved++;
      else if (app.status === 'signoff_approved') counts.signoff_approved++;
      else if (app.status === 'rejected') counts.rejected++;
      else if (app.status === 'editable') counts.editable++;
      else if (app.status === 'needs_revision') counts.needs_revision++;
    });

    return counts;
  }, [applications]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isManager ? 'Application Review' : 'My Applications'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isManager ? 'Review and manage grant applications' : 'Track the status of your grant applications'}
          </p>
        </div>
        <Button 
          onClick={onRefresh}
          variant="outline"
          disabled={loading}
          className="flex items-center"
        >
          <svg className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Summary Cards (Manager only) */}
      {isManager && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{statusCounts.total}</div>
              <p className="text-sm text-gray-600">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{statusCounts.submitted}</div>
              <p className="text-sm text-gray-600">Submitted</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{statusCounts.under_review}</div>
              <p className="text-sm text-gray-600">Under Review</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{statusCounts.manager_approved}</div>
              <p className="text-sm text-gray-600">Manager Approved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-emerald-600">{statusCounts.signoff_approved}</div>
              <p className="text-sm text-gray-600">Sign-off Approved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{statusCounts.rejected}</div>
              <p className="text-sm text-gray-600">Rejected</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{statusCounts.editable}</div>
              <p className="text-sm text-gray-600">Editable</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-indigo-600">{statusCounts.needs_revision}</div>
              <p className="text-sm text-gray-600">Needs Revision</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filter Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by proposal title, applicant name, email, or status..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {availableStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replace('_', ' ').toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {isManager && (
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="ORI">ORI</SelectItem>
                    <SelectItem value="External">External</SelectItem>
                    <SelectItem value="Scholarship">Scholarship</SelectItem>
                    <SelectItem value="Travel/Conference">Travel/Conference</SelectItem>
                    <SelectItem value="GOVT">GOVT</SelectItem>
                    <SelectItem value="Fellowship">Fellowship</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {(searchQuery || statusFilter !== 'all' || typeFilter !== 'all') && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {filteredApplications.length} of {applications.length} applications
            </span>
            {(searchQuery || statusFilter !== 'all' || typeFilter !== 'all') && (
              <span className="text-blue-600">
                Filters active
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <Card>
        <CardHeader>
          <CardTitle>{isManager ? 'Applications' : 'Your Grant Applications'} ({filteredApplications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredApplications.length === 0 ? (
            <div className="text-center py-8">
              {applications.length === 0 ? (
                <p className="text-gray-500">
                  {isManager ? 'No applications found.' : 'You haven\'t submitted any applications yet.'}
                </p>
              ) : (
                <div>
                  <p className="text-gray-500 mb-2">No applications match your search criteria.</p>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proposal Title</TableHead>
                  <TableHead>Applicant</TableHead>
                  {isManager && <TableHead>Age</TableHead>}
                  {isManager && <TableHead>First-time</TableHead>}
                  {isManager && <TableHead>Document</TableHead>}
                  <TableHead>Grant Type</TableHead>
                  <TableHead>Submission Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Revisions</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((application) => (
                  <TableRow key={application.id} className="cursor-pointer hover:bg-gray-50">
                    <TableCell className="font-medium">
                      {application.proposalTitle}
                    </TableCell>
                    <TableCell>{application.applicantName}</TableCell>
                    {isManager && (
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {application.biodata?.age ? `${application.biodata.age} yrs` : 'N/A'}
                        </span>
                      </TableCell>
                    )}
                    {isManager && (
                      <TableCell>
                        {application.biodata ? (
                          <Badge variant={application.biodata.firstTimeApplicant ? 'default' : 'secondary'}>
                            {application.biodata.firstTimeApplicant ? 'Yes' : 'No'}
                          </Badge>
                        ) : (
                          <span className="text-xs text-gray-400">N/A</span>
                        )}
                      </TableCell>
                    )}
                    {isManager && (
                      <TableCell>
                        <Badge variant={application.proposalFileName ? 'default' : 'destructive'}>
                          {application.proposalFileName ? 'Yes' : 'No'}
                        </Badge>
                      </TableCell>
                    )}
                    <TableCell>
                      {grantCallTypeMap.get(application.grantId) || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(application.submissionDate), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(application.status)}>
                        {application.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {application.revisionCount && application.revisionCount > 0 ? `${application.revisionCount} revision(s)` : 'Original'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onSelectApplication(application)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplicationListView;