import {
  createSupabaseRepository,
  orUndefined,
} from '@/data/createSupabaseRepository';
import type { Repository } from '@/data/types';
import type {
  CreateGoalInput,
  Goal,
  Milestone,
  UpdateGoalInput,
} from '@/features/goals/types';

export type GoalsRepository = Repository<
  Goal,
  CreateGoalInput,
  UpdateGoalInput
>;

function computeProgress(goal: Goal): Goal {
  if (goal.milestones.length === 0) {
    return { ...goal, progress: goal.status === 'completed' ? 100 : 0 };
  }
  const done = goal.milestones.filter((milestone) => milestone.done).length;
  return {
    ...goal,
    progress: Math.round((done / goal.milestones.length) * 100),
  };
}

function fromRow(row: Record<string, unknown>): Goal {
  return computeProgress({
    id: row.id as string,
    title: row.title as string,
    description: orUndefined(row.description as string | null),
    category: row.category as Goal['category'],
    status: row.status as Goal['status'],
    targetDate: orUndefined(row.target_date as string | null),
    milestones: (row.milestones as Milestone[] | null) ?? [],
    progress: 0,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  });
}

/**
 * `progress` is always recomputed from `milestones` on read — never
 * trusted from storage — per docs/16_Data_Model_Plan.md §6.
 */
export const goalsRepository: GoalsRepository = createSupabaseRepository<
  Goal,
  CreateGoalInput,
  UpdateGoalInput
>({
  table: 'goals',
  fromRow,
  toInsertRow: (input) => ({
    title: input.title,
    description: input.description,
    category: input.category,
    target_date: input.targetDate || null,
    status: 'active',
    milestones: [],
  }),
  toUpdateRow: (input) => ({
    ...(input.title !== undefined && { title: input.title }),
    ...(input.description !== undefined && {
      description: input.description,
    }),
    ...(input.category !== undefined && { category: input.category }),
    ...(input.targetDate !== undefined && {
      target_date: input.targetDate || null,
    }),
    ...(input.status !== undefined && { status: input.status }),
    ...(input.milestones !== undefined && { milestones: input.milestones }),
  }),
});
