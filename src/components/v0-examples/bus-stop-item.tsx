'use client';

import {
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Wifi,
  WifiOff,
  MapPin,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

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

interface BusStopItemProps {
  stop: BusStop;
  isExpanded: boolean;
  onToggleExpansion: () => void;
  onRouteSelect: (route: StopRoute) => void;
}

/**
 * BusStopItem Component
 *
 * TODO for your implementation:
 * - Replace StopRoute and BusStop interfaces with your Zod schemas
 * - Add real-time bus arrival updates using React Query
 * - Implement stop favoriting functionality
 * - Add stop facilities information (accessibility, amenities)
 * - Add nearby stops functionality
 */
export function BusStopItem({
  stop,
  isExpanded,
  onToggleExpansion,
  onRouteSelect,
}: BusStopItemProps) {
  const liveRoutesCount = stop.routes.filter((r) => r.isLive).length;

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggleExpansion}>
      <div className="border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-3 sm:p-4 cursor-pointer">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-blue-500" />
              <div>
                <h3 className="font-semibold text-base sm:text-lg">
                  {stop.name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500">
                  {stop.routes.length} route
                  {stop.routes.length !== 1 ? 's' : ''} • {liveRoutesCount} live
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-xs hidden sm:inline-flex"
              >
                Bus Stop
              </Badge>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Routes servicing this stop:
            </p>
            {stop.routes.map((route) => (
              <div
                key={route.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-lg border cursor-pointer hover:shadow-md transition-shadow gap-2 sm:gap-3"
                onClick={() => onRouteSelect(route)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {route.isLive ? (
                      <Wifi className="w-4 h-4 text-green-500" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="font-medium text-sm sm:text-base">
                      Route {route.routeNumber} {route.destination}
                    </span>
                  </div>
                  <Badge
                    variant={route.isLive ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {route.isLive ? 'Live' : 'Offline'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <div className="text-left sm:text-right">
                    <div className="text-sm font-medium">
                      Next bus: {route.nextBus}
                    </div>
                    <div className="text-xs text-gray-500">
                      {route.isLive
                        ? `Live tracking available`
                        : 'No live data'}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 hidden sm:block" />
                </div>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
