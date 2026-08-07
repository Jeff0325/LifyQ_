import { z } from 'zod';

import type { BaseEntity } from '@/data/types';

export const GOAL_CATEGORIES = [
  'career',
  'health',
  'finance',
  'personal',
  'learning',
  'other',
] as const;
export type GoalCategory = (typeof GOAL_CATEGORIES)[number];

export const GOAL_STATUSES = ['active', 'completed', 'archived'] as const;
export type GoalStatus = (typeof GOAL_STATUSES)[number];

export interface Milestone {
  id: string;
  title: string;
  done: boolean;
}

export interface Goal extends BaseEntity {
  title: string;
  description?: string;
  category: GoalCategory;
  status: GoalStatus;
  targetDate?: string;
  milestones: Milestone[];
  /** Derived: percentage of milestones done, 0–100. Computed in the repository layer (docs/16 §6), never hand-edited. */
  progress: number;
}

export const goalFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(140),
  description: z.string().trim().max(2000).optional(),
  category: z.enum(GOAL_CATEGORIES),
  targetDate: z.string().optional(),
});

export type GoalFormValues = z.infer<typeof goalFormSchema>;
export type CreateGoalInput = GoalFormValues;
export type UpdateGoalInput = Partial<GoalFormValues> & {
  status?: GoalStatus;
  milestones?: Milestone[];
};
