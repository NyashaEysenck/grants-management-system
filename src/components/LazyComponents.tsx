import { lazy } from 'react';

// Lazy load all page components for code splitting
export const Dashboard = lazy(() => import('../pages/Dashboard'));
export const Login = lazy(() => import('../pages/Login'));
export const Index = lazy(() => import('../pages/Index'));
export const Applications = lazy(() => import('../pages/Applications'));
export const Projects = lazy(() => import('../pages/Projects'));
export const Documents = lazy(() => import('../pages/Documents'));
export const DocumentsManagement = lazy(() => import('../pages/DocumentsManagement'));
export const CallManagement = lazy(() => import('../pages/CallManagement'));
export const GrantCallDetails = lazy(() => import('../pages/GrantCallDetails'));
export const UserManagement = lazy(() => import('../pages/UserManagement'));
export const SystemConfig = lazy(() => import('../pages/SystemConfig'));
export const NotFound = lazy(() => import('../pages/NotFound'));

// Lazy load heavy components
export const GrantApplicationForm = lazy(() => import('./GrantApplicationForm'));
export const FundRequisitionForm = lazy(() => import('./FundRequisitionForm'));
export const ProjectClosureWorkflow = lazy(() => import('./ProjectClosureWorkflow'));
export const VCSignOffPage = lazy(() => import('./VCSignOffPage'));
export const ReviewerPage = lazy(() => import('./ReviewerPage'));
export const SignOffPage = lazy(() => import('./SignOffPage'));