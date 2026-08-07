import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { habitsRepository } from '@/features/habits/repository';
import type {
  CreateHabitInput,
  Habit,
  UpdateHabitInput,
} from '@/features/habits/types';
import { todayIso } from '@/features/habits/utils';

export const habitKeys = {
  all: ['habits'] as const,
  lists: () => [...habitKeys.all, 'list'] as const,
  detail: (id: string) => [...habitKeys.all, 'detail', id] as const,
};

export function useHabits() {
  return useQuery({
    queryKey: habitKeys.lists(),
    queryFn: () => habitsRepository.list(),
  });
}

export function useCreateHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateHabitInput) => habitsRepository.create(input),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: habitKeys.lists() }),
  });
}

export function useUpdateHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateHabitInput }) =>
      habitsRepository.update(id, input),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: habitKeys.lists() }),
  });
}

export function useDeleteHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => habitsRepository.remove(id),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: habitKeys.lists() }),
  });
}

/** Toggle today's completion — optimistic, since this is the highest-frequency interaction in the whole app. */
export function useToggleHabitToday() {
  const queryClient = useQueryClient();
  const today = todayIso();

  return useMutation({
    mutationFn: (habit: Habit) => {
      const alreadyDone = habit.completions.some(
        (c) => c.date === today && c.completed,
      );
      const completions = alreadyDone
        ? habit.completions.filter((c) => c.date !== today)
        : [
            ...habit.completions.filter((c) => c.date !== today),
            { date: today, completed: true },
          ];
      return habitsRepository.update(habit.id, { completions });
    },
    onMutate: async (habit) => {
      await queryClient.cancelQueries({ queryKey: habitKeys.lists() });
      const previous = queryClient.getQueryData<Habit[]>(habitKeys.lists());
      const alreadyDone = habit.completions.some(
        (c) => c.date === today && c.completed,
      );
      const nextCompletions = alreadyDone
        ? habit.completions.filter((c) => c.date !== today)
        : [
            ...habit.completions.filter((c) => c.date !== today),
            { date: today, completed: true },
          ];

      queryClient.setQueryData<Habit[]>(habitKeys.lists(), (current) =>
        current?.map((item) =>
          item.id === habit.id
            ? { ...item, completions: nextCompletions }
            : item,
        ),
      );
      return { previous };
    },
    onError: (_error, _habit, context) => {
      if (context?.previous)
        queryClient.setQueryData(habitKeys.lists(), context.previous);
    },
    onSettled: () =>
      void queryClient.invalidateQueries({ queryKey: habitKeys.lists() }),
  });
}
