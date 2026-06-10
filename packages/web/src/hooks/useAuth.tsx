import authClient from '@/helpers/auth';
import { useQuery } from '@tanstack/react-query';

export function useSession(staleTime = 1000 * 60 * 10) {
  return useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await authClient.getSession();
      return data;
    },
    staleTime: staleTime < 0 ? 0 : staleTime,
  });
}

export function useAccounts(staleTime = 1000 * 60 * 10) {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      // Use listAccounts based on Better Auth docs/types
      const { data } = await authClient.listAccounts();
      return data;
    },
    staleTime: staleTime < 0 ? 0 : staleTime,
  });
}
