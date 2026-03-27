import authClient from '@/helpers/auth';
import { useEffect, useState } from 'react';

export default function useFetchMembers(organizationId?: string) {
  const [members, setMembers] = useState<any[]>([]);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    async function fetchMembers() {
      if (!organizationId) {
        setMembers([]);
        return;
      }
      setIsPending(true);
      const { data, error } = await authClient.organization.listMembers({
        query: {
          organizationId,
        },
      });
      if (data && !error) {
        setMembers(data.members || []);
      }
      setIsPending(false);
    }
    fetchMembers();
  }, [organizationId]);

  return { members, isPending };
}
