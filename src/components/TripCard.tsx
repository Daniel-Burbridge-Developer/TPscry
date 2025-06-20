import React from "react";
import { useTripLiveStatus } from "~/hooks/useTripLiveStatus";
import { Trip } from "~/schemas/index";
import { useTripLiveDetails } from "~/hooks/useTripLiveDetails";

interface TripCardProps {
  routeName: string;
  trip: Trip;
}

const TripCard = ({ trip, routeName }: TripCardProps) => {
  const { isLive, fleetId } = useTripLiveStatus(trip, routeName, {
    pollingIntervalMs: 10000,
  });

  const [isExpanded, setIsExpanded] = React.useState(false);

  const { isLoading: liveLoading } = useTripLiveDetails(fleetId, {
    enabled: isLive && !!fleetId && isExpanded,
    pollingIntervalMs: 10000,
  });

  return (
    <li className="relative flex flex-col rounded border border-muted bg-muted/50 p-2">
      <div className="flex items-center">
        <span className="font-medium text-primary">
          {trip.tripHeadsign ? `to ${trip.tripHeadsign}` : "No headsign"}
        </span>
        {isLive && (
          <span className="ml-2 inline-flex animate-pulse items-center rounded-full bg-green-500/80 px-2 py-0.5 text-[10px] font-semibold text-white shadow-md">
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

      <button
        className="absolute right-2 top-2 text-xs text-primary underline disabled:opacity-40"
        disabled={!isLive}
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded((prev) => !prev);
        }}
      >
        {isExpanded ? "Hide live progress" : "Show live progress"}
      </button>

      {isExpanded && (
        <div className="mt-3">
          {liveLoading && (
            <p className="text-xs text-muted-foreground">
              Loading live progress…
            </p>
          )}
        </div>
      )}
    </li>
  );
};

export default TripCard;
