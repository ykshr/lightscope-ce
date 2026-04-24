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
