import { useEffect } from "react";
import { Trip } from "~/schemas/tripSchema";
import { useTripLiveStatus } from "~/hooks/useTripLiveStatus";

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
  const { isLive } = useTripLiveStatus(trip, routeName);

  // Inform the parent whenever the live-status for this trip changes
  useEffect(() => {
    onLiveStatusChange(trip.id, isLive);
  }, [isLive, onLiveStatusChange, trip.id]);

  return (
    <div className="flex items-center justify-between rounded-lg p-2 dark:bg-gray-900">
      <span className="font-medium">{trip.id}</span>
      {isLive && (
        <span className="text-xs font-semibold text-green-600 dark:text-green-400">
          LIVE
        </span>
      )}
    </div>
  );
};

export default TripResultCard;
