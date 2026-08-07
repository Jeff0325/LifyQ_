import { Plus } from 'lucide-react';
import { useState } from 'react';

import { PageContainer } from '@/components/shared/PageContainer';
import { Button } from '@/components/ui/button';
import { useJarvisPageContext } from '@/features/assistant/hooks/useJarvisPageContext';
import {
  GroceryListFormDialog,
  GroceryListsGrid,
} from '@/features/grocery-lists';

export function GroceryLists() {
  const [formOpen, setFormOpen] = useState(false);
  useJarvisPageContext(
    'Grocery Lists',
    'your grocery lists',
    'grocery-list-item',
  );

  return (
    <PageContainer size="lg" className="gap-4 flex flex-col">
      <div className="gap-3 flex items-center justify-between">
        <h2 className="font-semibold text-h2 text-foreground">Grocery Lists</h2>
        <Button onClick={() => setFormOpen(true)} size="sm">
          <Plus aria-hidden="true" />
          New list
        </Button>
      </div>

      <GroceryListsGrid onCreate={() => setFormOpen(true)} />

      <GroceryListFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </PageContainer>
  );
}
