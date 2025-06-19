"use client";

import {
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Wifi,
  WifiOff,
  MapPin,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// TODO: Replace with your Zod schema types
interface StopRoute {
  id: string;
  routeNumber: string;
  destination: string;
  isLive: boolean;
  progress: number;
  nextBus: string;
  eta: string;
}

interface BusStop {
  id: string;
  name: string;
  type: string;
  routes: StopRoute[];
}

interface BusStopCardProps {
  stop: BusStop;
  isExpanded: boolean;
  onToggleExpansion: () => void;
  onRouteSelect: (route: StopRoute) => void;
}

/**
 * BusStopCard Component
 *
 * TODO for your implementation:
 * - Replace StopRoute and BusStop interfaces with your Zod schemas
 * - Add real-time bus arrival updates using React Query
 * - Implement stop favoriting functionality
 * - Add stop facilities information (accessibility, amenities)
 * - Add nearby stops functionality
 */
export function BusStopCard({
  stop,
  isExpanded,
  onToggleExpansion,
  onRouteSelect,
}: BusStopCardProps) {
  const liveRoutesCount = stop.routes.filter((r) => r.isLive).length;

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggleExpansion}>
      <div className="rounded-lg border transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
        <CollapsibleTrigger asChild>
          <div className="flex cursor-pointer items-center justify-between p-3 sm:p-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="text-base font-semibold sm:text-lg">
                  {stop.name}
                </h3>
                <p className="text-xs text-gray-500 sm:text-sm">
                  {stop.routes.length} route
                  {stop.routes.length !== 1 ? "s" : ""} • {liveRoutesCount} live
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="hidden text-xs sm:inline-flex"
              >
                Bus Stop
              </Badge>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-2 px-3 pb-3 sm:px-4 sm:pb-4">
            <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
              Routes servicing this stop:
            </p>
            {stop.routes.map((route) => (
              <div
                key={route.id}
                className="flex cursor-pointer flex-col justify-between gap-2 rounded-lg border bg-white p-3 transition-shadow hover:shadow-md dark:bg-gray-900 sm:flex-row sm:items-center sm:gap-3"
                onClick={() => onRouteSelect(route)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {route.isLive ? (
                      <Wifi className="h-4 w-4 text-green-500" />
                    ) : (
                      <WifiOff className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="text-sm font-medium sm:text-base">
                      Route {route.routeNumber} {route.destination}
                    </span>
                  </div>
                  <Badge
                    variant={route.isLive ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {route.isLive ? "Live" : "Offline"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <div className="text-left sm:text-right">
                    <div className="text-sm font-medium">
                      Next bus: {route.nextBus}
                    </div>
                    <div className="text-xs text-gray-500">
                      {route.isLive
                        ? `Live tracking available`
                        : "No live data"}
                    </div>
                  </div>
                  <ChevronRight className="hidden h-4 w-4 text-gray-400 sm:block" />
                </div>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
