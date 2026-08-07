import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { billsRepository } from '@/features/bills/repository';
import type {
  Bill,
  CreateBillInput,
  UpdateBillInput,
} from '@/features/bills/types';
import { todayIso } from '@/lib/date';

export const billKeys = {
  all: ['bills'] as const,
  lists: () => [...billKeys.all, 'list'] as const,
};

export function useBills() {
  return useQuery({
    queryKey: billKeys.lists(),
    queryFn: () => billsRepository.list(),
  });
}

export function useCreateBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBillInput) => billsRepository.create(input),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: billKeys.lists() }),
  });
}

export function useUpdateBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateBillInput }) =>
      billsRepository.update(id, input),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: billKeys.lists() }),
  });
}

export function useDeleteBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => billsRepository.remove(id),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: billKeys.lists() }),
  });
}

/** Toggle paid/unpaid — paid appends today's entry to `paidHistory`, unpaid just flips status back. */
export function useToggleBillPaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bill }: { bill: Bill }) => {
      const nowPaid = bill.status !== 'paid';
      return billsRepository.update(bill.id, {
        status: nowPaid ? 'paid' : 'unpaid',
        paidHistory: nowPaid
          ? [
              ...bill.paidHistory,
              { date: todayIso(), amount: bill.amount ?? 0 },
            ]
          : bill.paidHistory,
      });
    },
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: billKeys.lists() }),
  });
}
