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
  DOCUMENT_CATEGORIES,
  DOCUMENT_CATEGORY_LABELS,
  type DocumentFilters,
} from '@/features/documents/types';

export interface DocumentFilterBarProps {
  filters: DocumentFilters;
  onChange: (filters: DocumentFilters) => void;
}

export function DocumentFilterBar({
  filters,
  onChange,
}: DocumentFilterBarProps) {
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
          placeholder="Search documents…"
          className="pl-9"
          aria-label="Search documents"
        />
      </div>
      <Select
        value={filters.category}
        onValueChange={(value) =>
          onChange({
            ...filters,
            category: value as DocumentFilters['category'],
          })
        }
      >
        <SelectTrigger className="w-44" aria-label="Filter by category">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {DOCUMENT_CATEGORIES.map((category) => (
            <SelectItem key={category} value={category}>
              {DOCUMENT_CATEGORY_LABELS[category]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
