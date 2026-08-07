import { CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { ProgressRing } from '@/components/shared/ProgressRing';
import { Badge } from '@/components/ui/badge';
import { InteractiveCard } from '@/components/ui/card';
import { goalDetailPath } from '@/constants/routes';
import type { Goal } from '@/features/goals/types';

const CATEGORY_LABELS: Record<Goal['category'], string> = {
  career: 'Career',
  health: 'Health',
  finance: 'Finance',
  personal: 'Personal',
  learning: 'Learning',
  other: 'Other',
};

export function GoalCard({ goal }: { goal: Goal }) {
  const navigate = useNavigate();
  const doneMilestones = goal.milestones.filter(
    (milestone) => milestone.done,
  ).length;

  return (
    <InteractiveCard
      onClick={() => navigate(goalDetailPath(goal.id))}
      className="gap-4 p-5 flex flex-col"
    >
      <div className="gap-3 flex items-start justify-between">
        <div className="min-w-0 gap-1.5 flex flex-col">
          <Badge variant="neutral" className="w-fit">
            {CATEGORY_LABELS[goal.category]}
          </Badge>
          <h3 className="font-semibold truncate text-h3 text-foreground">
            {goal.title}
          </h3>
          {goal.description && (
            <p className="line-clamp-2 text-body-sm text-foreground-secondary">
              {goal.description}
            </p>
          )}
        </div>
        <ProgressRing value={goal.progress} size={56} strokeWidth={5} />
      </div>

      <div className="flex items-center justify-between text-caption text-foreground-tertiary">
        <span className="gap-1 inline-flex items-center">
          <CheckCircle2 aria-hidden="true" className="size-3.5" />
          {doneMilestones}/{goal.milestones.length} milestones
        </span>
        {goal.status === 'completed' ? (
          <Badge variant="success">Completed</Badge>
        ) : (
          goal.targetDate && (
            <span>
              Due{' '}
              {new Date(`${goal.targetDate}T00:00:00`).toLocaleDateString(
                undefined,
                { month: 'short', day: 'numeric' },
              )}
            </span>
          )
        )}
      </div>
    </InteractiveCard>
  );
}
