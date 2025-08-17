import axios from 'axios';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

/**
 * Handle API errors with consistent error messages
 */
export const handleApiError = (error: any, context: string): ApiError => {
  console.error(`Error in ${context}:`, error);
  
  let errorMessage = `Failed to ${context}`;
  let status: number | undefined;
  let code: string | undefined;
  
  if (axios.isAxiosError(error)) {
    status = error.response?.status;
    code = error.code;
    
    // Handle specific HTTP status codes
    switch (status) {
      case 401:
        errorMessage = 'Authentication failed. Please log in again.';
        break;
      case 403:
        errorMessage = 'You do not have permission to perform this action.';
        break;
      case 404:
        errorMessage = 'The requested resource was not found.';
        break;
      case 400:
        errorMessage = error.response?.data?.detail || 'Invalid request data.';
        break;
      case 422:
        errorMessage = error.response?.data?.detail || 'Validation error.';
        break;
      case 500:
        errorMessage = 'Server error. Please try again later.';
        break;
      default:
        if (error.response?.data?.detail) {
          errorMessage = error.response.data.detail;
        }
    }
    
    // Handle network errors
    if (error.message?.includes('Network') || code === 'NETWORK_ERROR') {
      errorMessage = 'Network error. Please check your connection and try again.';
    } else if (code === 'ECONNREFUSED') {
      errorMessage = 'Cannot connect to server. Please ensure the backend is running.';
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }
  
  return {
    message: errorMessage,
    status,
    code
  };
};

/**
 * Handle application-specific errors
 */
export const handleApplicationError = (error: any): never => {
  const apiError = handleApiError(error, 'process application');
  
  // Add context-specific error handling
  if (apiError.status === 403) {
    if (apiError.message.includes('permission')) {
      throw new Error('You do not have permission to access this application.');
    }
  }
  
  if (apiError.status === 404) {
    throw new Error('Application not found.');
  }
  
  throw new Error(apiError.message);
};

/**
 * Handle reviewer-specific errors
 */
export const handleReviewerError = (error: any): never => {
  const apiError = handleApiError(error, 'process reviewer action');
  
  if (apiError.status === 403) {
    throw new Error('You do not have permission to perform this reviewer action.');
  }
  
  if (apiError.status === 404) {
    throw new Error('Review token is invalid or has expired.');
  }
  
  throw new Error(apiError.message);
};

/**
 * Handle sign-off specific errors
 */
export const handleSignOffError = (error: any): never => {
  const apiError = handleApiError(error, 'process sign-off');
  
  if (apiError.status === 403) {
    throw new Error('You do not have permission to perform this sign-off action.');
  }
  
  if (apiError.status === 404) {
    throw new Error('Sign-off token is invalid or has expired.');
  }
  
  if (apiError.status === 400) {
    throw new Error('Invalid sign-off data or application is not ready for sign-off.');
  }
  
  throw new Error(apiError.message);
};

/**
 * Handle biodata specific errors
 */
export const handleBiodataError = (error: any): never => {
  const apiError = handleApiError(error, 'process biodata');
  
  if (apiError.status === 403) {
    throw new Error('You can only access your own biodata.');
  }
  
  throw new Error(apiError.message);
};
