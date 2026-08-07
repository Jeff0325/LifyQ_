import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { groceryListDetailPath } from '@/constants/routes';
import { useDeleteGroceryList } from '@/features/grocery-lists/hooks/useGroceryLists';
import type { GroceryList } from '@/features/grocery-lists/types';
import { useToast } from '@/hooks/useToast';

export interface GroceryListCardProps {
  list: GroceryList;
  onEdit: (list: GroceryList) => void;
}

export function GroceryListCard({ list, onEdit }: GroceryListCardProps) {
  const deleteList = useDeleteGroceryList();
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const checkedCount = list.items.filter((item) => item.checked).length;

  const handleDelete = async () => {
    await deleteList.mutateAsync(list.id);
    setConfirmOpen(false);
    toast({ variant: 'success', title: 'List deleted' });
  };

  return (
    <Card className="min-w-0 gap-2 p-4 flex flex-col">
      <div className="gap-2 flex items-start justify-between">
        <Link
          to={groceryListDetailPath(list.id)}
          className="min-w-0 font-semibold truncate text-body-sm text-foreground hover:underline focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          {list.title}
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={`More actions for ${list.title}`}
              className="size-8 flex shrink-0 items-center justify-center rounded-md text-foreground-tertiary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <MoreVertical aria-hidden="true" className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onEdit(list)}>
              <Pencil aria-hidden="true" className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem destructive onSelect={() => setConfirmOpen(true)}>
              <Trash2 aria-hidden="true" className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Link
        to={groceryListDetailPath(list.id)}
        className="text-caption text-foreground-tertiary"
      >
        {checkedCount}/{list.items.length} items
      </Link>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this list?"
        description={`"${list.title}" will be removed. This can't be undone.`}
        confirmLabel="Delete"
        destructive
        loading={deleteList.isPending}
        onConfirm={handleDelete}
      />
    </Card>
  );
}
