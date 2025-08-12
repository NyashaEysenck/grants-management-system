
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { resetDatabase } from '@/services/adminService';

const SystemConfig = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleReset = async () => {
    setIsLoading(true);
    try {
      const result = await resetDatabase();
      toast({
        title: 'Success',
        description: result.message,
        variant: 'default',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">System Configuration</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Database Management</h2>
        <p className="text-gray-600 mb-4">This will completely wipe the database and reload it with the initial demo data. This action is irreversible.</p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={isLoading}>
              {isLoading ? 'Resetting...' : 'Reset Database'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete all data from the database and reload it with the initial demo data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleReset}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default SystemConfig;
