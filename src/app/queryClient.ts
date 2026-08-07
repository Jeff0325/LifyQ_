import { QueryClient } from '@tanstack/react-query';

/**
 * Single app-wide QueryClient. Short default staleTime reflects that this
 * is personal, frequently-changing data — see
 * docs/14_State_Management_Strategy.md §2.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
