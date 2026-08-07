import { z } from 'zod';

import type { BaseEntity } from '@/data/types';

export const GROCERY_LIST_SOURCES = ['manual', 'voice', 'ai'] as const;
export type GroceryListSource = (typeof GROCERY_LIST_SOURCES)[number];

export interface GroceryItem {
  id: string;
  name: string;
  category?: string;
  quantity?: string;
  checked: boolean;
}

export interface GroceryList extends BaseEntity {
  title: string;
  source: GroceryListSource;
  items: GroceryItem[];
}

export const groceryListFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(140),
});

export type GroceryListFormValues = z.infer<typeof groceryListFormSchema>;
export type CreateGroceryListInput = GroceryListFormValues;
export type UpdateGroceryListInput = Partial<
  Pick<GroceryList, 'title' | 'items'>
>;
