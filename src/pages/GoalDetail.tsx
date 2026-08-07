import { MoreVertical, Pencil, Target, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { ErrorState } from '@/components/shared/ErrorState';
import { PageContainer } from '@/components/shared/PageContainer';
import { ProgressRing } from '@/components/shared/ProgressRing';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/constants/routes';
import { useJarvisPageContext } from '@/features/assistant/hooks/useJarvisPageContext';
import {
  GoalFormDialog,
  MilestoneList,
  useDeleteGoal,
  useGoal,
} from '@/features/goals';
import type { Goal } from '@/features/goals/types';
import { useToast } from '@/hooks/useToast';

const CATEGORY_LABELS: Record<Goal['category'], string> = {
  career: 'Career',
  health: 'Health',
  finance: 'Finance',
  personal: 'Personal',
  learning: 'Learning',
  other: 'Other',
};

export function GoalDetail() {
  const { goalId } = useParams<{ goalId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: goal, isLoading, isError, refetch } = useGoal(goalId);
  const deleteGoal = useDeleteGoal();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // docs/41 — lets Jarvis answer "tell me more about this" while the user
  // is on this page, without them naming the goal. Called unconditionally
  // (rules of hooks) with `null` until `goal` actually resolves, so Jarvis
  // never answers from stale/loading context.
  useJarvisPageContext(
    'the goal',
    goal
      ? `"${goal.title}" — ${goal.progress}% complete${
          goal.targetDate
            ? `, targeting ${new Date(
                `${goal.targetDate}T00:00:00`,
              ).toLocaleDateString(undefined, {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}`
            : ''
        }`
      : null,
  );

  if (isLoading) {
    return (
      <PageContainer size="sm" className="gap-4 flex flex-col">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </PageContainer>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Couldn't load this goal"
        onRetry={() => void refetch()}
      />
    );
  }

  if (!goal) {
    return (
      <ErrorState
        title="Goal not found"
        description="It may have been deleted."
        action={
          <Button variant="secondary" onClick={() => navigate(ROUTES.goals)}>
            Back to Goals
          </Button>
        }
      />
    );
  }

  const handleDelete = async () => {
    await deleteGoal.mutateAsync(goal.id);
    toast({ variant: 'success', title: 'Goal deleted' });
    navigate(ROUTES.goals);
  };

  return (
    <PageContainer size="sm" className="gap-6 flex flex-col">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              href={ROUTES.goals}
              onClick={(e) => {
                e.preventDefault();
                navigate(ROUTES.goals);
              }}
            >
              Goals
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{goal.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="gap-4 flex items-start justify-between">
        <div className="min-w-0 gap-2 flex flex-col">
          <Badge variant="neutral" className="w-fit">
            {CATEGORY_LABELS[goal.category]}
          </Badge>
          <h1 className="font-semibold text-h1 text-foreground">
            {goal.title}
          </h1>
          {goal.description && (
            <p className="text-body text-foreground-secondary">
              {goal.description}
            </p>
          )}
          {goal.targetDate && (
            <p className="text-caption text-foreground-tertiary">
              Target:{' '}
              {new Date(`${goal.targetDate}T00:00:00`).toLocaleDateString(
                undefined,
                {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                },
              )}
            </p>
          )}
        </div>

        <div className="gap-2 flex shrink-0 items-center">
          <ProgressRing value={goal.progress} size={72} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Goal actions">
                <MoreVertical aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setEditOpen(true)}>
                <Pencil aria-hidden="true" className="size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                destructive
                onSelect={() => setConfirmOpen(true)}
              >
                <Trash2 aria-hidden="true" className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="p-4 rounded-xl border border-border bg-surface">
        <div className="mb-2 gap-2 flex items-center">
          <Target
            aria-hidden="true"
            className="size-4 text-foreground-tertiary"
          />
          <h2 className="font-semibold text-h3 text-foreground">Milestones</h2>
        </div>
        <MilestoneList goal={goal} />
      </div>

      <GoalFormDialog open={editOpen} onOpenChange={setEditOpen} goal={goal} />
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this goal?"
        description={`"${goal.title}" and its milestones will be removed. This can't be undone.`}
        confirmLabel="Delete"
        destructive
        loading={deleteGoal.isPending}
        onConfirm={handleDelete}
      />
    </PageContainer>
  );
}
