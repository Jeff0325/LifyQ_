import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { groceryListsRepository } from '@/features/grocery-lists/repository';
import type {
  CreateGroceryListInput,
  GroceryList,
  UpdateGroceryListInput,
} from '@/features/grocery-lists/types';

export const groceryListKeys = {
  all: ['grocery-lists'] as const,
  lists: () => [...groceryListKeys.all, 'list'] as const,
  detail: (id: string) => [...groceryListKeys.all, 'detail', id] as const,
};

export function useGroceryLists() {
  return useQuery({
    queryKey: groceryListKeys.lists(),
    queryFn: () => groceryListsRepository.list(),
  });
}

export function useGroceryList(id: string | undefined) {
  return useQuery({
    queryKey: groceryListKeys.detail(id ?? ''),
    queryFn: () => groceryListsRepository.get(id!),
    enabled: !!id,
  });
}

function invalidateList(
  queryClient: ReturnType<typeof useQueryClient>,
  list: GroceryList,
) {
  void queryClient.invalidateQueries({ queryKey: groceryListKeys.lists() });
  queryClient.setQueryData(groceryListKeys.detail(list.id), list);
}

export function useCreateGroceryList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateGroceryListInput) =>
      groceryListsRepository.create(input),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: groceryListKeys.lists() }),
  });
}

export function useDeleteGroceryList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => groceryListsRepository.remove(id),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: groceryListKeys.lists() }),
  });
}

export function useUpdateGroceryList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateGroceryListInput;
    }) => groceryListsRepository.update(id, input),
    onSuccess: (list) => invalidateList(queryClient, list),
  });
}

export function useAddGroceryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ list, name }: { list: GroceryList; name: string }) =>
      groceryListsRepository.update(list.id, {
        items: [
          ...list.items,
          { id: crypto.randomUUID(), name, checked: false },
        ],
      }),
    onSuccess: (list) => invalidateList(queryClient, list),
  });
}

export function useToggleGroceryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ list, itemId }: { list: GroceryList; itemId: string }) =>
      groceryListsRepository.update(list.id, {
        items: list.items.map((item) =>
          item.id === itemId ? { ...item, checked: !item.checked } : item,
        ),
      }),
    onSuccess: (list) => invalidateList(queryClient, list),
  });
}

export function useRemoveGroceryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ list, itemId }: { list: GroceryList; itemId: string }) =>
      groceryListsRepository.update(list.id, {
        items: list.items.filter((item) => item.id !== itemId),
      }),
    onSuccess: (list) => invalidateList(queryClient, list),
  });
}
