import type { GroceryList } from '@/features/grocery-lists/types';

function timestamp(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString();
}

function item(
  name: string,
  checked = false,
  category?: string,
  quantity?: string,
): GroceryList['items'][number] {
  return { id: crypto.randomUUID(), name, checked, category, quantity };
}

export function seedGroceryLists(): GroceryList[] {
  const base = (
    overrides: Partial<GroceryList> & Pick<GroceryList, 'title' | 'items'>,
  ): GroceryList =>
    ({
      id: crypto.randomUUID(),
      source: 'manual',
      createdAt: timestamp(-3),
      updatedAt: timestamp(-3),
      ...overrides,
    }) as GroceryList;

  return [
    base({
      title: 'Weekly groceries',
      items: [
        item('Milk', true, 'Dairy', '1 gal'),
        item('Eggs', true, 'Dairy', '1 dozen'),
        item('Spinach', false, 'Produce'),
        item('Chicken breast', false, 'Meat', '2 lb'),
        item('Rice', false, 'Pantry'),
        item('Olive oil', false, 'Pantry'),
      ],
    }),
    base({
      title: 'Denver offsite snacks',
      items: [
        item('Trail mix', false, 'Snacks'),
        item('Sparkling water', false, 'Drinks', '1 case'),
        item('Granola bars', false, 'Snacks'),
      ],
    }),
    base({
      title: 'Birthday dinner ingredients',
      items: [
        item('Salmon', false, 'Meat', '2 lb'),
        item('Asparagus', false, 'Produce'),
        item('Candles', false, 'Other'),
      ],
    }),
  ];
}
