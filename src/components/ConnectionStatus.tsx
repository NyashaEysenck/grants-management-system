import React from 'react';
import { AlertTriangle, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAuth } from '../context/AuthContext';

export const ConnectionStatus: React.FC = () => {
  const { isBackendAvailable, retryConnection, loading } = useAuth();

  if (isBackendAvailable) {
    return null; // Don't show anything when connection is good
  }

  return (
    <Alert className="mb-4 border-amber-200 bg-amber-50 text-amber-800">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <WifiOff className="h-4 w-4" />
          <span>
            Unable to connect to server. Please check your internet connection or try again.
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={retryConnection}
          disabled={loading}
          className="ml-4 border-amber-300 text-amber-800 hover:bg-amber-100"
        >
          {loading ? (
            <RefreshCw className="h-3 w-3 animate-spin mr-1" />
          ) : (
            <Wifi className="h-3 w-3 mr-1" />
          )}
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default ConnectionStatus;
