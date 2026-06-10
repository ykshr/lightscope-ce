import authClient from '@/helpers/auth';
import { useQuery } from '@tanstack/react-query';

export function useSession(staleTime = 1000 * 60 * 10) {
  return useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await authClient.getSession({
        fetchOptions: {
          query: {
            includeAccounts: true,
          },
        },
      } as any);
      return data as typeof data & { session: { accounts?: { providerId: string }[] } };
    },
    staleTime: staleTime < 0 ? 0 : staleTime,
  });
}
