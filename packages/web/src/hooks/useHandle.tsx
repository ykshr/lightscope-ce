import { useMatches } from 'react-router-dom';
import type { AppRouteHandle } from '@/types';

export function useHandle() {
  const matches = useMatches();

  const handle = matches.reduce(
    (prev, curr) => ({
      ...prev,
      ...(typeof curr.handle === 'object' && curr.handle !== null ? curr.handle : {}),
    }),
    {} as AppRouteHandle
  );

  return handle;
}
