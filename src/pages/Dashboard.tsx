
import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getOpenCalls, getAllCalls } from '../services/grantCalls';
import { getAllApplications } from '../services/applicationsService';
import { getAllProjects } from '../services/projects';
import { Calendar, Building, Tag, AlertTriangle, Users, FileText, Award, Clock, CheckCircle, DollarSign, Search, Filter } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sponsorFilter, setSponsorFilter] = useState<string>('all');
  const isResearcher = user?.role.toLowerCase() === 'researcher';
  const isGrantsManager = user?.role.toLowerCase() === 'grants manager';

  // State for async data
  const [allCalls, setAllCalls] = useState<any[]>([]);
  const [allApplications, setAllApplications] = useState<any[]>([]);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [calls, applications, projects] = await Promise.all([
          getAllCalls(),
          getAllApplications(),
          getAllProjects()
        ]);
        setAllCalls(calls);
        setAllApplications(applications);
        setAllProjects(projects);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setAllCalls([]);
        setAllApplications([]);
        setAllProjects([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Grants Manager Dashboard Logic
  if (isGrantsManager) {
    // Calculate metrics
    const totalCalls = allCalls.length;
    const receivedApplications = allApplications.length;
    const pendingReviews = allApplications.filter(app => 
      app.status === 'submitted' || app.status === 'under_review'
    ).length;
    const issuedAwards = allApplications.filter(app => 
      app.status === 'approved' || app.status === 'signoff_complete' || app.status === 'contract_received'
    ).length;

    // Calculate alerts
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const upcomingDeadlines = allCalls.filter(call => {
      const deadline = new Date(call.deadline);
      return call.status === 'Open' && deadline <= sevenDaysFromNow && deadline > now;
    });

    const pendingContracts = allApplications.filter(app => 
      app.status === 'contract_pending'
    );

    const overdueReports = allProjects.filter(project => {
      const hasOverdueMilestones = project.milestones.some(milestone => {
        const dueDate = new Date(milestone.dueDate);
        return now > dueDate && 
               milestone.status !== 'completed' && 
               !milestone.progressReportUploaded;
      });
      return hasOverdueMilestones;
    });

    if (loading) {
      return (
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Grants Manager Dashboard</h1>
          <p className="text-gray-600">Overview of grant management activities and alerts</p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/call-management')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Posted Calls</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCalls}</div>
              <p className="text-xs text-muted-foreground">
                {allCalls.filter(c => c.status === 'Open').length} currently open
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/applications')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Received Applications</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{receivedApplications}</div>
              <p className="text-xs text-muted-foreground">
                All time submissions
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/applications')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingReviews}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting review action
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/applications')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Issued Awards</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{issuedAwards}</div>
              <p className="text-xs text-muted-foreground">
                Approved applications
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Alerts Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Alerts & Notifications
            </CardTitle>
            <CardDescription>
              Important items requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Upcoming Deadlines */}
            {upcomingDeadlines.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-orange-700 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Upcoming Call Deadlines ({upcomingDeadlines.length})
                </h4>
                <div className="space-y-1">
                  {upcomingDeadlines.map(call => (
                    <div key={call.id} className="flex items-center justify-between p-2 bg-orange-50 rounded border-l-4 border-orange-200">
                      <div>
                        <p className="font-medium text-sm">{call.title}</p>
                        <p className="text-xs text-gray-600">{call.sponsor}</p>
                      </div>
                      <Badge variant="outline" className="text-orange-700">
                        {new Date(call.deadline).toLocaleDateString()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pending Contracts */}
            {pendingContracts.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-blue-700 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Pending Contract Uploads ({pendingContracts.length})
                </h4>
                <div className="space-y-1">
                  {pendingContracts.map(app => (
                    <div key={app.id} className="flex items-center justify-between p-2 bg-blue-50 rounded border-l-4 border-blue-200">
                      <div>
                        <p className="font-medium text-sm">{app.proposalTitle}</p>
                        <p className="text-xs text-gray-600">{app.applicantName}</p>
                      </div>
                      <Badge variant="outline" className="text-blue-700">
                        Contract Pending
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Overdue Reports */}
            {overdueReports.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-red-700 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Overdue Project Reports ({overdueReports.length})
                </h4>
                <div className="space-y-1">
                  {overdueReports.map(project => (
                    <div key={project.id} className="flex items-center justify-between p-2 bg-red-50 rounded border-l-4 border-red-200">
                      <div>
                        <p className="font-medium text-sm">{project.title}</p>
                        <p className="text-xs text-gray-600">
                          {project.milestones.filter(m => {
                            const dueDate = new Date(m.dueDate);
                            return now > dueDate && m.status !== 'completed' && !m.progressReportUploaded;
                          }).length} overdue milestone{project.milestones.filter(m => {
                            const dueDate = new Date(m.dueDate);
                            return now > dueDate && m.status !== 'completed' && !m.progressReportUploaded;
                          }).length > 1 ? 's' : ''}
                        </p>
                      </div>
                      <Badge variant="destructive">
                        Overdue
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Alerts Message */}
            {upcomingDeadlines.length === 0 && pendingContracts.length === 0 && overdueReports.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <p className="text-gray-500">No alerts at this time</p>
                <p className="text-sm text-gray-400">All systems are running smoothly</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Researcher Dashboard with search and filter
  if (isResearcher) {
    // Filter to only open calls for researchers
    const openCalls = (allCalls || []).filter(call => call.status === 'Open');

    // Get unique types and sponsors for filter options
    const availableTypes = useMemo(() => {
      const types = [...new Set(openCalls.map(call => call.type))];
      return types.sort();
    }, [openCalls]);

    const availableSponsors = useMemo(() => {
      const sponsors = [...new Set(openCalls.map(call => call.sponsor))];
      return sponsors.sort();
    }, [openCalls]);

    // Filter and search grant calls
    const filteredCalls = useMemo(() => {
      return openCalls.filter(call => {
        // Search filter
        const matchesSearch = searchQuery === '' || 
          call.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          call.scope.toLowerCase().includes(searchQuery.toLowerCase()) ||
          call.sponsor.toLowerCase().includes(searchQuery.toLowerCase()) ||
          call.type.toLowerCase().includes(searchQuery.toLowerCase());

        // Type filter
        const matchesType = typeFilter === 'all' || call.type === typeFilter;

        // Sponsor filter
        const matchesSponsor = sponsorFilter === 'all' || call.sponsor === sponsorFilter;

        return matchesSearch && matchesType && matchesSponsor;
      });
    }, [openCalls, searchQuery, typeFilter, sponsorFilter]);

    const handleViewDetails = (callId: string) => {
      navigate(`/grant-call/${callId}`);
    };

    const clearFilters = () => {
      setSearchQuery('');
      setTypeFilter('all');
      setSponsorFilter('all');
    };

    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Grant Calls</h1>
          <p className="text-gray-600">Discover funding opportunities for your research projects</p>
        </div>

        {/* Search and Filter Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by title, scope, sponsor, or type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-3">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {availableTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sponsorFilter} onValueChange={setSponsorFilter}>
                  <SelectTrigger className="w-48">
                    <Building className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Sponsors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sponsors</SelectItem>
                    {availableSponsors.map((sponsor) => (
                      <SelectItem key={sponsor} value={sponsor}>
                        {sponsor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {(searchQuery || typeFilter !== 'all' || sponsorFilter !== 'all') && (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>

            {/* Results Summary */}
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <span>
                Showing {filteredCalls.length} of {openCalls.length} grant calls
              </span>
              {(searchQuery || typeFilter !== 'all' || sponsorFilter !== 'all') && (
                <span className="text-blue-600">
                  Filters active
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Grant Calls Grid */}
        {filteredCalls.length === 0 ? (
          <div className="text-center py-12">
            {openCalls.length === 0 ? (
              <p className="text-gray-500 text-lg">No open grant calls available at the moment.</p>
            ) : (
              <div>
                <p className="text-gray-500 text-lg mb-2">No grant calls match your search criteria.</p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCalls.map((call) => (
              <Card key={call.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-semibold leading-tight">
                      {call.title}
                    </CardTitle>
                    <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      {call.status}
                    </div>
                  </div>
                  <CardDescription className="text-sm text-gray-600 mt-2">
                    {call.scope.length > 100 ? `${call.scope.substring(0, 100)}...` : call.scope}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Tag className="h-4 w-4" />
                    <span className="font-medium">{call.type}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building className="h-4 w-4" />
                    <span>{call.sponsor}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Deadline: {new Date(call.deadline).toLocaleDateString()}</span>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleViewDetails(call.id)}
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Default dashboard for other roles
  return (
    <div className="max-w-7xl">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
    </div>
  );
};

export default Dashboard;
