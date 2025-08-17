import { AxiosError } from 'axios';
import { ErrorCode, ErrorResponse, AuthError, ValidationErrorResponse } from '../types/error';

/**
 * Parse API error response into structured error object
 */
export function parseApiError(error: unknown): AuthError {
  // Handle network errors
  if (!navigator.onLine) {
    return {
      code: ErrorCode.NETWORK_ERROR,
      message: 'No internet connection',
      details: 'Please check your internet connection and try again',
      suggestions: ['Check your internet connection', 'Try refreshing the page']
    };
  }

  // Handle Axios errors
  if (error instanceof AxiosError) {
    // Network/timeout errors
    if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
      return {
        code: ErrorCode.NETWORK_ERROR,
        message: 'Connection failed',
        details: 'Unable to connect to the server',
        suggestions: ['Check your internet connection', 'Try again in a moment']
      };
    }

    // Timeout errors
    if (error.code === 'TIMEOUT') {
      return {
        code: ErrorCode.TIMEOUT,
        message: 'Request timed out',
        details: 'The server took too long to respond',
        suggestions: ['Try again', 'Check your internet connection']
      };
    }

    // Server responded with error
    if (error.response?.data) {
      const errorData = error.response.data as ErrorResponse;
      
      if (errorData.error) {
        return {
          code: errorData.error.code,
          message: errorData.error.message,
          details: errorData.error.details,
          field: errorData.error.field,
          retryAfter: errorData.error.retry_after,
          suggestions: errorData.error.suggestions,
          requestId: errorData.request_id
        };
      }
    }

    // Handle HTTP status codes without structured error response
    const status = error.response?.status;
    switch (status) {
      case 401:
        return {
          code: ErrorCode.UNAUTHORIZED,
          message: 'Authentication failed',
          details: 'Please check your credentials and try again'
        };
      case 403:
        return {
          code: ErrorCode.UNAUTHORIZED,
          message: 'Access denied',
          details: 'You do not have permission to access this resource'
        };
      case 429:
        return {
          code: ErrorCode.RATE_LIMITED,
          message: 'Too many requests',
          details: 'Please wait before trying again'
        };
      case 500:
        return {
          code: ErrorCode.SERVER_ERROR,
          message: 'Server error',
          details: 'An unexpected error occurred. Please try again'
        };
      case 502:
      case 503:
        return {
          code: ErrorCode.SERVICE_UNAVAILABLE,
          message: 'Service unavailable',
          details: 'The service is temporarily unavailable. Please try again later'
        };
      default:
        return {
          code: ErrorCode.SERVER_ERROR,
          message: 'An error occurred',
          details: error.message || 'Please try again'
        };
    }
  }

  // Handle generic errors
  if (error instanceof Error) {
    return {
      code: ErrorCode.SERVER_ERROR,
      message: 'An unexpected error occurred',
      details: error.message,
      suggestions: ['Try again', 'Contact support if the problem persists']
    };
  }

  // Fallback for unknown errors
  return {
    code: ErrorCode.SERVER_ERROR,
    message: 'An unexpected error occurred',
    details: 'Please try again',
    suggestions: ['Try again', 'Contact support if the problem persists']
  };
}

/**
 * Get user-friendly error message based on error code
 */
export function getErrorMessage(error: AuthError): string {
  const baseMessage = error.message;
  
  if (error.details) {
    return `${baseMessage}: ${error.details}`;
  }
  
  return baseMessage;
}

/**
 * Get error suggestions for user guidance
 */
export function getErrorSuggestions(error: AuthError): string[] {
  if (error.suggestions && error.suggestions.length > 0) {
    return error.suggestions;
  }

  // Default suggestions based on error code
  switch (error.code) {
    case ErrorCode.INVALID_CREDENTIALS:
      return [
        'Double-check your email address',
        'Verify your password is correct',
        'Check if Caps Lock is on'
      ];
    case ErrorCode.NETWORK_ERROR:
      return [
        'Check your internet connection',
        'Try refreshing the page',
        'Disable VPN if you\'re using one'
      ];
    case ErrorCode.TOO_MANY_ATTEMPTS:
      return [
        'Wait before trying again',
        'Contact support if you need immediate access'
      ];
    case ErrorCode.SERVER_ERROR:
      return [
        'Try again in a few moments',
        'Contact support if the problem persists'
      ];
    default:
      return ['Try again', 'Contact support if the problem continues'];
  }
}

/**
 * Check if error is recoverable (user can retry)
 */
export function isRecoverableError(error: AuthError): boolean {
  const nonRecoverableErrors = [
    ErrorCode.ACCOUNT_DISABLED,
    ErrorCode.UNAUTHORIZED
  ];
  
  return !nonRecoverableErrors.includes(error.code);
}

/**
 * Check if error should show retry button
 */
export function shouldShowRetry(error: AuthError): boolean {
  const retryableErrors = [
    ErrorCode.NETWORK_ERROR,
    ErrorCode.TIMEOUT,
    ErrorCode.SERVER_ERROR,
    ErrorCode.SERVICE_UNAVAILABLE
  ];
  
  return retryableErrors.includes(error.code);
}

/**
 * Get retry delay in seconds
 */
export function getRetryDelay(error: AuthError): number {
  if (error.retryAfter) {
    return error.retryAfter;
  }
  
  switch (error.code) {
    case ErrorCode.RATE_LIMITED:
    case ErrorCode.TOO_MANY_ATTEMPTS:
      return 60; // 1 minute
    case ErrorCode.SERVER_ERROR:
      return 5; // 5 seconds
    default:
      return 0;
  }
}

/**
 * Format retry delay for display
 */
export function formatRetryDelay(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }
  
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): { isValid: boolean; message?: string } {
  if (!email.trim()) {
    return { isValid: false, message: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }
  
  return { isValid: true };
}

/**
 * Validate password
 */
export function validatePassword(password: string): { isValid: boolean; message?: string } {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }

  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long' };
  }

  return { isValid: true };
}

/**
 * Handle API errors with user feedback
 */
export function handleApiError(error: unknown, defaultMessage: string = 'An error occurred'): void {
  const parsedError = parseApiError(error);
  
  // Log error for debugging
  console.error('API Error:', {
    code: parsedError.code,
    message: parsedError.message,
    details: parsedError.details,
    originalError: error
  });

  // In a real implementation, you might want to show a toast notification
  // For now, we'll just log the user-friendly message
  console.warn(`User Error: ${parsedError.message || defaultMessage}`);
  
  // You can extend this to integrate with your toast notification system
  // showErrorToast(parsedError.message || defaultMessage, parsedError.suggestions);
}
