import { fetchGet } from '@/helpers/fetch';
import { useEffect, useState } from 'react';

type Tracker = {
  id: string;
  origin: string;
  token: string;
  notBefore: Date;
  issuedAt: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export default function useTrackers(organizationId: string) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const reFetchTrackers = () => setRefreshTrigger((prev) => prev + 1);

  const [trackers, setTrackers] = useState<Tracker[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetch() {
      if (!organizationId) {
        setTrackers([]);
        return;
      }
      setIsPending(true);
      try {
        const { trackers } = await fetchGet('/tracker');
        const formattedTrackers = trackers.map((tracker: any) => ({
          ...tracker,
          notBefore: new Date(tracker.notBefore),
          issuedAt: new Date(tracker.issuedAt),
          expiresAt: tracker.expiresAt ? new Date(tracker.expiresAt) : undefined,
          createdAt: new Date(tracker.createdAt),
          updatedAt: new Date(tracker.updatedAt),
        }));
        setTrackers(formattedTrackers);
      } catch (err: any) {
        setError(err || 'An error occurred');
      } finally {
        setIsPending(false);
      }
    }
    fetch();
  }, [organizationId, refreshTrigger]);

  return { trackers, error, isPending, reFetchTrackers };
}
