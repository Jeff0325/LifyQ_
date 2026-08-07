import { Target } from 'lucide-react';

import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { StaggerItem, StaggerList } from '@/components/shared/motion';
import { Button } from '@/components/ui/button';
import { GoalCard } from '@/features/goals/components/GoalCard';
import { GoalsSkeleton } from '@/features/goals/components/GoalsSkeleton';
import { useGoals } from '@/features/goals/hooks/useGoals';

export interface GoalsGridProps {
  onCreate: () => void;
}

export function GoalsGrid({ onCreate }: GoalsGridProps) {
  const { data: goals, isLoading, isError, refetch } = useGoals();

  if (isLoading) return <GoalsSkeleton />;

  if (isError) {
    return (
      <ErrorState
        title="Couldn't load your goals"
        onRetry={() => void refetch()}
      />
    );
  }

  if (!goals || goals.length === 0) {
    return (
      <EmptyState
        icon={Target}
        title="No goals yet"
        description="Set your first goal — the outcomes you're working toward, broken into milestones."
        module="goals"
        action={<Button onClick={onCreate}>New goal</Button>}
      />
    );
  }

  return (
    <StaggerList className="gap-4 sm:grid-cols-2 lg:grid-cols-3 grid grid-cols-1">
      {goals.map((goal) => (
        <StaggerItem key={goal.id}>
          <GoalCard goal={goal} />
        </StaggerItem>
      ))}
    </StaggerList>
  );
}
