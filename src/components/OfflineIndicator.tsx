import React from 'react';
import { Cloud, CloudOff, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '../context/AuthContext';
import offlineHandler from '../utils/offlineHandler';

export const OfflineIndicator: React.FC = () => {
  const { isBackendAvailable } = useAuth();
  const [pendingCount, setPendingCount] = React.useState(0);

  React.useEffect(() => {
    const updatePendingCount = () => {
      setPendingCount(offlineHandler.getPendingOperationsCount());
    };

    // Update count initially and set up periodic updates
    updatePendingCount();
    const interval = setInterval(updatePendingCount, 1000);

    return () => clearInterval(interval);
  }, []);

  if (isBackendAvailable && pendingCount === 0) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Cloud className="h-3 w-3 mr-1" />
            Online
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Connected to server</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  if (!isBackendAvailable) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            <CloudOff className="h-3 w-3 mr-1" />
            Offline
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Server connection unavailable</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  if (pendingCount > 0) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Clock className="h-3 w-3 mr-1" />
            {pendingCount} pending
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{pendingCount} operation{pendingCount !== 1 ? 's' : ''} waiting to sync</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return null;
};

export default OfflineIndicator;
