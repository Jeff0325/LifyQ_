import { z } from 'zod';

import type { BaseEntity } from '@/data/types';

export const PROJECT_STATUSES = ['active', 'completed', 'archived'] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export interface Project extends BaseEntity {
  title: string;
  description?: string;
  goalId?: string;
  status: ProjectStatus;
  taskIds: string[];
}

export const projectFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(140),
  description: z.string().trim().max(2000).optional(),
  goalId: z.string().optional(),
  status: z.enum(PROJECT_STATUSES),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
export type CreateProjectInput = ProjectFormValues;
export type UpdateProjectInput = Partial<ProjectFormValues> & {
  taskIds?: string[];
};

export interface ProjectFilters {
  search: string;
  status: ProjectStatus | 'all';
}

export const DEFAULT_PROJECT_FILTERS: ProjectFilters = {
  search: '',
  status: 'all',
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  active: 'Active',
  completed: 'Completed',
  archived: 'Archived',
};
