import { Search } from 'lucide-react';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ReminderFilters } from '@/features/reminders/types';

const STATUS_LABELS: Record<ReminderFilters['status'], string> = {
  all: 'All reminders',
  upcoming: 'Upcoming',
  completed: 'Completed',
};

export interface ReminderFilterBarProps {
  filters: ReminderFilters;
  onChange: (filters: ReminderFilters) => void;
}

export function ReminderFilterBar({
  filters,
  onChange,
}: ReminderFilterBarProps) {
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
          placeholder="Search reminders…"
          className="pl-9"
          aria-label="Search reminders"
        />
      </div>
      <Select
        value={filters.status}
        onValueChange={(value) =>
          onChange({ ...filters, status: value as ReminderFilters['status'] })
        }
      >
        <SelectTrigger className="w-40" aria-label="Filter by status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(STATUS_LABELS) as ReminderFilters['status'][]).map(
            (status) => (
              <SelectItem key={status} value={status}>
                {STATUS_LABELS[status]}
              </SelectItem>
            ),
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
