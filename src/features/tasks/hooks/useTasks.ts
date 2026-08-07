import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { tasksRepository } from '@/features/tasks/repository';
import type {
  CreateTaskInput,
  Task,
  UpdateTaskInput,
} from '@/features/tasks/types';

/** Namespaced, centralized query keys — avoids key-typo cache bugs, per docs/14_State_Management_Strategy.md §2. */
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  detail: (id: string) => [...taskKeys.all, 'detail', id] as const,
};

export function useTasks() {
  return useQuery({
    queryKey: taskKeys.lists(),
    queryFn: () => tasksRepository.list(),
  });
}

export function useTask(id: string | undefined) {
  return useQuery({
    queryKey: taskKeys.detail(id ?? ''),
    queryFn: () => tasksRepository.get(id!),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTaskInput) => tasksRepository.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) =>
      tasksRepository.update(id, input),
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.setQueryData(taskKeys.detail(updated.id), updated);
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksRepository.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}

/**
 * Optimistic toggle — the high-frequency "check off a task" interaction
 * should feel instant even against simulated latency, per
 * docs/14_State_Management_Strategy.md §2.
 */
export function useToggleTaskStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ task }: { task: Task }) => {
      const done = task.status !== 'done';
      return tasksRepository.update(task.id, {
        status: done ? 'done' : 'todo',
        completedAt: done ? new Date().toISOString() : undefined,
      });
    },
    onMutate: async ({ task }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() });
      const previous = queryClient.getQueryData<Task[]>(taskKeys.lists());
      const done = task.status !== 'done';
      queryClient.setQueryData<Task[]>(taskKeys.lists(), (current) =>
        current?.map((item) =>
          item.id === task.id
            ? {
                ...item,
                status: done ? 'done' : 'todo',
                completedAt: done ? new Date().toISOString() : undefined,
              }
            : item,
        ),
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(taskKeys.lists(), context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}
