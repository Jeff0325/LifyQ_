import { ShoppingCart } from 'lucide-react';
import { useState } from 'react';

import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { StaggerItem, StaggerList } from '@/components/shared/motion';
import { Button } from '@/components/ui/button';
import { GroceryListCard } from '@/features/grocery-lists/components/GroceryListCard';
import { GroceryListFormDialog } from '@/features/grocery-lists/components/GroceryListFormDialog';
import { GroceryListsSkeleton } from '@/features/grocery-lists/components/GroceryListsSkeleton';
import { useGroceryLists } from '@/features/grocery-lists/hooks/useGroceryLists';
import type { GroceryList } from '@/features/grocery-lists/types';

export interface GroceryListsGridProps {
  onCreate: () => void;
}

export function GroceryListsGrid({ onCreate }: GroceryListsGridProps) {
  const { data: lists, isLoading, isError, refetch } = useGroceryLists();
  const [editingList, setEditingList] = useState<GroceryList | undefined>(
    undefined,
  );

  if (isLoading) return <GroceryListsSkeleton />;

  if (isError) {
    return (
      <ErrorState
        title="Couldn't load your grocery lists"
        onRetry={() => void refetch()}
      />
    );
  }

  if (!lists || lists.length === 0) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="No lists yet"
        description="Start a shopping list for this week's groceries or an upcoming trip."
        module="grocery-lists"
        action={<Button onClick={onCreate}>New list</Button>}
      />
    );
  }

  return (
    <>
      <StaggerList className="gap-4 sm:grid-cols-2 lg:grid-cols-3 grid grid-cols-1">
        {lists.map((list) => (
          <StaggerItem key={list.id}>
            <GroceryListCard list={list} onEdit={setEditingList} />
          </StaggerItem>
        ))}
      </StaggerList>

      <GroceryListFormDialog
        open={!!editingList}
        onOpenChange={(open) => !open && setEditingList(undefined)}
        list={editingList}
      />
    </>
  );
}
