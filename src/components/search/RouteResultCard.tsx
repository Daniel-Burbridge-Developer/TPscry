import { useState, useCallback } from "react";
import { Route as RouteType } from "~/schemas/routeSchema";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { useRouteTripsQuery } from "~/hooks/useRouteTripsQuery";
import TripResultCard from "./TripResultCard";

interface RouteResultItemProps {
  route: RouteType;
}

export const RouteResultItem = ({ route }: RouteResultItemProps) => {
  const routeName = route.longName || route.shortName || "Unnamed Route";
  const [isExpanded, setIsExpanded] = useState(false);

  // Keep a Set of live trip IDs so we can easily derive the total.
  const [liveTripIds, setLiveTripIds] = useState<Set<string>>(new Set());

  // Memo-safe callback that children can call whenever their live status changes
  const handleLiveStatusChange = useCallback(
    (tripId: string, isLive: boolean) => {
      setLiveTripIds((prev) => {
        const next = new Set(prev);
        if (isLive) {
          next.add(tripId);
        } else {
          next.delete(tripId);
        }
        return next;
      });
    },
    [],
  );

  const { data: trips } = useRouteTripsQuery(route.id);

  // Child to determine if live, callback to update total live trips
  const totalLiveTrips = liveTripIds.size;

  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={() => setIsExpanded(!isExpanded)}
    >
      <div className="rounded-lg border transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between rounded-lg p-2 dark:bg-gray-900">
            <span className="font-medium">{`BUS ${routeName} - ${route.id}`}</span>
            <span className="ml-4 text-xs text-gray-500 dark:text-gray-400">
              {`BUS ${routeName} (${route.id})`}
            </span>
            {totalLiveTrips > 0 && (
              <span className="ml-auto text-xs font-semibold text-green-600 dark:text-green-400">
                {totalLiveTrips} live
              </span>
            )}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent forceMount>
          <div
            className={`flex-col justify-between rounded-lg p-2 dark:bg-gray-900 ${
              isExpanded ? "" : "hidden"
            }`}
          >
            {trips?.map((trip) => (
              <TripResultCard
                key={trip.id}
                trip={trip}
                routeName={routeName}
                onLiveStatusChange={handleLiveStatusChange}
              />
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
