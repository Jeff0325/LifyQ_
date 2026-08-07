import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { subscriptionsRepository } from '@/features/subscriptions/repository';
import type {
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
} from '@/features/subscriptions/types';

export const subscriptionKeys = {
  all: ['subscriptions'] as const,
  lists: () => [...subscriptionKeys.all, 'list'] as const,
};

export function useSubscriptions() {
  return useQuery({
    queryKey: subscriptionKeys.lists(),
    queryFn: () => subscriptionsRepository.list(),
  });
}

export function useCreateSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSubscriptionInput) =>
      subscriptionsRepository.create(input),
    onSuccess: () =>
      void queryClient.invalidateQueries({
        queryKey: subscriptionKeys.lists(),
      }),
  });
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateSubscriptionInput;
    }) => subscriptionsRepository.update(id, input),
    onSuccess: () =>
      void queryClient.invalidateQueries({
        queryKey: subscriptionKeys.lists(),
      }),
  });
}

export function useDeleteSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => subscriptionsRepository.remove(id),
    onSuccess: () =>
      void queryClient.invalidateQueries({
        queryKey: subscriptionKeys.lists(),
      }),
  });
}
