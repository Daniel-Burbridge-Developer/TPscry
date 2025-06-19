import { useState } from "react";
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

  const { data: trips } = useRouteTripsQuery(route.id);

  // Child to determine if live, callback to update total live trips

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
              {`BUS ${routeName} (${route.id}`}
            </span>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="flex-col justify-between rounded-lg p-2 dark:bg-gray-900">
            {trips?.map((trip) => (
              <TripResultCard key={trip.id} trip={trip} isLive={() => false} />
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
