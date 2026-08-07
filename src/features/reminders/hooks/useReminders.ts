import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { remindersRepository } from '@/features/reminders/repository';
import type {
  CreateReminderInput,
  Reminder,
  UpdateReminderInput,
} from '@/features/reminders/types';

export const reminderKeys = {
  all: ['reminders'] as const,
  lists: () => [...reminderKeys.all, 'list'] as const,
};

export function useReminders() {
  return useQuery({
    queryKey: reminderKeys.lists(),
    queryFn: () => remindersRepository.list(),
  });
}

export function useCreateReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateReminderInput) =>
      remindersRepository.create(input),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: reminderKeys.lists() }),
  });
}

export function useUpdateReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateReminderInput }) =>
      remindersRepository.update(id, input),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: reminderKeys.lists() }),
  });
}

export function useDeleteReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => remindersRepository.remove(id),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: reminderKeys.lists() }),
  });
}

/** Toggle done/not-done — the high-frequency interaction, same optimistic-free simple pattern as Bills' mark-paid. */
export function useToggleReminderCompleted() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reminder }: { reminder: Reminder }) =>
      remindersRepository.update(reminder.id, {
        completed: !reminder.completed,
      }),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: reminderKeys.lists() }),
  });
}
