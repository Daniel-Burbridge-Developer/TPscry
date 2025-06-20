import { ExternalStopData } from "~/schemas/externalStopDataSchema";
import { Wifi, WifiOff, ChevronRight } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Link } from "@tanstack/react-router";

interface StopArrivalCardProps {
  arrival: ExternalStopData;
}

const StopArrivalCard = ({ arrival }: StopArrivalCardProps) => {
  const { liveStatus, busNumber, timeUntilArrival, destination, fleetId } =
    arrival;

  // Prepare the card content so we can optionally wrap it with a Link
  const cardContent = (
    <div className="flex cursor-pointer flex-col justify-between gap-2 rounded-lg border bg-white p-3 transition-shadow hover:shadow-md dark:bg-gray-900 sm:flex-row sm:items-center sm:gap-3">
      {/* Left section: live icon + bus number + badge */}
      <div className="flex items-center gap-3">
        {liveStatus ? (
          <Wifi className="h-4 w-4 text-green-500" />
        ) : (
          <WifiOff className="h-4 w-4 text-gray-400" />
        )}
        <span className="text-sm font-medium sm:text-base">
          Bus {busNumber}
        </span>
        {liveStatus && !fleetId ? (
          <Badge variant="destructive" className="text-xs">
            Tracking not available
          </Badge>
        ) : (
          <Badge
            variant={liveStatus ? "default" : "secondary"}
            className="text-xs"
          >
            {liveStatus && fleetId ? "Live Track" : "Offline"}
          </Badge>
        )}
      </div>

      {/* Right section: destination + ETA + chevron */}
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <div className="text-left sm:text-right">
          <div className="text-sm font-medium">{destination}</div>
          <div className="text-xs text-gray-500">ETA: {timeUntilArrival}</div>
        </div>
        {liveStatus && fleetId && (
          <ChevronRight className="hidden h-4 w-4 text-gray-400 sm:block" />
        )}
      </div>
    </div>
  );

  // If the arrival has live status and a fleetId, make the whole card clickable
  return liveStatus && fleetId ? (
    <Link to="/livetrack/fleet/$fleetId" params={{ fleetId }} className="block">
      {cardContent}
    </Link>
  ) : (
    cardContent
  );
};

export default StopArrivalCard;
