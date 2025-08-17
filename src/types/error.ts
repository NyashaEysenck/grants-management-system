// Frontend error types matching backend error schema

export enum ErrorCode {
  // Authentication errors
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  ACCOUNT_LOCKED = "ACCOUNT_LOCKED",
  ACCOUNT_DISABLED = "ACCOUNT_DISABLED",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  TOKEN_INVALID = "TOKEN_INVALID",
  UNAUTHORIZED = "UNAUTHORIZED",
  
  // Rate limiting
  RATE_LIMITED = "RATE_LIMITED",
  TOO_MANY_ATTEMPTS = "TOO_MANY_ATTEMPTS",
  
  // Server errors
  SERVER_ERROR = "SERVER_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
  
  // Validation errors
  VALIDATION_ERROR = "VALIDATION_ERROR",
  MISSING_FIELD = "MISSING_FIELD",
  INVALID_FORMAT = "INVALID_FORMAT",
  
  // Network/Connection errors
  NETWORK_ERROR = "NETWORK_ERROR",
  TIMEOUT = "TIMEOUT"
}

export interface ErrorDetail {
  code: ErrorCode;
  message: string;
  details?: string;
  field?: string;
  retry_after?: number;
  suggestions?: string[];
}

export interface ErrorResponse {
  error: ErrorDetail;
  timestamp: string;
  request_id?: string;
}

export interface ValidationErrorDetail {
  field: string;
  message: string;
  code: string;
}

export interface ValidationErrorResponse {
  error: ErrorDetail;
  validation_errors: ValidationErrorDetail[];
  timestamp: string;
  request_id?: string;
}

export interface AuthError {
  code: ErrorCode;
  message: string;
  details?: string;
  field?: string;
  retryAfter?: number;
  suggestions?: string[];
  requestId?: string;
}

export interface FormFieldError {
  field: string;
  message: string;
  code?: string;
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}
