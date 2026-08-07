import { ListChecks } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { ProgressRing } from '@/components/shared/ProgressRing';
import { Badge } from '@/components/ui/badge';
import { InteractiveCard } from '@/components/ui/card';
import { projectDetailPath } from '@/constants/routes';
import { useTasks } from '@/features/tasks';
import type { Project } from '@/features/projects/types';
import { PROJECT_STATUS_LABELS } from '@/features/projects/types';

export function ProjectCard({ project }: { project: Project }) {
  const navigate = useNavigate();
  // Notes already sets the precedent for a non-Dashboard component reading
  // another feature's hook directly (its task/goal link pickers) — a
  // Project genuinely aggregating its own linked Tasks is the same kind of
  // sanctioned relationship, not a new exception. See docs/06 §4.
  const { data: tasks } = useTasks();
  const linkedTasks = (tasks ?? []).filter((t) =>
    project.taskIds.includes(t.id),
  );
  const doneCount = linkedTasks.filter((t) => t.status === 'done').length;
  const progress =
    linkedTasks.length === 0
      ? 0
      : Math.round((doneCount / linkedTasks.length) * 100);

  return (
    <InteractiveCard
      onClick={() => navigate(projectDetailPath(project.id))}
      className="gap-4 p-5 flex flex-col"
    >
      <div className="gap-3 flex items-start justify-between">
        <div className="min-w-0 gap-1.5 flex flex-col">
          <Badge
            variant={project.status === 'archived' ? 'neutral' : 'brand'}
            className="w-fit"
          >
            {PROJECT_STATUS_LABELS[project.status]}
          </Badge>
          <h3 className="font-semibold truncate text-h3 text-foreground">
            {project.title}
          </h3>
          {project.description && (
            <p className="line-clamp-2 text-body-sm text-foreground-secondary">
              {project.description}
            </p>
          )}
        </div>
        <ProgressRing value={progress} size={56} strokeWidth={5} />
      </div>

      <span className="gap-1 inline-flex items-center text-caption text-foreground-tertiary">
        <ListChecks aria-hidden="true" className="size-3.5" />
        {doneCount}/{linkedTasks.length} tasks done
      </span>
    </InteractiveCard>
  );
}
