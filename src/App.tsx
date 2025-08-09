
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import GrantCallDetails from "./pages/GrantCallDetails";
import GrantApplicationForm from "./components/GrantApplicationForm";
import Applications from "./pages/Applications";
import Projects from "./pages/Projects";
import Documents from "./pages/Documents";
import CallManagement from "./pages/CallManagement";
import UserManagement from "./pages/UserManagement";
import SystemConfig from "./pages/SystemConfig";
import NotFound from "./pages/NotFound";
import ReviewerPage from "./components/ReviewerPage";
import SignOffPage from "./components/SignOffPage";
import VCSignOffPage from "./components/VCSignOffPage";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/review/:token" element={<ReviewerPage />} />
              <Route path="/signoff/:token" element={<SignOffPage />} />
              <Route path="/vc-signoff/:token" element={<VCSignOffPage />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/grant-call/:id" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <GrantCallDetails />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/grant-call/:id/apply" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <GrantApplicationForm />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/applications" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Applications />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/projects" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Projects />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/documents" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Documents />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/call-management" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <CallManagement />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/user-management" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <UserManagement />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/system-config" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <SystemConfig />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
