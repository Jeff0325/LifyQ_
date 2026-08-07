import { Repeat } from 'lucide-react';
import { useState } from 'react';

import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { StaggerItem, StaggerList } from '@/components/shared/motion';
import { Button } from '@/components/ui/button';
import { HabitCard } from '@/features/habits/components/HabitCard';
import { HabitFormDialog } from '@/features/habits/components/HabitFormDialog';
import { HabitsSkeleton } from '@/features/habits/components/HabitsSkeleton';
import { useHabits } from '@/features/habits/hooks/useHabits';
import type { Habit } from '@/features/habits/types';

export interface HabitsListProps {
  onCreate: () => void;
}

export function HabitsList({ onCreate }: HabitsListProps) {
  const { data: habits, isLoading, isError, refetch } = useHabits();
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>(
    undefined,
  );

  if (isLoading) return <HabitsSkeleton />;

  if (isError) {
    return (
      <ErrorState
        title="Couldn't load your habits"
        onRetry={() => void refetch()}
      />
    );
  }

  if (!habits || habits.length === 0) {
    return (
      <EmptyState
        icon={Repeat}
        title="No habits yet"
        description="Start tracking a small, repeatable action — consistency compounds."
        module="habits"
        action={<Button onClick={onCreate}>New habit</Button>}
      />
    );
  }

  return (
    <>
      <StaggerList className="gap-3 sm:grid-cols-2 lg:grid-cols-3 grid grid-cols-1">
        {habits.map((habit) => (
          <StaggerItem key={habit.id}>
            <HabitCard habit={habit} onEdit={setEditingHabit} />
          </StaggerItem>
        ))}
      </StaggerList>

      <HabitFormDialog
        open={!!editingHabit}
        onOpenChange={(open) => !open && setEditingHabit(undefined)}
        habit={editingHabit}
      />
    </>
  );
}
