import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { lifeRecordsRepository } from '@/features/life-records/repository';
import type {
  CreateLifeRecordInput,
  UpdateLifeRecordInput,
} from '@/features/life-records/types';

export const lifeRecordKeys = {
  all: ['life-records'] as const,
  lists: () => [...lifeRecordKeys.all, 'list'] as const,
};

export function useLifeRecords() {
  return useQuery({
    queryKey: lifeRecordKeys.lists(),
    queryFn: () => lifeRecordsRepository.list(),
  });
}

export function useCreateLifeRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateLifeRecordInput) =>
      lifeRecordsRepository.create(input),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: lifeRecordKeys.lists() }),
  });
}

export function useUpdateLifeRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateLifeRecordInput }) =>
      lifeRecordsRepository.update(id, input),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: lifeRecordKeys.lists() }),
  });
}

export function useDeleteLifeRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => lifeRecordsRepository.remove(id),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: lifeRecordKeys.lists() }),
  });
}
