import { useEffect, useMemo, useState } from 'react';
import { Trip } from '~/schemas/index';
import { useExternalStopData } from '~/hooks/useExternalStopData';
import { ExternalStopData } from '~/schemas/externalStopDataSchema';

interface UseTripLiveStatusOptions {
  pollingIntervalMs?: number;
}

/**
 * Determines whether a trip is currently live.
 *
 * Strategy: query external stop-data for up to three stops (first, middle, last)
 * sequentially.  Poll each stop until either:
 *   a) We get a matching live record → return true and stop further requests.
 *   b) Not live → advance to the next stop ID (max three requests).
 * The hook stops polling once live status is confirmed.
 */
export const useTripLiveStatus = (
  trip: Trip,
  routeName: string,
  { pollingIntervalMs = 10000 }: UseTripLiveStatusOptions = {},
) => {
  // Build candidate stop IDs.
  const stopIds = useMemo(() => {
    const ids = trip.stops?.map((s) => s.id) ?? [];
    if (ids.length === 0) return [] as string[];
    const first = ids[0];
    const last = ids[ids.length - 1];
    const middle = ids[Math.floor(ids.length / 2)];
    return Array.from(new Set([first, middle, last]));
  }, [trip.stops]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [isLive, setIsLive] = useState(false);
  const [fleetId, setFleetId] = useState<string | null>(null);

  const currentStopId = stopIds[currentIdx] ?? '';

  // Fetch external data for the current stop.
  const { data: externalData } = useExternalStopData(currentStopId, {
    enabled: Boolean(currentStopId),
    // poll slower after live found
    refetchInterval: isLive
      ? Math.max(pollingIntervalMs * 3, 30000)
      : pollingIntervalMs,
  });

  // Evaluate response.
  useEffect(() => {
    if (!externalData) return;

    let liveRecord: ExternalStopData | undefined;
    if (Array.isArray(externalData)) {
      liveRecord = (externalData as ExternalStopData[]).find(
        (entry) => entry.busNumber === routeName && entry.liveStatus,
      );
    }

    if (liveRecord) {
      setIsLive(true);
      setFleetId(liveRecord.fleetId ?? null);
    } else if (currentIdx + 1 < stopIds.length) {
      setCurrentIdx((idx) => idx + 1);
    }
  }, [externalData, routeName, currentIdx, stopIds.length]);

  // Reset when the trip or routeName changes.
  useEffect(() => {
    setIsLive(false);
    setFleetId(null);
    setCurrentIdx(0);
  }, [trip.id, routeName]);

  return { isLive, fleetId };
};
