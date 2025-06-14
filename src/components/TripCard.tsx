import { Trip } from '~/schemas/index';
import { useExternalStopData } from '~/hooks/useExternalStopData';
import { ExternalStopData } from '~/schemas/externalStopDataSchema';
import React, { useEffect, useMemo, useState } from 'react';

interface TripCardProps {
  routeName: string;
  trip: Trip;
}

const TripCard = ({ trip, routeName }: TripCardProps) => {
  // Build up to three candidate stop IDs: first, middle, last.
  const stopIds = useMemo(() => {
    const ids = trip.stops?.map((s) => s.id) ?? [];
    if (ids.length === 0) return [];
    const first = ids[0];
    const last = ids[ids.length - 1];
    const middle = ids[Math.floor(ids.length / 2)];
    // Deduplicate while preserving order
    return Array.from(new Set([first, middle, last]));
  }, [trip.stops]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const currentStopId = stopIds[currentIdx] ?? '';
  const [isLive, setIsLive] = useState(false);

  const { data: externalData } = useExternalStopData(currentStopId, {
    enabled: Boolean(currentStopId) && !isLive, // once live, stop fetching further
    refetchInterval: isLive ? undefined : 10000,
  });

  // Whenever we get data, determine live status or continue searching.
  useEffect(() => {
    if (!externalData) return;

    const liveFound = (externalData as ExternalStopData[]).some(
      (entry) => entry.busNumber === routeName && entry.liveStatus,
    );

    if (liveFound) {
      setIsLive(true);
    } else if (currentIdx + 1 < stopIds.length) {
      setCurrentIdx((idx) => idx + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalData]);

  return (
    <li className="p-2 rounded border border-muted bg-muted/50 flex flex-col relative">
      <div className="flex items-center">
        <span className="font-medium text-primary">
          {trip.tripHeadsign ? `to ${trip.tripHeadsign}` : 'No headsign'}
        </span>
        {isLive && (
          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-green-500/80 text-white text-[10px] font-semibold animate-pulse shadow-md">
            LIVE
          </span>
        )}
      </div>

      <span className="text-xs text-muted-foreground">Trip ID: {trip.id}</span>
      {trip.shapeId && (
        <span className="text-xs text-muted-foreground">
          Shape ID: {trip.shapeId}
        </span>
      )}
      {trip.stops && trip.stops.length > 0 && (
        <span className="text-xs text-muted-foreground">
          Stops: {trip.stops.length}
        </span>
      )}
    </li>
  );
};

export default TripCard;
