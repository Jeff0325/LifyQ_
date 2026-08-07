import { Checkbox } from '@/components/ui/checkbox';
import { useToggleMilestone } from '@/features/goals/hooks/useGoals';
import type { Goal } from '@/features/goals/types';
import { cn } from '@/lib/utils';

export function MilestoneList({ goal }: { goal: Goal }) {
  const toggleMilestone = useToggleMilestone();

  if (goal.milestones.length === 0) {
    return (
      <p className="text-body-sm text-foreground-tertiary">
        No milestones yet — break this goal down into steps to track progress.
      </p>
    );
  }

  return (
    <ul className="gap-1 flex flex-col">
      {goal.milestones.map((milestone) => (
        <li key={milestone.id}>
          <label className="gap-3 px-2 py-2.5 flex cursor-pointer items-center rounded-md hover:bg-surface-raised">
            <Checkbox
              checked={milestone.done}
              onCheckedChange={() =>
                toggleMilestone.mutate({ goal, milestoneId: milestone.id })
              }
            />
            <span
              className={cn(
                'text-body-sm text-foreground',
                milestone.done && 'text-foreground-tertiary line-through',
              )}
            >
              {milestone.title}
            </span>
          </label>
        </li>
      ))}
    </ul>
  );
}
