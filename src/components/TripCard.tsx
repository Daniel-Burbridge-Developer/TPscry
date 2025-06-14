import React from 'react';
import { useTripLiveStatus } from '~/hooks/useTripLiveStatus';
import { Trip } from '~/schemas/index';

interface TripCardProps {
  routeName: string;
  trip: Trip;
}

const TripCard = ({ trip, routeName }: TripCardProps) => {
  const { isLive, fleetId } = useTripLiveStatus(trip, routeName, {
    pollingIntervalMs: 10000,
  });

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
