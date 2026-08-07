import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { projectsRepository } from '@/features/projects/repository';
import type {
  CreateProjectInput,
  Project,
  UpdateProjectInput,
} from '@/features/projects/types';

export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  detail: (id: string) => [...projectKeys.all, 'detail', id] as const,
};

export function useProjects() {
  return useQuery({
    queryKey: projectKeys.lists(),
    queryFn: () => projectsRepository.list(),
  });
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: projectKeys.detail(id ?? ''),
    queryFn: () => projectsRepository.get(id!),
    enabled: !!id,
  });
}

function invalidateProject(
  queryClient: ReturnType<typeof useQueryClient>,
  project: Project,
) {
  void queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
  queryClient.setQueryData(projectKeys.detail(project.id), project);
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProjectInput) => projectsRepository.create(input),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: projectKeys.lists() }),
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProjectInput }) =>
      projectsRepository.update(id, input),
    onSuccess: (project) => invalidateProject(queryClient, project),
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectsRepository.remove(id),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: projectKeys.lists() }),
  });
}

/** Link/unlink a task by id — the taskIds array is the only cross-reference, Tasks itself is never touched. */
export function useSetProjectTasks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      project,
      taskIds,
    }: {
      project: Project;
      taskIds: string[];
    }) => projectsRepository.update(project.id, { taskIds }),
    onSuccess: (project) => invalidateProject(queryClient, project),
  });
}
