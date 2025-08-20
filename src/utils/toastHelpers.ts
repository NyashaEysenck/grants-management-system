import React from 'react';
import { toast } from '../hooks/use-toast';
import { ToastAction } from '../components/ui/toast';
import { AuthError, ErrorCode } from '../types/error';
import { getErrorMessage, getErrorSuggestions, formatRetryDelay, getRetryDelay } from './errorHandling';
import offlineHandler from './offlineHandler';

/**
 * Show error toast with enhanced error information
 */
export function showErrorToast(error: AuthError, retryAction?: () => void) {
  const message = getErrorMessage(error);
  const suggestions = getErrorSuggestions(error);
  const retryDelay = getRetryDelay(error);

  let description = error.details || '';
  
  // Add suggestions to description
  if (suggestions.length > 0) {
    const suggestionText = suggestions.slice(0, 2).join(' • ');
    description = description ? `${description}\n\nSuggestions: ${suggestionText}` : `Suggestions: ${suggestionText}`;
  }

  // Add retry information for rate limited errors
  if (retryDelay > 0) {
    const retryText = `Try again in ${formatRetryDelay(retryDelay)}`;
    description = description ? `${description}\n\n${retryText}` : retryText;
  }

  const toastConfig: any = {
    title: message,
    description: description || undefined,
    variant: 'destructive',
  };

  // Add retry action for recoverable errors
  if (retryAction && shouldShowRetryAction(error)) {
    toastConfig.action = React.createElement(ToastAction, {
      altText: 'Retry',
      onClick: retryAction
    }, 'Retry');
  }

  return toast(toastConfig);
}

/**
 * Show success toast
 */
export function showSuccessToast(title: string, description?: string) {
  return toast({
    title,
    description,
    variant: 'default',
  });
}

/**
 * Show warning toast
 */
export function showWarningToast(title: string, description?: string) {
  return toast({
    title,
    description,
    variant: 'default',
  });
}

/**
 * Show info toast
 */
export function showInfoToast(title: string, description?: string) {
  return toast({
    title,
    description,
    variant: 'default',
  });
}

/**
 * Show connection error toast with retry and offline handling
 */
export function showConnectionErrorToast(retryAction?: () => void, operationType?: string) {
  const error = {
    code: ErrorCode.NETWORK_ERROR,
    message: 'Connection failed',
    details: 'Unable to connect to the server',
    suggestions: ['Check your internet connection', 'Try again in a moment']
  };
  
  // Add offline message if operation type is provided
  if (operationType && offlineHandler.isBackendUnavailable(error)) {
    const offlineMessage = offlineHandler.getOfflineMessage(operationType);
    error.details = `${error.details}\n\n${offlineMessage}`;
  }
  
  return showErrorToast(error, retryAction);
}

/**
 * Show authentication error toast
 */
export function showAuthErrorToast(error: AuthError, retryAction?: () => void) {
  return showErrorToast(error, retryAction);
}

/**
 * Determine if retry action should be shown
 */
function shouldShowRetryAction(error: AuthError): boolean {
  const retryableErrors = [
    ErrorCode.NETWORK_ERROR,
    ErrorCode.TIMEOUT,
    ErrorCode.SERVER_ERROR,
    ErrorCode.SERVICE_UNAVAILABLE
  ];
  
  return retryableErrors.includes(error.code);
}

/**
 * Show field validation error toast
 */
export function showValidationErrorToast(field: string, message: string) {
  return toast({
    title: 'Validation Error',
    description: `${field}: ${message}`,
    variant: 'destructive',
  });
}

/**
 * Show rate limit error toast with countdown
 */
export function showRateLimitToast(retryAfter: number) {
  const retryText = formatRetryDelay(retryAfter);
  
  return toast({
    title: 'Too many attempts',
    description: `Please wait ${retryText} before trying again`,
    variant: 'destructive',
  });
}

/**
 * Show offline operation queued toast
 */
export function showOfflineQueuedToast(operationType: string, operationId: string) {
  const message = offlineHandler.getOfflineMessage(operationType);
  
  return toast({
    title: 'Operation Queued',
    description: message,
    variant: 'default',
  });
}

/**
 * Show operations synced toast
 */
export function showOperationsSyncedToast(count: number) {
  return toast({
    title: 'Operations Synced',
    description: `${count} pending operation${count !== 1 ? 's' : ''} successfully processed`,
    variant: 'default',
  });
}
