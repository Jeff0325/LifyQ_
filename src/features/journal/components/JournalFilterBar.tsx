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
  JOURNAL_MOOD_LABELS,
  JOURNAL_MOODS,
  type JournalFilters,
} from '@/features/journal/types';

export interface JournalFilterBarProps {
  filters: JournalFilters;
  onChange: (filters: JournalFilters) => void;
}

export function JournalFilterBar({ filters, onChange }: JournalFilterBarProps) {
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
          placeholder="Search entries…"
          className="pl-9"
          aria-label="Search journal entries"
        />
      </div>
      <Select
        value={filters.mood}
        onValueChange={(value) =>
          onChange({ ...filters, mood: value as JournalFilters['mood'] })
        }
      >
        <SelectTrigger className="w-36" aria-label="Filter by mood">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All moods</SelectItem>
          {JOURNAL_MOODS.map((mood) => (
            <SelectItem key={mood} value={mood}>
              {JOURNAL_MOOD_LABELS[mood]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
