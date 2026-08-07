import { ClipboardList } from 'lucide-react';
import { useMemo } from 'react';

import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { StaggerItem, StaggerList } from '@/components/shared/motion';
import { Button } from '@/components/ui/button';
import { TaskRow } from '@/features/tasks/components/TaskRow';
import { TasksSkeleton } from '@/features/tasks/components/TasksSkeleton';
import { useTasks } from '@/features/tasks/hooks/useTasks';
import type { Task, TaskFilters } from '@/features/tasks/types';
import { sortTasks } from '@/features/tasks/utils';

function matchesFilters(task: Task, filters: TaskFilters): boolean {
  if (filters.status !== 'all' && task.status !== filters.status) return false;
  if (filters.priority !== 'all' && task.priority !== filters.priority)
    return false;
  if (filters.category !== 'all' && task.category !== filters.category)
    return false;
  if (filters.search.trim()) {
    const needle = filters.search.trim().toLowerCase();
    const haystack = `${task.title} ${task.notes ?? ''}`.toLowerCase();
    if (!haystack.includes(needle)) return false;
  }
  return true;
}

export interface TaskListProps {
  filters: TaskFilters;
  onEdit: (task: Task) => void;
  onCreate: () => void;
}

export function TaskList({ filters, onEdit, onCreate }: TaskListProps) {
  const { data: tasks, isLoading, isError, refetch } = useTasks();

  const visible = useMemo(() => {
    if (!tasks) return [];
    return sortTasks(tasks.filter((task) => matchesFilters(task, filters)));
  }, [tasks, filters]);

  if (isLoading) return <TasksSkeleton />;

  if (isError) {
    return (
      <ErrorState
        title="Couldn't load your tasks"
        onRetry={() => void refetch()}
      />
    );
  }

  if (tasks && tasks.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="No tasks yet"
        description="Capture your first to-do — it takes five seconds."
        module="tasks"
        action={<Button onClick={onCreate}>New task</Button>}
      />
    );
  }

  if (visible.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="No tasks match your filters"
        description="Try a different search or clear a filter."
      />
    );
  }

  return (
    <StaggerList className="flex flex-col">
      {visible.map((task) => (
        <StaggerItem key={task.id}>
          <TaskRow task={task} onEdit={onEdit} />
        </StaggerItem>
      ))}
    </StaggerList>
  );
}
