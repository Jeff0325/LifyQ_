import { Plus } from 'lucide-react';
import { useState } from 'react';

import { PageContainer } from '@/components/shared/PageContainer';
import { Button } from '@/components/ui/button';
import { useJarvisPageContext } from '@/features/assistant/hooks/useJarvisPageContext';
import { TaskFilterBar, TaskFormDialog, TaskList } from '@/features/tasks';
import {
  DEFAULT_TASK_FILTERS,
  type Task,
  type TaskFilters,
} from '@/features/tasks/types';

export function Tasks() {
  const [filters, setFilters] = useState<TaskFilters>(DEFAULT_TASK_FILTERS);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  useJarvisPageContext('Tasks', 'your tasks list', 'task');

  const openCreate = () => {
    setEditingTask(undefined);
    setFormOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setFormOpen(true);
  };

  return (
    <PageContainer size="lg" className="gap-4 flex flex-col">
      <div className="gap-3 flex items-center justify-between">
        <h2 className="font-semibold text-h2 text-foreground">Tasks</h2>
        <Button onClick={openCreate} size="sm">
          <Plus aria-hidden="true" />
          New task
        </Button>
      </div>

      <TaskFilterBar filters={filters} onChange={setFilters} />

      <TaskList filters={filters} onEdit={openEdit} onCreate={openCreate} />

      <TaskFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        task={editingTask}
      />
    </PageContainer>
  );
}
