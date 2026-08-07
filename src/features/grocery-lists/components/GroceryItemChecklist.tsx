import { Plus, X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  useAddGroceryItem,
  useRemoveGroceryItem,
  useToggleGroceryItem,
} from '@/features/grocery-lists/hooks/useGroceryLists';
import type { GroceryList } from '@/features/grocery-lists/types';
import { cn } from '@/lib/utils';

export interface GroceryItemChecklistProps {
  list: GroceryList;
}

export function GroceryItemChecklist({ list }: GroceryItemChecklistProps) {
  const addItem = useAddGroceryItem();
  const toggleItem = useToggleGroceryItem();
  const removeItem = useRemoveGroceryItem();
  const [newItemName, setNewItemName] = useState('');

  const handleAdd = () => {
    const name = newItemName.trim();
    if (!name) return;
    addItem.mutate({ list, name });
    setNewItemName('');
  };

  return (
    <div className="gap-3 flex flex-col">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleAdd();
        }}
        className="gap-2 flex items-center"
      >
        <Input
          value={newItemName}
          onChange={(event) => setNewItemName(event.target.value)}
          placeholder="Add an item…"
          aria-label="Add an item"
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={!newItemName.trim()}>
          <Plus aria-hidden="true" />
        </Button>
      </form>

      {list.items.length === 0 ? (
        <p className="py-4 text-center text-body-sm text-foreground-tertiary">
          No items yet — add the first one above.
        </p>
      ) : (
        <ul className="gap-1 flex flex-col">
          {list.items.map((item) => (
            <li
              key={item.id}
              className="gap-3 px-1 py-2 flex items-center rounded-md hover:bg-surface-raised"
            >
              <Checkbox
                checked={item.checked}
                onCheckedChange={() =>
                  toggleItem.mutate({ list, itemId: item.id })
                }
                aria-label={`Mark ${item.name} as ${item.checked ? 'not done' : 'done'}`}
              />
              <span
                className={cn(
                  'min-w-0 flex-1 truncate text-body-sm text-foreground',
                  item.checked && 'text-foreground-tertiary line-through',
                )}
              >
                {item.name}
                {item.quantity && (
                  <span className="text-foreground-tertiary">
                    {' '}
                    · {item.quantity}
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={() => removeItem.mutate({ list, itemId: item.id })}
                aria-label={`Remove ${item.name}`}
                className="size-7 flex shrink-0 items-center justify-center rounded-md text-foreground-tertiary hover:text-danger focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <X aria-hidden="true" className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
