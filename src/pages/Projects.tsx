import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  getProjectsByUser, 
  getAllProjects,
  getStatusColor, 
  getRequisitionStatusColor,
  calculateProgress,
  checkOverdueMilestones,
  updateRequisitionStatus,
  type Project,
  type Requisition
} from '../services/projects';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import FundRequisitionForm from '../components/FundRequisitionForm';
import PartnerManagement from '../components/PartnerManagement';
import MilestoneTimeline from '../components/MilestoneTimeline';
import { format } from 'date-fns';
import { 
  DollarSign, 
  Users, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import FinalReportUpload from '../components/FinalReportUpload';
import ProjectClosureWorkflow from '../components/ProjectClosureWorkflow';

const Projects = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showRequisitionForm, setShowRequisitionForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadProjects = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        let projectData: Project[];
        if (user.role.toLowerCase() === 'researcher') {
          projectData = await getProjectsByUser(user.email);
        } else {
          projectData = await getAllProjects();
        }
        setProjects(projectData.map(checkOverdueMilestones));
      } catch (error) {
        console.error('Error loading projects:', error);
        toast({
          title: "Error",
          description: "Failed to load projects. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [user, refreshKey]);
  
  if (!user) {
    return (
      <div className="max-w-7xl">
        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
        <p className="text-gray-600 mt-4">Please log in to view your projects.</p>
      </div>
    );
  }

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleRequisitionSuccess = () => {
    handleRefresh();
    toast({
      title: "Success",
      description: "Requisition submitted successfully!",
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl">
        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
        <p className="text-gray-600 mt-4">Loading projects...</p>
      </div>
    );
  }

  // For researchers, show their projects
  if (user.role.toLowerCase() === 'researcher') {
    const userProjects = projects;
    
    return (
      <div className="max-w-7xl" key={refreshKey}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
          <p className="text-gray-600 mt-2">Track progress and manage funding for your approved grant projects</p>
        </div>

        {userProjects.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">You don't have any active projects yet.</p>
              <p className="text-gray-400 text-sm mt-2">Projects are created when your grant applications are approved.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {userProjects.map((project) => {
              const progress = calculateProgress(project.milestones);
              const overdueMilestones = project.milestones.filter(m => m.is_overdue).length;
              const pendingRequisitions = (project.requisitions || []).filter(r => r.status === 'submitted').length;
              
              return (
                <Card key={project.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{project.title}</CardTitle>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge className={getStatusColor(project.status)}>
                            {project.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <p className="text-xs text-gray-500">Start: {format(new Date(project.start_date), 'MMM dd, yyyy')}</p>
                          <p className="text-xs text-gray-500">End: {format(new Date(project.end_date), 'MMM dd, yyyy')}</p>
                          {overdueMilestones > 0 && (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              {overdueMilestones} Overdue
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{progress}%</div>
                        <div className="text-sm text-gray-500">Complete</div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                        <span className="text-sm text-gray-500">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    {/* Quick actions */}
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedProject(project);
                          setShowRequisitionForm(true);
                        }}
                        className="flex items-center gap-2"
                      >
                        <DollarSign className="h-4 w-4" />
                        Request Funds
                      </Button>
                      {pendingRequisitions > 0 && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {pendingRequisitions} Pending Request{pendingRequisitions > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <Tabs defaultValue="timeline" className="w-full">
                      <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="timeline">Timeline</TabsTrigger>
                        <TabsTrigger value="funding">Funding</TabsTrigger>
                        <TabsTrigger value="partners">Partners</TabsTrigger>
                        <TabsTrigger value="reports">Final Reports</TabsTrigger>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                      </TabsList>

                      <TabsContent value="timeline" className="mt-4">
                        <MilestoneTimeline project={project} onUpdate={handleRefresh} />
                      </TabsContent>

                      <TabsContent value="funding" className="mt-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <DollarSign className="h-5 w-5" />
                              Fund Requisitions
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {(project.requisitions || []).length === 0 ? (
                              <p className="text-gray-500 text-sm">No fund requisitions submitted yet.</p>
                            ) : (
                              <div className="space-y-3">
                                {project.requisitions!.map((requisition) => {
                                  const milestone = project.milestones.find(m => m.id === requisition.milestone_id);
                                  return (
                                    <div key={requisition.id} className="border rounded-lg p-4">
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium">${requisition.amount.toLocaleString()}</span>
                                            <Badge className={getRequisitionStatusColor(requisition.status)}>
                                              {requisition.status.toUpperCase()}
                                            </Badge>
                                          </div>
                                          <p className="text-sm text-gray-600 mb-1">
                                            Milestone: {milestone?.title || 'Unknown'}
                                          </p>
                                          <p className="text-sm text-gray-700">{requisition.notes}</p>
                                          {requisition.review_notes && (
                                            <div className="mt-2 p-2 bg-gray-50 rounded">
                                              <p className="text-xs font-medium text-gray-700">Review Notes:</p>
                                              <p className="text-xs text-gray-600">{requisition.review_notes}</p>
                                            </div>
                                          )}
                                        </div>
                                        <div className="text-right text-xs text-gray-500">
                                          <p>Requested: {format(new Date(requisition.requested_date), 'MMM dd, yyyy')}</p>
                                          {requisition.reviewed_date && (
                                            <p>Reviewed: {format(new Date(requisition.reviewed_date), 'MMM dd, yyyy')}</p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="partners" className="mt-4">
                        <PartnerManagement project={project} onUpdate={handleRefresh} />
                      </TabsContent>

                      <TabsContent value="reports" className="mt-4">
                        <div className="space-y-6">
                          <FinalReportUpload project={project} onUpdate={handleRefresh} />
                          <ProjectClosureWorkflow 
                            project={project} 
                            userRole={user.role}
                            userEmail={user.email}
                            onUpdate={handleRefresh} 
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="overview" className="mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-blue-500" />
                                <div>
                                  <p className="text-sm font-medium">Milestones</p>
                                  <p className="text-2xl font-bold">
                                    {project.milestones.filter(m => m.status === 'completed').length}/{project.milestones.length}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-green-500" />
                                <div>
                                  <p className="text-sm font-medium">Partners</p>
                                  <p className="text-2xl font-bold">{(project.partners || []).length}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-purple-500" />
                                <div>
                                  <p className="text-sm font-medium">Funding Requests</p>
                                  <p className="text-2xl font-bold">{(project.requisitions || []).length}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {selectedProject && (
          <FundRequisitionForm
            project={selectedProject}
            isOpen={showRequisitionForm}
            onClose={() => {
              setShowRequisitionForm(false);
              setSelectedProject(null);
            }}
            onSuccess={handleRequisitionSuccess}
          />
        )}
      </div>
    );
  }

  // For grants managers, show all projects with requisition management
  if (user.role.toLowerCase() === 'grants manager') {
    const allProjects = projects;
    const pendingRequisitions = allProjects.flatMap(p => 
      (p.requisitions || []).filter(r => r.status === 'submitted').map(r => ({ ...r, projectTitle: p.title, projectId: p.id }))
    );

    const handleRequisitionReview = async (projectId: string, requisitionId: string, status: 'approved' | 'rejected', notes: string) => {
      try {
        await updateRequisitionStatus(projectId, requisitionId, status, notes, user.email);
        
        // If we reach here, the update was successful
        toast({
          title: "Requisition Updated",
          description: `Requisition has been ${status}.`,
        });
        handleRefresh();
      } catch (error) {
        toast({
          title: "Update Failed",
          description: "Failed to update requisition status.",
          variant: "destructive"
        });
      }
    };

    return (
      <div className="max-w-7xl" key={refreshKey}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
          <p className="text-gray-600 mt-2">Review project progress and manage fund requisitions</p>
        </div>

        {pendingRequisitions.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <Clock className="h-5 w-5" />
                Pending Fund Requisitions ({pendingRequisitions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingRequisitions.map((req) => (
                  <div key={req.id} className="border rounded-lg p-4 bg-orange-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">${req.amount.toLocaleString()}</span>
                          <span className="text-sm text-gray-600">• {req.projectTitle}</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{req.notes}</p>
                        <p className="text-xs text-gray-500">Requested: {format(new Date(req.requested_date), 'MMM dd, yyyy')}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRequisitionReview(req.projectId, req.id, 'approved', 'Approved by grants manager')}
                          className="text-green-700 hover:text-green-800"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRequisitionReview(req.projectId, req.id, 'rejected', 'Rejected - insufficient justification')}
                          className="text-red-700 hover:text-red-800"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {allProjects.map((project) => {
            const progress = calculateProgress(project.milestones);
            const overdueMilestones = project.milestones.filter(m => m.is_overdue).length;
            
            return (
              <Card key={project.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{project.title}</CardTitle>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge className={getStatusColor(project.status)}>
                          {project.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        {overdueMilestones > 0 && (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {overdueMilestones} Overdue Milestone{overdueMilestones > 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{progress}%</div>
                      <div className="text-sm text-gray-500">Complete</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="reports">Final Reports</TabsTrigger>
                      <TabsTrigger value="closure">Closure</TabsTrigger>
                      <TabsTrigger value="details">Details</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-4">
                      <Progress value={progress} className="h-2 mb-4" />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Milestones:</span> {project.milestones.filter(m => m.status === 'completed').length}/{project.milestones.length}
                        </div>
                        <div>
                          <span className="font-medium">Partners:</span> {(project.partners || []).length}
                        </div>
                        <div>
                          <span className="font-medium">Fund Requests:</span> {(project.requisitions || []).length}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="reports" className="mt-4">
                      <FinalReportUpload project={project} onUpdate={handleRefresh} />
                    </TabsContent>

                    <TabsContent value="closure" className="mt-4">
                      <ProjectClosureWorkflow 
                        project={project} 
                        userRole={user.role}
                        userEmail={user.email}
                        onUpdate={handleRefresh} 
                      />
                    </TabsContent>

                    <TabsContent value="details" className="mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Milestones:</span> {project.milestones.filter(m => m.status === 'completed').length}/{project.milestones.length}
                        </div>
                        <div>
                          <span className="font-medium">Partners:</span> {(project.partners || []).length}
                        </div>
                        <div>
                          <span className="font-medium">Fund Requests:</span> {(project.requisitions || []).length}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // For other roles (admin), show basic view
  return (
    <div className="max-w-7xl">
      <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
      <p className="text-gray-600 mt-2">Project management features will be available here.</p>
    </div>
  );
};

export default Projects;
