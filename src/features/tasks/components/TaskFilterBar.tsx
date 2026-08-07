import { Search } from 'lucide-react';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  TASK_STATUSES,
  type TaskFilters,
} from '@/features/tasks/types';

const STATUS_LABELS: Record<string, string> = {
  all: 'All statuses',
  todo: 'To do',
  in_progress: 'In progress',
  done: 'Done',
};

const PRIORITY_LABELS: Record<string, string> = {
  all: 'All priorities',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  none: 'None',
};

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All categories',
  work: 'Work',
  personal: 'Personal',
  health: 'Health',
  learning: 'Learning',
  errands: 'Errands',
  other: 'Other',
};

export interface TaskFilterBarProps {
  filters: TaskFilters;
  onChange: (filters: TaskFilters) => void;
}

export function TaskFilterBar({ filters, onChange }: TaskFilterBarProps) {
  return (
    <div className="gap-2 sm:flex-row sm:flex-wrap sm:items-center flex flex-col">
      <div className="sm:min-w-48 relative flex-1">
        <Search
          aria-hidden="true"
          className="left-3 size-4 absolute top-1/2 -translate-y-1/2 text-foreground-tertiary"
        />
        <Input
          value={filters.search}
          onChange={(event) =>
            onChange({ ...filters, search: event.target.value })
          }
          placeholder="Search tasks…"
          className="pl-9"
          aria-label="Search tasks"
        />
      </div>
      <div className="gap-2 flex">
        <Select
          value={filters.status}
          onValueChange={(value) =>
            onChange({ ...filters, status: value as TaskFilters['status'] })
          }
        >
          <SelectTrigger className="w-36" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{STATUS_LABELS.all}</SelectItem>
            {TASK_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.priority}
          onValueChange={(value) =>
            onChange({ ...filters, priority: value as TaskFilters['priority'] })
          }
        >
          <SelectTrigger className="w-36" aria-label="Filter by priority">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{PRIORITY_LABELS.all}</SelectItem>
            {TASK_PRIORITIES.map((priority) => (
              <SelectItem key={priority} value={priority}>
                {PRIORITY_LABELS[priority]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.category}
          onValueChange={(value) =>
            onChange({ ...filters, category: value as TaskFilters['category'] })
          }
        >
          <SelectTrigger className="w-36" aria-label="Filter by category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{CATEGORY_LABELS.all}</SelectItem>
            {TASK_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {CATEGORY_LABELS[category]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
