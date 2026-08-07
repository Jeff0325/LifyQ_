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
  PROJECT_STATUS_LABELS,
  PROJECT_STATUSES,
  type ProjectFilters,
} from '@/features/projects/types';

export interface ProjectFilterBarProps {
  filters: ProjectFilters;
  onChange: (filters: ProjectFilters) => void;
}

export function ProjectFilterBar({ filters, onChange }: ProjectFilterBarProps) {
  return (
    <div className="gap-2 sm:flex-row sm:items-center flex flex-col">
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
          placeholder="Search projects…"
          className="pl-9"
          aria-label="Search projects"
        />
      </div>
      <Select
        value={filters.status}
        onValueChange={(value) =>
          onChange({ ...filters, status: value as ProjectFilters['status'] })
        }
      >
        <SelectTrigger className="w-36" aria-label="Filter by status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {PROJECT_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {PROJECT_STATUS_LABELS[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
