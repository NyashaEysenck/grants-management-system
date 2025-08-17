
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormError, FieldError } from '@/components/ui/form-error';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { AuthError } from '../types/error';
import { validateEmail, validatePassword } from '../utils/errorHandling';
import { showSuccessToast, showAuthErrorToast } from '../utils/toastHelpers';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<AuthError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  // Real-time field validation
  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (fieldErrors.email) {
      const validation = validateEmail(value);
      if (validation.isValid) {
        setFieldErrors(prev => ({ ...prev, email: undefined }));
      }
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (fieldErrors.password) {
      const validation = validatePassword(value);
      if (validation.isValid) {
        setFieldErrors(prev => ({ ...prev, password: undefined }));
      }
    }
  };

  const validateForm = (): boolean => {
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    
    const errors: { email?: string; password?: string } = {};
    
    if (!emailValidation.isValid) {
      errors.email = emailValidation.message;
    }
    
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.message;
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    
    // Validate form fields
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await login(email, password);
      
      if (result.success) {
        showSuccessToast('Login successful', 'Welcome back!');
        navigate('/dashboard');
      } else if (result.error) {
        setAuthError(result.error);
        showAuthErrorToast(result.error, () => handleSubmit(e));
      }
    } catch (err) {
      console.error('Unexpected login error:', err);
      const error: AuthError = {
        code: 'SERVER_ERROR' as any,
        message: 'An unexpected error occurred',
        details: 'Please try again'
      };
      setAuthError(error);
      showAuthErrorToast(error, () => handleSubmit(e));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setAuthError(null);
    handleSubmit(new Event('submit') as any);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <LogIn className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Grants Management System
          </CardTitle>
          <CardDescription>
            Sign in to your account
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="Enter your email"
                className={fieldErrors.email ? 'border-red-500 focus:border-red-500' : ''}
                required
              />
              {fieldErrors.email && <FieldError message={fieldErrors.email} />}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  placeholder="Enter your password"
                  className={fieldErrors.password ? 'border-red-500 focus:border-red-500 pr-10' : 'pr-10'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors.password && <FieldError message={fieldErrors.password} />}
            </div>

            {authError && (
              <FormError 
                error={authError} 
                onRetry={handleRetry}
                className="mt-4"
              />
            )}
            
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || loading}
            >
              {isLoading || loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2 font-semibold">Demo Credentials:</p>
            <div className="text-xs text-gray-500 space-y-1">
              <div>• researcher@grants.edu / research123</div>
              <div>• manager@grants.edu / manager123</div>
              <div>• admin@grants.edu / admin123</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
