import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { journalRepository } from '@/features/journal/repository';
import type {
  CreateJournalEntryInput,
  UpdateJournalEntryInput,
} from '@/features/journal/types';

export const journalKeys = {
  all: ['journal'] as const,
  lists: () => [...journalKeys.all, 'list'] as const,
};

export function useJournalEntries() {
  return useQuery({
    queryKey: journalKeys.lists(),
    queryFn: () => journalRepository.list(),
  });
}

export function useCreateJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateJournalEntryInput) =>
      journalRepository.create(input),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: journalKeys.lists() }),
  });
}

export function useUpdateJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateJournalEntryInput;
    }) => journalRepository.update(id, input),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: journalKeys.lists() }),
  });
}

export function useDeleteJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => journalRepository.remove(id),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: journalKeys.lists() }),
  });
}
