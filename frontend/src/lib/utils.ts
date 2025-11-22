import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid
    if (isNaN(d.getTime())) {
      return 'Invalid Date';
    }
    
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid
    if (isNaN(d.getTime())) {
      return 'Invalid Date';
    }
    
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

export function getPriorityColor(priority: string): string {
  const priorityLower = priority.toLowerCase();
  switch (priorityLower) {
    case 'critical':
      return 'bg-red-500 text-white';
    case 'high':
      return 'bg-orange-500 text-white';
    case 'medium':
      return 'bg-blue-500 text-white';
    case 'low':
      return 'bg-gray-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
}

export function getStatusColor(status: string): string {
  switch (status.toUpperCase()) {
    case 'TODO':
      return 'text-blue-600 bg-blue-100';
    case 'IN_PROGRESS':
      return 'text-yellow-600 bg-yellow-100';
    case 'RESOLVED':
      return 'text-green-600 bg-green-100';
    case 'PASSED':
      return 'text-green-600 bg-green-100';
    case 'FAILED':
      return 'text-red-600 bg-red-100';
    case 'BLOCKED':
      return 'text-orange-600 bg-orange-100';
    case 'SKIPPED':
      return 'text-gray-600 bg-gray-100';
    case 'OPEN':
      return 'text-blue-600 bg-blue-100';
    case 'CLOSED':
      return 'text-gray-600 bg-gray-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

export function formatTestCaseStatus(status: string): string {
  switch (status.toUpperCase()) {
    case 'TODO':
      return 'Todo';
    case 'IN_PROGRESS':
      return 'In Progress';
    case 'RESOLVED':
      return 'Resolved';
    default:
      return status;
  }
}

