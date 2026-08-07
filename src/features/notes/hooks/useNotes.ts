import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { notesRepository } from '@/features/notes/repository';
import type { CreateNoteInput, UpdateNoteInput } from '@/features/notes/types';

/** Namespaced, centralized query keys — avoids key-typo cache bugs, per docs/14_State_Management_Strategy.md §2. */
export const noteKeys = {
  all: ['notes'] as const,
  lists: () => [...noteKeys.all, 'list'] as const,
  detail: (id: string) => [...noteKeys.all, 'detail', id] as const,
};

export function useNotes() {
  return useQuery({
    queryKey: noteKeys.lists(),
    queryFn: () => notesRepository.list(),
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateNoteInput) => notesRepository.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateNoteInput }) =>
      notesRepository.update(id, input),
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
      queryClient.setQueryData(noteKeys.detail(updated.id), updated);
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notesRepository.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
    },
  });
}
