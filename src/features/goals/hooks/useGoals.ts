import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { goalsRepository } from '@/features/goals/repository';
import type {
  CreateGoalInput,
  Goal,
  UpdateGoalInput,
} from '@/features/goals/types';

export const goalKeys = {
  all: ['goals'] as const,
  lists: () => [...goalKeys.all, 'list'] as const,
  detail: (id: string) => [...goalKeys.all, 'detail', id] as const,
};

export function useGoals() {
  return useQuery({
    queryKey: goalKeys.lists(),
    queryFn: () => goalsRepository.list(),
  });
}

export function useGoal(id: string | undefined) {
  return useQuery({
    queryKey: goalKeys.detail(id ?? ''),
    queryFn: () => goalsRepository.get(id!),
    enabled: !!id,
  });
}

function invalidateGoal(
  queryClient: ReturnType<typeof useQueryClient>,
  goal: Goal,
) {
  void queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
  queryClient.setQueryData(goalKeys.detail(goal.id), goal);
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateGoalInput) => goalsRepository.create(input),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: goalKeys.lists() }),
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateGoalInput }) =>
      goalsRepository.update(id, input),
    onSuccess: (goal) => invalidateGoal(queryClient, goal),
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => goalsRepository.remove(id),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: goalKeys.lists() }),
  });
}

/** Toggle one milestone's done state — reads current milestones off the goal already in cache. */
export function useToggleMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ goal, milestoneId }: { goal: Goal; milestoneId: string }) =>
      goalsRepository.update(goal.id, {
        milestones: goal.milestones.map((milestone) =>
          milestone.id === milestoneId
            ? { ...milestone, done: !milestone.done }
            : milestone,
        ),
      }),
    onSuccess: (goal) => invalidateGoal(queryClient, goal),
  });
}
