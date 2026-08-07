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
  LIFE_RECORD_CATEGORIES,
  LIFE_RECORD_CATEGORY_LABELS,
  type LifeRecordFilters,
} from '@/features/life-records/types';

export interface LifeRecordFilterBarProps {
  filters: LifeRecordFilters;
  onChange: (filters: LifeRecordFilters) => void;
}

export function LifeRecordFilterBar({
  filters,
  onChange,
}: LifeRecordFilterBarProps) {
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
          placeholder="Search records…"
          className="pl-9"
          aria-label="Search life records"
        />
      </div>
      <Select
        value={filters.category}
        onValueChange={(value) =>
          onChange({
            ...filters,
            category: value as LifeRecordFilters['category'],
          })
        }
      >
        <SelectTrigger className="w-44" aria-label="Filter by category">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {LIFE_RECORD_CATEGORIES.map((category) => (
            <SelectItem key={category} value={category}>
              {LIFE_RECORD_CATEGORY_LABELS[category]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
