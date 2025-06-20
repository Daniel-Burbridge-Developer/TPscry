import { useState, useCallback } from "react";
import { Route as RouteType } from "~/schemas/routeSchema";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { useRouteTripsQuery } from "~/hooks/useRouteTripsQuery";
import TripResultCard from "./TripResultCard";
import { Badge } from "~/components/ui/badge";
import { ChevronUp, ChevronDown } from "lucide-react";

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
          <div className="flex cursor-pointer items-center justify-between p-3 sm:p-4">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-semibold sm:text-lg">
                Route {routeName}
              </h3>
              {trips && (
                <Badge variant="outline" className="text-xs">
                  {trips.length} route{trips.length !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {totalLiveTrips > 0 && (
                <div className="hidden text-right sm:block">
                  <div className="text-sm text-gray-500">
                    {totalLiveTrips} live
                  </div>
                </div>
              )}
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </div>
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
