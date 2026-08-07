import { createSupabaseRepository } from '@/data/createSupabaseRepository';
import type { Repository } from '@/data/types';
import type {
  CreateGroceryListInput,
  GroceryItem,
  GroceryList,
  UpdateGroceryListInput,
} from '@/features/grocery-lists/types';

export type GroceryListsRepository = Repository<
  GroceryList,
  CreateGroceryListInput,
  UpdateGroceryListInput
>;

function fromRow(row: Record<string, unknown>): GroceryList {
  return {
    id: row.id as string,
    title: row.title as string,
    source: row.source as GroceryList['source'],
    items: (row.items as GroceryItem[] | null) ?? [],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export const groceryListsRepository: GroceryListsRepository =
  createSupabaseRepository<
    GroceryList,
    CreateGroceryListInput,
    UpdateGroceryListInput
  >({
    table: 'grocery_lists',
    fromRow,
    toInsertRow: (input) => ({
      title: input.title,
      source: 'manual',
      items: [],
    }),
    toUpdateRow: (input) => ({
      ...(input.title !== undefined && { title: input.title }),
      ...(input.items !== undefined && { items: input.items }),
    }),
  });
