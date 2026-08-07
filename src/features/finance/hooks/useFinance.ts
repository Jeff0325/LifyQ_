import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  budgetsRepository,
  transactionsRepository,
} from '@/features/finance/repository';
import type {
  CreateBudgetInput,
  CreateTransactionInput,
  UpdateBudgetInput,
  UpdateTransactionInput,
} from '@/features/finance/types';

export const financeKeys = {
  transactions: ['finance', 'transactions'] as const,
  budgets: ['finance', 'budgets'] as const,
};

// Transactions
export function useTransactions() {
  return useQuery({
    queryKey: financeKeys.transactions,
    queryFn: () => transactionsRepository.list(),
  });
}
export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTransactionInput) =>
      transactionsRepository.create(input),
    onSuccess: () =>
      void queryClient.invalidateQueries({
        queryKey: financeKeys.transactions,
      }),
  });
}
export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateTransactionInput;
    }) => transactionsRepository.update(id, input),
    onSuccess: () =>
      void queryClient.invalidateQueries({
        queryKey: financeKeys.transactions,
      }),
  });
}
export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => transactionsRepository.remove(id),
    onSuccess: () =>
      void queryClient.invalidateQueries({
        queryKey: financeKeys.transactions,
      }),
  });
}

// Budgets
export function useBudgets() {
  return useQuery({
    queryKey: financeKeys.budgets,
    queryFn: () => budgetsRepository.list(),
  });
}
export function useCreateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBudgetInput) => budgetsRepository.create(input),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: financeKeys.budgets }),
  });
}
export function useUpdateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateBudgetInput }) =>
      budgetsRepository.update(id, input),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: financeKeys.budgets }),
  });
}
export function useDeleteBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => budgetsRepository.remove(id),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: financeKeys.budgets }),
  });
}
