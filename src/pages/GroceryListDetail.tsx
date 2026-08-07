import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { ErrorState } from '@/components/shared/ErrorState';
import { PageContainer } from '@/components/shared/PageContainer';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/constants/routes';
import { useJarvisPageContext } from '@/features/assistant/hooks/useJarvisPageContext';
import {
  GroceryItemChecklist,
  useDeleteGroceryList,
  useGroceryList,
} from '@/features/grocery-lists';
import { useToast } from '@/hooks/useToast';

export function GroceryListDetail() {
  const { listId } = useParams<{ listId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: list, isLoading, isError, refetch } = useGroceryList(listId);
  const deleteList = useDeleteGroceryList();
  const [confirmOpen, setConfirmOpen] = useState(false);

  // docs/41 — see the identical pattern/rationale in GoalDetail.tsx.
  useJarvisPageContext(
    'the grocery list',
    list
      ? `"${list.title}" with ${list.items.length} item${
          list.items.length === 1 ? '' : 's'
        }`
      : null,
  );

  if (isLoading) {
    return (
      <PageContainer size="sm" className="gap-4 flex flex-col">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </PageContainer>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Couldn't load this list"
        onRetry={() => void refetch()}
      />
    );
  }

  if (!list) {
    return (
      <ErrorState
        title="List not found"
        description="It may have been deleted."
        action={
          <Button
            variant="secondary"
            onClick={() => navigate(ROUTES.groceryLists)}
          >
            Back to Grocery Lists
          </Button>
        }
      />
    );
  }

  const handleDelete = async () => {
    await deleteList.mutateAsync(list.id);
    toast({ variant: 'success', title: 'List deleted' });
    navigate(ROUTES.groceryLists);
  };

  return (
    <PageContainer size="sm" className="gap-6 flex flex-col">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              href={ROUTES.groceryLists}
              onClick={(e) => {
                e.preventDefault();
                navigate(ROUTES.groceryLists);
              }}
            >
              Grocery Lists
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{list.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="gap-3 flex items-center justify-between">
        <h1 className="font-semibold text-h1 text-foreground">{list.title}</h1>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Delete list"
          onClick={() => setConfirmOpen(true)}
        >
          <Trash2 aria-hidden="true" />
        </Button>
      </div>

      <GroceryItemChecklist list={list} />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this list?"
        description={`"${list.title}" and its items will be removed. This can't be undone.`}
        confirmLabel="Delete"
        destructive
        loading={deleteList.isPending}
        onConfirm={handleDelete}
      />
    </PageContainer>
  );
}
