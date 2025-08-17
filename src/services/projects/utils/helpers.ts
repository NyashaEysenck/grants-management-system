/**
 * Project Utility Functions
 * 
 * Helper functions for project data manipulation and UI support.
 */

import { Project, Milestone, Requisition } from '../api/types';

/**
 * Get status color classes for project status badges
 */
export const getStatusColor = (status: Project['status']): string => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    case 'on_hold':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    case 'closed':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Get status color classes for milestone status badges
 */
export const getMilestoneStatusColor = (status: Milestone['status']): string => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800';
    case 'on_hold':
      return 'bg-yellow-100 text-yellow-800';
    case 'pending':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Get status color classes for requisition status badges
 */
export const getRequisitionStatusColor = (status: Requisition['status']): string => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'submitted':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Calculate project progress based on completed milestones
 */
export const calculateProgress = (milestones: Milestone[]): number => {
  if (milestones.length === 0) return 0;
  const completedMilestones = milestones.filter(m => m.status === 'completed').length;
  return Math.round((completedMilestones / milestones.length) * 100);
};

/**
 * Check for overdue milestones and mark them
 */
export const checkOverdueMilestones = (project: Project): Project => {
  const now = new Date();
  const updatedMilestones = project.milestones.map(milestone => {
    const dueDate = new Date(milestone.due_date);
    const isOverdue = now > dueDate && 
                     milestone.status !== 'completed' && 
                     !milestone.progress_report_uploaded;
    
    return {
      ...milestone,
      is_overdue: isOverdue
    };
  });

  return {
    ...project,
    milestones: updatedMilestones
  };
};

/**
 * Format date strings for display
 */
export const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
};

/**
 * Check if a milestone is overdue
 */
export const isMilestoneOverdue = (milestone: Milestone): boolean => {
  if (milestone.status === 'completed') return false;
  const now = new Date();
  const dueDate = new Date(milestone.due_date);
  return now > dueDate;
};

/**
 * Get project status display text
 */
export const getStatusDisplayText = (status: Project['status']): string => {
  switch (status) {
    case 'active':
      return 'Active';
    case 'completed':
      return 'Completed';
    case 'on_hold':
      return 'On Hold';
    case 'cancelled':
      return 'Cancelled';
    case 'closed':
      return 'Closed';
    default:
      return status;
  }
};
