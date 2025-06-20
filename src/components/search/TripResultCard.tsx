import { useEffect } from "react";
import { Trip } from "~/schemas/tripSchema";
import { useTripLiveStatus } from "~/hooks/useTripLiveStatus";
import { useTripLiveDetails } from "~/hooks/useTripLiveDetails";
import { Wifi, WifiOff, ChevronRight } from "lucide-react";
import { Badge } from "~/components/ui/badge";

interface TripResultCardProps {
  trip: Trip;
  /**
   * The human-readable route name (short or long) – required by the live-status hook.
   */
  routeName: string;
  /**
   * Callback so the parent component can keep track of how many trips are live.
   * Receives the trip id and whether it is currently live.
   */
  onLiveStatusChange: (tripId: string, isLive: boolean) => void;
}

const TripResultCard = ({
  trip,
  routeName,
  onLiveStatusChange,
}: TripResultCardProps) => {
  // Query whether this trip is currently live (polls every 10s by default)
  const { isLive, fleetId } = useTripLiveStatus(trip, routeName);

  // Fetch more granular live-trip details (next stop + ETA) only when live and fleetId known
  const { nextStop } = useTripLiveDetails(fleetId, {
    enabled: isLive && !!fleetId,
  });

  // Inform the parent whenever the live-status for this trip changes
  useEffect(() => {
    onLiveStatusChange(trip.id, isLive);
  }, [isLive, onLiveStatusChange, trip.id]);

  return (
    <div className="flex cursor-pointer flex-col justify-between gap-2 rounded-lg border bg-white p-3 transition-shadow hover:shadow-md dark:bg-gray-900 sm:flex-row sm:items-center sm:gap-3">
      {/* Left section: status icon + destination + badge */}
      <div className="flex items-center gap-3">
        {isLive ? (
          <Wifi className="h-4 w-4 text-green-500" />
        ) : (
          <WifiOff className="h-4 w-4 text-gray-400" />
        )}
        <span className="text-sm font-medium sm:text-base">
          {trip.tripHeadsign ?? "Unknown"}
        </span>
        <Badge variant={isLive ? "default" : "secondary"} className="text-xs">
          {isLive ? "Live" : "Offline"}
        </Badge>
      </div>

      {/* Right section: next stop + ETA + chevron */}
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <div className="text-left sm:text-right">
          <div className="text-sm font-medium">
            {nextStop?.stopName ?? "Not in service"}
          </div>
          <div className="text-xs text-gray-500">
            ETA: {nextStop?.time ?? "N/A"}
          </div>
        </div>
        <ChevronRight className="hidden h-4 w-4 text-gray-400 sm:block" />
      </div>
    </div>
  );
};

export default TripResultCard;
