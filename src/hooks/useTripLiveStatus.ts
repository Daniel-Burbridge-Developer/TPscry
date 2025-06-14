import { useMemo } from 'react';
import { Trip } from '~/schemas/index';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getExternalStopDataQuery } from '~/lib/queries/externalStopData';
import { ExternalStopData } from '~/schemas/externalStopDataSchema';

interface UseTripLiveStatusOptions {
  pollingIntervalMs?: number;
}

export const useTripLiveStatus = (
  trip: Trip,
  routeName: string,
  { pollingIntervalMs = 10000 }: UseTripLiveStatusOptions = {},
) => {
  const stopIds = useMemo(() => {
    const ids = trip.stops?.map((s) => s.id) ?? [];
    if (ids.length === 0) return [] as string[];
    const first = ids[0];
    const last = ids[ids.length - 1];
    const middle = ids[Math.floor(ids.length / 2)];
    return Array.from(new Set([first, middle, last]));
  }, [trip.stops]);

  const queryClient = useQueryClient();

  const queryResult = useQuery<{ isLive: boolean; fleetId: string | null }>({
    queryKey: ['trip-live-status', trip.id, routeName],
    queryFn: async () => {
      for (const stopId of stopIds) {
        if (!stopId) continue;

        const { queryKey, queryFn } = getExternalStopDataQuery(stopId);

        const data = await queryClient.fetchQuery({ queryKey, queryFn });

        const liveRecord = (data as ExternalStopData[]).find(
          (entry) => entry.busNumber === routeName && entry.liveStatus,
        );

        if (liveRecord) {
          return { isLive: true, fleetId: liveRecord.fleetId ?? null };
        }
      }
      return { isLive: false, fleetId: null };
    },
    enabled: stopIds.length > 0,
    refetchInterval: pollingIntervalMs,
    staleTime: pollingIntervalMs,
  });

  return queryResult.data ?? { isLive: false, fleetId: null };
};
