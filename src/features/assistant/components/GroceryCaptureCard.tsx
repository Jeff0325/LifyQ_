import { X } from 'lucide-react';
import { useState } from 'react';

import { ResponsiveFormSheet } from '@/components/shared/ResponsiveFormSheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CaptureProposal } from '@/features/assistant/types';
import {
  useAddGroceryItem,
  useCreateGroceryList,
  useGroceryLists,
} from '@/features/grocery-lists';
import { useToast } from '@/hooks/useToast';

const NEW_LIST_VALUE = '__new__';

export interface GroceryCaptureCardProps {
  /** Every `grocery-list-item` proposal from one capture, batched — there's no single-entity dialog to delegate to (docs/35_Intelligent_Capture_Engine_Spec.md §7). */
  proposals: CaptureProposal[];
  onDone: () => void;
  onSaved?: (label: string) => void;
}

/**
 * The one confirmation surface that isn't a delegated existing FormDialog —
 * grocery items are naturally a batch from one capture ("buy coffee and
 * chicken tomorrow"), so this orchestrates the existing
 * `useCreateGroceryList`/`useAddGroceryItem` hooks directly rather than
 * introducing a new mutation. See docs/34_AI_Architecture.md §2 — still no
 * write happens until Confirm.
 */
export function GroceryCaptureCard({
  proposals,
  onDone,
  onSaved,
}: GroceryCaptureCardProps) {
  const { data: lists } = useGroceryLists();
  const createList = useCreateGroceryList();
  const addItem = useAddGroceryItem();
  const { toast } = useToast();

  const [items, setItems] = useState(() =>
    proposals.map((proposal) => ({
      id: crypto.randomUUID(),
      name:
        typeof proposal.fields.name === 'string' ? proposal.fields.name : '',
    })),
  );
  const [targetListId, setTargetListId] = useState<string>(NEW_LIST_VALUE);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateItem = (id: string, name: string) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, name } : item)),
    );
  };
  const removeItem = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const validNames = items.map((item) => item.name.trim()).filter(Boolean);

  const handleConfirm = async () => {
    if (validNames.length === 0) {
      onDone();
      return;
    }
    setIsSubmitting(true);
    try {
      let currentList =
        targetListId === NEW_LIST_VALUE
          ? await createList.mutateAsync({ title: 'Grocery list' })
          : lists?.find((l) => l.id === targetListId);
      if (!currentList) throw new Error('No target list');

      // Threads each mutation's returned (updated) list into the next
      // iteration — reusing the same pre-loop `list` reference for every
      // `addItem` call would have each write start from the same stale
      // `items` array, so only the last item would survive.
      for (const name of validNames) {
        currentList = await addItem.mutateAsync({ list: currentList, name });
      }
      toast({
        variant: 'success',
        title: `${validNames.length} item${validNames.length === 1 ? '' : 's'} added`,
      });
      onSaved?.(
        `${validNames.length} item${validNames.length === 1 ? '' : 's'} to ${currentList.title}`,
      );
      onDone();
    } catch {
      toast({
        variant: 'danger',
        title: "Couldn't add items",
        description: 'Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ResponsiveFormSheet
      open
      onOpenChange={(open) => {
        if (!open) onDone();
      }}
      title="New grocery items"
      description="Jarvis understood this as a grocery list."
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            onClick={onDone}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={isSubmitting || validNames.length === 0}
          >
            Add {validNames.length} item{validNames.length === 1 ? '' : 's'}
          </Button>
        </>
      }
    >
      <div className="gap-4 flex flex-col">
        <div className="gap-1.5 flex flex-col">
          <Label htmlFor="grocery-target-list">Add to</Label>
          <Select value={targetListId} onValueChange={setTargetListId}>
            <SelectTrigger id="grocery-target-list">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NEW_LIST_VALUE}>New list</SelectItem>
              {(lists ?? []).map((list) => (
                <SelectItem key={list.id} value={list.id}>
                  {list.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="gap-2 flex flex-col">
          {items.map((item) => (
            <div key={item.id} className="gap-2 flex items-center">
              <Input
                value={item.name}
                onChange={(e) => updateItem(item.id, e.target.value)}
                aria-label="Item name"
              />
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                aria-label={`Remove ${item.name || 'item'}`}
                className="size-8 flex shrink-0 items-center justify-center rounded-md text-foreground-tertiary hover:text-danger focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </ResponsiveFormSheet>
  );
}
