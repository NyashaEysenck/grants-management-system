
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense } from "react";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import LoadingSpinner from "./components/LoadingSpinner";

// Lazy loaded components for optimal performance
import * as LazyComponents from './components/LazyComponents';

// Optimized query client with better defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<LoadingSpinner size="lg" text="Loading application..." />}>
              <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<LazyComponents.Login />} />
                <Route path="/review/:token" element={<LazyComponents.ReviewerPage />} />
                <Route path="/signoff/:token" element={<LazyComponents.SignOffPage />} />
                <Route path="/vc-signoff/:token" element={<LazyComponents.VCSignOffPage />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Suspense fallback={<LoadingSpinner text="Loading dashboard..." />}>
                          <LazyComponents.Dashboard />
                        </Suspense>
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/grant-call/:id" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Suspense fallback={<LoadingSpinner text="Loading grant call..." />}>
                          <LazyComponents.GrantCallDetails />
                        </Suspense>
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/grant-call/:id/apply" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Suspense fallback={<LoadingSpinner text="Loading application form..." />}>
                          <LazyComponents.GrantApplicationForm />
                        </Suspense>
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/applications" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Suspense fallback={<LoadingSpinner text="Loading applications..." />}>
                          <LazyComponents.Applications />
                        </Suspense>
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/projects" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Suspense fallback={<LoadingSpinner text="Loading projects..." />}>
                          <LazyComponents.Projects />
                        </Suspense>
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/documents" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Suspense fallback={<LoadingSpinner text="Loading documents..." />}>
                          <LazyComponents.DocumentsManagement />
                        </Suspense>
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/call-management" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Suspense fallback={<LoadingSpinner text="Loading call management..." />}>
                          <LazyComponents.CallManagement />
                        </Suspense>
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/user-management" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Suspense fallback={<LoadingSpinner text="Loading user management..." />}>
                          <LazyComponents.UserManagement />
                        </Suspense>
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/system-config" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Suspense fallback={<LoadingSpinner text="Loading system config..." />}>
                          <LazyComponents.SystemConfig />
                        </Suspense>
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                <Route path="*" element={<LazyComponents.NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
