import { Search } from 'lucide-react';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { NOTE_FOLDERS, type NoteFilters } from '@/features/notes/types';

const FOLDER_LABELS: Record<string, string> = {
  all: 'All folders',
  general: 'General',
  work: 'Work',
  personal: 'Personal',
  ideas: 'Ideas',
  reference: 'Reference',
};

export interface NoteFilterBarProps {
  filters: NoteFilters;
  onChange: (filters: NoteFilters) => void;
}

export function NoteFilterBar({ filters, onChange }: NoteFilterBarProps) {
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
          placeholder="Search notes…"
          className="pl-9"
          aria-label="Search notes"
        />
      </div>
      <Select
        value={filters.folder}
        onValueChange={(value) =>
          onChange({ ...filters, folder: value as NoteFilters['folder'] })
        }
      >
        <SelectTrigger className="w-40" aria-label="Filter by folder">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{FOLDER_LABELS.all}</SelectItem>
          {NOTE_FOLDERS.map((folder) => (
            <SelectItem key={folder} value={folder}>
              {FOLDER_LABELS[folder]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
