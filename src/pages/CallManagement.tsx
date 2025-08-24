import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/use-toast';
import { Plus, Edit, Trash2, Eye, Calendar, Building, Users, FileText, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getAllCalls, createCall, updateCall, deleteCall, toggleCallStatus } from '../services/grantCalls';
import type { GrantCall } from '../services/grantCalls/api/types';
import { GRANT_TYPE_OPTIONS } from '../constants/grantTypes';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const callFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: z.string().min(1, 'Type is required'),
  sponsor: z.string().min(1, 'Sponsor is required'),
  deadline: z.string().min(1, 'Deadline is required'),
  scope: z.string().min(1, 'Scope is required'),
  eligibility: z.string().min(1, 'Eligibility is required'),
  requirements: z.string().min(1, 'Requirements are required'),
});

type CallFormData = z.infer<typeof callFormSchema>;

const CallManagement = () => {
  const [calls, setCalls] = useState<GrantCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCall, setEditingCall] = useState<GrantCall | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const loadCalls = async () => {
      try {
        setLoading(true);
        const callsData = await getAllCalls();
        setCalls(callsData);
      } catch (error) {
        console.error('Error loading calls:', error);
        setCalls([]);
      } finally {
        setLoading(false);
      }
    };
    loadCalls();
  }, []);

  const form = useForm<CallFormData>({
    resolver: zodResolver(callFormSchema),
    defaultValues: {
      title: '',
      type: '',
      sponsor: '',
      deadline: '',
      scope: '',
      eligibility: '',
      requirements: '',
    },
  });

  const handleCreateCall = async (data: CallFormData) => {
    try {
      const newCall = await createCall({
        title: data.title,
        type: data.type,
        sponsor: data.sponsor,
        deadline: data.deadline,
        scope: data.scope,
        eligibility: data.eligibility,
        requirements: data.requirements,
        status: 'Open',
        visibility: 'Public',
      });

      if (newCall) {
        setCalls(prev => [...prev, newCall]);
        setIsCreateDialogOpen(false);
        form.reset();
        toast({
          title: 'Success',
          description: 'Grant call created successfully',
        });
      }
    } catch (error) {
      console.error('Error creating call:', error);
      toast({
        title: 'Error',
        description: 'Failed to create grant call',
        variant: 'destructive',
      });
    }
  };

  const handleEditCall = async (data: CallFormData) => {
    if (!editingCall) return;

    try {
      const updatedCall = await updateCall(editingCall.id, {
        title: data.title,
        type: data.type,
        sponsor: data.sponsor,
        deadline: new Date(data.deadline).toISOString(),
        scope: data.scope,
        eligibility: data.eligibility,
        requirements: data.requirements,
      });

      if (updatedCall) {
        const updatedCalls = await getAllCalls();
        setCalls(updatedCalls);
        setEditingCall(null);
        form.reset();
        toast({
          title: 'Success',
          description: 'Grant call updated successfully',
        });
      }
    } catch (error) {
      console.error('Error updating call:', error);
      toast({
        title: 'Error',
        description: 'Failed to update grant call',
        variant: 'destructive',
      });
    }
  };

  const handleToggleCallStatus = async (callId: string) => {
    try {
      const success = await toggleCallStatus(callId);
      if (success) {
        const updatedCalls = await getAllCalls();
        setCalls(updatedCalls);
        toast({
          title: 'Success',
          description: 'Call status updated successfully',
        });
      }
    } catch (error) {
      console.error('Error toggling call status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update call status',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (call: GrantCall) => {
    setEditingCall(call);
    form.reset({
      title: call.title,
      type: call.type,
      sponsor: call.sponsor,
      deadline: call.deadline ? new Date(call.deadline).toISOString().split('T')[0] : '',
      scope: call.scope,
      eligibility: call.eligibility,
      requirements: call.requirements,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get unique types and sponsors for filter options
  const availableTypes = useMemo(() => {
    const types = [...new Set(calls.map(call => call.type))];
    return types.sort();
  }, [calls]);

  const availableStatuses = useMemo(() => {
    const statuses = [...new Set(calls.map(call => call.status))];
    return statuses.sort();
  }, [calls]);

  // Filter and search grant calls
  const filteredCalls = useMemo(() => {
    return calls.filter(call => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        call.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        call.scope.toLowerCase().includes(searchQuery.toLowerCase()) ||
        call.sponsor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        call.type.toLowerCase().includes(searchQuery.toLowerCase());

      // Type filter
      const matchesType = typeFilter === 'all' || call.type === typeFilter;

      // Status filter
      const matchesStatus = statusFilter === 'all' || call.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [calls, searchQuery, typeFilter, statusFilter]);

  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setStatusFilter('all');
  };

  const handleSearch = () => {
    // The search is already reactive through the filteredCalls useMemo
    // This function can be used for additional search actions if needed
    // For now, it serves as a visual trigger for users who prefer clicking
    console.log('Search triggered with query:', searchQuery);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Call Management</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create New Call
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Grant Call</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreateCall)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter grant call title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select call type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ORI">ORI</SelectItem>
                          <SelectItem value="External">External</SelectItem>
                          <SelectItem value="Scholarship">Scholarship</SelectItem>
                          <SelectItem value="Travel/Conference">Travel/Conference</SelectItem>
                          <SelectItem value="GOVT">GOVT</SelectItem>
                          <SelectItem value="Fellowship">Fellowship</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sponsor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sponsor</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter sponsor organization" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deadline</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="scope"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scope</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe the scope of the grant call" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="eligibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Eligibility</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe eligibility requirements" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requirements</FormLabel>
                      <FormControl>
                        <Textarea placeholder="List specific requirements" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Call</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by title, scope, sponsor, or type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button onClick={handleSearch} className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Search
                </Button>
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

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <Building className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {availableStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(searchQuery || typeFilter !== 'all' || statusFilter !== 'all') && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {filteredCalls.length} of {calls.length} grant calls
            </span>
            {(searchQuery || typeFilter !== 'all' || statusFilter !== 'all') && (
              <span className="text-blue-600">
                Filters active
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Grant Calls</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Sponsor</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCalls.map((call) => (
                <TableRow key={call.id}>
                  <TableCell className="font-medium">{call.title}</TableCell>
                  <TableCell>{call.type}</TableCell>
                  <TableCell>{call.sponsor}</TableCell>
                  <TableCell>{formatDate(call.deadline)}</TableCell>
                  <TableCell>
                    <Badge variant={call.status === 'Open' ? 'default' : 'secondary'}>
                      {call.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(call)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleCallStatus(call.id)}
                      >
                        {call.status === 'Open' ? (
                          <ToggleRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingCall} onOpenChange={(open) => !open && setEditingCall(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Grant Call</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditCall)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter grant call title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select call type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ORI">ORI</SelectItem>
                        <SelectItem value="External">External</SelectItem>
                        <SelectItem value="Scholarship">Scholarship</SelectItem>
                        <SelectItem value="Travel/Conference">Travel/Conference</SelectItem>
                        <SelectItem value="GOVT">GOVT</SelectItem>
                        <SelectItem value="Fellowship">Fellowship</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sponsor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sponsor</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter sponsor organization" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deadline</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scope"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scope</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the scope of the grant call" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="eligibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Eligibility</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe eligibility requirements" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="requirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Requirements</FormLabel>
                    <FormControl>
                      <Textarea placeholder="List specific requirements" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setEditingCall(null)}>
                  Cancel
                </Button>
                <Button type="submit">Update Call</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CallManagement;
