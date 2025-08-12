import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService, User, UserCreate, UserUpdate } from '../services/usersService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit, Trash2, RotateCcw } from 'lucide-react';

const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  role: z.string().min(1, 'Role is required'),
  status: z.enum(['active', 'inactive']),
});

// Define role colors for badges
const roleColors: Record<string, string> = {
  'Admin': 'bg-purple-100 text-purple-800',
  'Grants Manager': 'bg-blue-100 text-blue-800',
  'Reviewer': 'bg-green-100 text-green-800',
  'Researcher': 'bg-amber-100 text-amber-800'
};

type UserFormData = z.infer<typeof userSchema>;

const UserManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { data: users = [], isLoading } = useQuery<User[], Error>({
    queryKey: ['users'],
    queryFn: () => usersService.getAllUsers(),
  });

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      role: '',
      status: 'active',
    },
  });

  const handleMutationSuccess = (message: string) => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
    toast({ title: 'Success', description: message });
    setIsDialogOpen(false);
    setEditingUser(null);
    form.reset();
  };

  const handleMutationError = (error: Error, defaultMessage: string) => {
    toast({ title: 'Error', description: error.message || defaultMessage, variant: 'destructive' });
  };

  const createUserMutation = useMutation<User, Error, UserCreate>({
    mutationFn: (userData: UserCreate) => usersService.createUser(userData),
    onSuccess: () => handleMutationSuccess('User created successfully.'),
    onError: (error) => handleMutationError(error, 'Failed to create user.'),
  });

  const updateUserMutation = useMutation<User | null, Error, { id: string; data: UserUpdate }>({
    mutationFn: ({ id, data }) => usersService.updateUser(id, data),
    onSuccess: () => handleMutationSuccess('User updated successfully.'),
    onError: (error) => handleMutationError(error, 'Failed to update user.'),
  });

  const deleteUserMutation = useMutation<boolean, Error, string>({
    mutationFn: (id: string) => usersService.deleteUser(id),
    onSuccess: () => handleMutationSuccess('User deleted successfully.'),
    onError: (error) => handleMutationError(error, 'Failed to delete user.'),
  });

  const resetPasswordMutation = useMutation<boolean, Error, string>({
    mutationFn: (id: string) => usersService.resetUserPassword(id),
    onSuccess: () => handleMutationSuccess('Password reset successfully.'),
    onError: (error) => handleMutationError(error, 'Failed to reset password.'),
  });

  const handleSubmit = (data: UserFormData) => {
    if (editingUser) {
      updateUserMutation.mutate({ id: editingUser.id, data });
    } else {
      const userDataWithPassword: UserCreate = {
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status,
        password: 'tempPassword123!'
      };
      createUserMutation.mutate(userDataWithPassword);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.reset(user);
    setIsDialogOpen(true);
  };

  const roleColors: { [key: string]: string } = {
    Admin: 'bg-red-100 text-red-800',
    'Grants Manager': 'bg-blue-100 text-blue-800',
    Researcher: 'bg-green-100 text-green-800',
  };

  const statusColors: { [key: string]: 'active' | 'inactive' } = {
    active: 'active',
    inactive: 'inactive',
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingUser(null); form.reset(); }}>
              <Plus className="mr-2 h-4 w-4" /> Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Admin">Admin</SelectItem>
                          <SelectItem value="Grants Manager">Grants Manager</SelectItem>
                          <SelectItem value="Researcher">Researcher</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={createUserMutation.isPending || updateUserMutation.isPending}>
                  {createUserMutation.isPending || updateUserMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading users...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge className={roleColors[user.role] || 'bg-gray-100 text-gray-800'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resetPasswordMutation.mutate(user.id)}
                          disabled={resetPasswordMutation.isPending}
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {user.name}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteUserMutation.mutate(user.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
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

export default UserManagement;
