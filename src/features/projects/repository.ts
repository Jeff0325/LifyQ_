import {
  createSupabaseRepository,
  orUndefined,
} from '@/data/createSupabaseRepository';
import type { Repository } from '@/data/types';
import type {
  CreateProjectInput,
  Project,
  UpdateProjectInput,
} from '@/features/projects/types';

export type ProjectsRepository = Repository<
  Project,
  CreateProjectInput,
  UpdateProjectInput
>;

function fromRow(row: Record<string, unknown>): Project {
  return {
    id: row.id as string,
    title: row.title as string,
    description: orUndefined(row.description as string | null),
    goalId: orUndefined(row.goal_id as string | null),
    status: row.status as Project['status'],
    taskIds: (row.task_ids as string[] | null) ?? [],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export const projectsRepository: ProjectsRepository = createSupabaseRepository<
  Project,
  CreateProjectInput,
  UpdateProjectInput
>({
  table: 'projects',
  fromRow,
  toInsertRow: (input) => ({
    title: input.title,
    description: input.description,
    goal_id: input.goalId || null,
    status: input.status,
    task_ids: [],
  }),
  toUpdateRow: (input) => ({
    ...(input.title !== undefined && { title: input.title }),
    ...(input.description !== undefined && {
      description: input.description,
    }),
    ...(input.goalId !== undefined && { goal_id: input.goalId || null }),
    ...(input.status !== undefined && { status: input.status }),
    ...(input.taskIds !== undefined && { task_ids: input.taskIds }),
  }),
});
