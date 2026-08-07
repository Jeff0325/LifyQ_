import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { documentsRepository } from '@/features/documents/repository';
import type {
  CreateDocumentInput,
  UpdateDocumentInput,
} from '@/features/documents/types';

export const documentKeys = {
  all: ['documents'] as const,
  lists: () => [...documentKeys.all, 'list'] as const,
};

export function useDocuments() {
  return useQuery({
    queryKey: documentKeys.lists(),
    queryFn: () => documentsRepository.list(),
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDocumentInput) =>
      documentsRepository.create(input),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: documentKeys.lists() }),
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateDocumentInput }) =>
      documentsRepository.update(id, input),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: documentKeys.lists() }),
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => documentsRepository.remove(id),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: documentKeys.lists() }),
  });
}
