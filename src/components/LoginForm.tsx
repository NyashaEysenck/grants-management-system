import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, University, Award, BookOpen } from 'lucide-react';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: University,
      title: "Academic Excellence",
      description: "Comprehensive grant management for research institutions"
    },
    {
      icon: Award,
      title: "Funding Success",
      description: "Streamlined processes to maximize funding opportunities"
    },
    {
      icon: BookOpen,
      title: "Research Support",
      description: "Complete lifecycle management from application to closure"
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-secondary/20 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-primary/5 to-accent/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-accent/5 to-primary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        
        {/* Left side - Branding and Features */}
        <div className="hidden lg:flex flex-col justify-center space-y-8 p-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                <University className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground font-playfair">
                  Grant Management
                </h1>
                <p className="text-muted-foreground">Academic Research Portal</p>
              </div>
            </div>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              Empowering academic institutions with comprehensive grant management solutions. 
              Streamline your research funding process from application to project completion.
            </p>
          </div>

          <div className="space-y-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 hover:bg-card/80 transition-all duration-300 hover:shadow-md">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="flex flex-col justify-center">
          <div className="w-full max-w-md mx-auto">
            <Card className="glass-card shadow-2xl border-0 bg-card/95 backdrop-blur-md">
              <CardHeader className="space-y-4 text-center pb-6">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg mb-2">
                  <University className="w-8 h-8 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-foreground font-playfair">
                    Welcome Back
                  </CardTitle>
                  <p className="text-muted-foreground mt-2">
                    Sign in to access your grant management dashboard
                  </p>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-foreground">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11 bg-background/80 border-border/60 focus:border-primary focus:ring-primary/20 transition-all duration-200"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-foreground">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-11 bg-background/80 border-border/60 focus:border-primary focus:ring-primary/20 pr-11 transition-all duration-200"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-9 w-9 hover:bg-muted/50"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive" className="border-destructive/20 bg-destructive/5">
                      <AlertDescription className="text-sm">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full h-11 university shadow-lg hover:shadow-xl"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Signing In...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>

                {/* Demo credentials */}
                <div className="bg-secondary/50 p-4 rounded-lg border border-border/30">
                  <p className="text-sm font-medium text-foreground mb-2">Demo Credentials:</p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>• researcher@grants.edu / research123</div>
                    <div>• manager@grants.edu / manager123</div>
                    <div>• admin@grants.edu / admin123</div>
                  </div>
                </div>

                <div className="text-center pt-4 border-t border-border/30">
                  <p className="text-sm text-muted-foreground">
                    Secure access to your research management platform
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;