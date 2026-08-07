import {
  ListChecks,
  MoreVertical,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { ErrorState } from '@/components/shared/ErrorState';
import { PageContainer } from '@/components/shared/PageContainer';
import { ProgressRing } from '@/components/shared/ProgressRing';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/constants/routes';
import { useJarvisPageContext } from '@/features/assistant/hooks/useJarvisPageContext';
import {
  ProjectFormDialog,
  useDeleteProject,
  useProject,
  useSetProjectTasks,
} from '@/features/projects';
import { PROJECT_STATUS_LABELS, type Project } from '@/features/projects/types';
import { useTasks, useToggleTaskStatus } from '@/features/tasks';
import { useToast } from '@/hooks/useToast';

export function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: project, isLoading, isError, refetch } = useProject(projectId);
  const { data: tasks } = useTasks();
  const toggleTaskStatus = useToggleTaskStatus();
  const setProjectTasks = useSetProjectTasks();
  const deleteProject = useDeleteProject();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  // Radix Select is uncontrolled here (no `value` prop) so it always shows
  // the placeholder rather than "sticking" on the last-picked task; bumping
  // this key remounts it after each link, since the picked task also drops
  // out of `unlinkedTasks` and can't be re-selected anyway.
  const [linkSelectKey, setLinkSelectKey] = useState(0);

  // docs/41 — see the identical pattern/rationale in GoalDetail.tsx.
  useJarvisPageContext(
    'the project',
    project
      ? `"${project.title}" — ${PROJECT_STATUS_LABELS[project.status]}, ${
          project.taskIds.length
        } linked task${project.taskIds.length === 1 ? '' : 's'}`
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
        title="Couldn't load this project"
        onRetry={() => void refetch()}
      />
    );
  }

  if (!project) {
    return (
      <ErrorState
        title="Project not found"
        description="It may have been deleted."
        action={
          <Button variant="secondary" onClick={() => navigate(ROUTES.projects)}>
            Back to Projects
          </Button>
        }
      />
    );
  }

  const linkedTasks = (tasks ?? []).filter((t) =>
    project.taskIds.includes(t.id),
  );
  const unlinkedTasks = (tasks ?? []).filter(
    (t) => !project.taskIds.includes(t.id),
  );
  const doneCount = linkedTasks.filter((t) => t.status === 'done').length;
  const progress =
    linkedTasks.length === 0
      ? 0
      : Math.round((doneCount / linkedTasks.length) * 100);

  const linkTask = (taskId: string) => {
    setProjectTasks.mutate({
      project,
      taskIds: [...project.taskIds, taskId],
    });
    setLinkSelectKey((key) => key + 1);
  };

  const unlinkTask = (taskId: string) => {
    setProjectTasks.mutate({
      project,
      taskIds: project.taskIds.filter((id) => id !== taskId),
    });
  };

  const handleDelete = async () => {
    await deleteProject.mutateAsync(project.id);
    toast({ variant: 'success', title: 'Project deleted' });
    navigate(ROUTES.projects);
  };

  return (
    <PageContainer size="sm" className="gap-6 flex flex-col">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              href={ROUTES.projects}
              onClick={(e) => {
                e.preventDefault();
                navigate(ROUTES.projects);
              }}
            >
              Projects
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{project.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="gap-4 flex items-start justify-between">
        <div className="min-w-0 gap-2 flex flex-col">
          <Badge
            variant={project.status === 'archived' ? 'neutral' : 'brand'}
            className="w-fit"
          >
            {PROJECT_STATUS_LABELS[project.status]}
          </Badge>
          <h1 className="font-semibold text-h1 text-foreground">
            {project.title}
          </h1>
          {project.description && (
            <p className="text-body text-foreground-secondary">
              {project.description}
            </p>
          )}
        </div>

        <div className="gap-2 flex shrink-0 items-center">
          <ProgressRing value={progress} size={72} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Project actions">
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

      <div className="p-4 gap-3 flex flex-col rounded-xl border border-border bg-surface">
        <div className="gap-2 flex items-center justify-between">
          <div className="gap-2 flex items-center">
            <ListChecks
              aria-hidden="true"
              className="size-4 text-foreground-tertiary"
            />
            <h2 className="font-semibold text-h3 text-foreground">Tasks</h2>
          </div>
          {unlinkedTasks.length > 0 && (
            <Select key={linkSelectKey} onValueChange={linkTask}>
              <SelectTrigger className="w-48" aria-label="Link a task">
                <div className="gap-1.5 flex items-center">
                  <Plus aria-hidden="true" className="size-3.5" />
                  <SelectValue placeholder="Link a task" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {unlinkedTasks.map((task) => (
                  <SelectItem key={task.id} value={task.id}>
                    {task.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {linkedTasks.length === 0 ? (
          <p className="py-2 text-center text-body-sm text-foreground-tertiary">
            No tasks linked yet — link one above.
          </p>
        ) : (
          <ul className="gap-1 flex flex-col">
            {linkedTasks.map((task) => (
              <li
                key={task.id}
                className="gap-2.5 px-1 py-2 flex items-center rounded-md hover:bg-surface-raised"
              >
                <Checkbox
                  checked={task.status === 'done'}
                  onCheckedChange={() => toggleTaskStatus.mutate({ task })}
                  aria-label={`Mark ${task.title} as ${task.status === 'done' ? 'not done' : 'done'}`}
                />
                <span
                  className={
                    task.status === 'done'
                      ? 'min-w-0 flex-1 truncate text-body-sm text-foreground-tertiary line-through'
                      : 'min-w-0 flex-1 truncate text-body-sm text-foreground'
                  }
                >
                  {task.title}
                </span>
                <button
                  type="button"
                  onClick={() => unlinkTask(task.id)}
                  aria-label={`Unlink ${task.title}`}
                  className="size-7 flex shrink-0 items-center justify-center rounded-md text-foreground-tertiary hover:text-danger focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <X aria-hidden="true" className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ProjectFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        project={project as Project}
      />
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this project?"
        description={`"${project.title}" will be removed. Linked tasks are not deleted. This can't be undone.`}
        confirmLabel="Delete"
        destructive
        loading={deleteProject.isPending}
        onConfirm={handleDelete}
      />
    </PageContainer>
  );
}
