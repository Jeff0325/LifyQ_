import { Search } from 'lucide-react';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { BillFilters } from '@/features/bills/types';

export interface BillFilterBarProps {
  filters: BillFilters;
  onChange: (filters: BillFilters) => void;
}

export function BillFilterBar({ filters, onChange }: BillFilterBarProps) {
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
          placeholder="Search bills…"
          className="pl-9"
          aria-label="Search bills"
        />
      </div>
      <Select
        value={filters.status}
        onValueChange={(value) =>
          onChange({ ...filters, status: value as BillFilters['status'] })
        }
      >
        <SelectTrigger className="w-36" aria-label="Filter by status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="unpaid">Unpaid</SelectItem>
          <SelectItem value="paid">Paid</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
