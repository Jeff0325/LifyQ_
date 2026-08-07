import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { eventsRepository } from '@/features/calendar/repository';
import type {
  CreateEventInput,
  UpdateEventInput,
} from '@/features/calendar/types';

export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
};

export function useEvents() {
  return useQuery({
    queryKey: eventKeys.lists(),
    queryFn: () => eventsRepository.list(),
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateEventInput) => eventsRepository.create(input),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: eventKeys.lists() }),
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateEventInput }) =>
      eventsRepository.update(id, input),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: eventKeys.lists() }),
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eventsRepository.remove(id),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: eventKeys.lists() }),
  });
}
