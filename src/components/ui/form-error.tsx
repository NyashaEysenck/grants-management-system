import React from 'react';
import { AlertCircle, Wifi, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from './alert';
import { Button } from './button';
import { AuthError, ErrorCode } from '../../types/error';
import { getErrorSuggestions, shouldShowRetry, formatRetryDelay, getRetryDelay } from '../../utils/errorHandling';

interface FormErrorProps {
  error: AuthError;
  onRetry?: () => void;
  className?: string;
}

export function FormError({ error, onRetry, className }: FormErrorProps) {
  const suggestions = getErrorSuggestions(error);
  const showRetry = shouldShowRetry(error) && onRetry;
  const retryDelay = getRetryDelay(error);

  const getErrorIcon = () => {
    switch (error.code) {
      case ErrorCode.NETWORK_ERROR:
      case ErrorCode.TIMEOUT:
        return <Wifi className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getErrorVariant = () => {
    switch (error.code) {
      case ErrorCode.NETWORK_ERROR:
      case ErrorCode.TIMEOUT:
      case ErrorCode.SERVER_ERROR:
        return 'default';
      default:
        return 'destructive';
    }
  };

  return (
    <Alert variant={getErrorVariant() as any} className={className}>
      {getErrorIcon()}
      <AlertDescription className="flex flex-col space-y-2">
        <div>
          <div className="font-medium">{error.message}</div>
          {error.details && (
            <div className="text-sm opacity-90 mt-1">{error.details}</div>
          )}
        </div>

        {retryDelay > 0 && (
          <div className="text-sm font-medium">
            Try again in {formatRetryDelay(retryDelay)}
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="text-sm">
            <div className="font-medium mb-1">Suggestions:</div>
            <ul className="list-disc list-inside space-y-1 opacity-90">
              {suggestions.slice(0, 3).map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}

        {showRetry && (
          <div className="flex justify-end pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Try Again</span>
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}

interface FieldErrorProps {
  message: string;
  className?: string;
}

export function FieldError({ message, className }: FieldErrorProps) {
  return (
    <div className={`text-sm text-red-600 flex items-center space-x-1 mt-1 ${className || ''}`}>
      <AlertCircle className="h-3 w-3" />
      <span>{message}</span>
    </div>
  );
}
