'use client';

import {
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

// TODO: Replace with your Zod schema types
interface Route {
  id: string;
  destination: string;
  isLive: boolean;
  progress: number;
  nextStop: string;
  eta: string;
}

interface Bus {
  id: string;
  name: string;
  routes: Route[];
}

interface BusRouteItemProps {
  bus: Bus;
  isExpanded: boolean;
  onToggleExpansion: () => void;
  onRouteSelect: (route: Route) => void;
}

/**
 * BusRouteItem Component
 *
 * TODO for your implementation:
 * - Replace Route and Bus interfaces with your Zod schemas
 * - Add real-time status updates using React Query
 * - Implement route favoriting functionality
 * - Add accessibility improvements (ARIA labels, keyboard navigation)
 */
export function BusRouteItem({
  bus,
  isExpanded,
  onToggleExpansion,
  onRouteSelect,
}: BusRouteItemProps) {
  const liveRoutesCount = bus.routes.filter((r) => r.isLive).length;

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggleExpansion}>
      <div className="border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-3 sm:p-4 cursor-pointer">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-base sm:text-lg">{bus.name}</h3>
              <Badge variant="outline" className="text-xs">
                {bus.routes.length} route{bus.routes.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <div className="text-sm text-gray-500">
                  {liveRoutesCount} live
                </div>
              </div>
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
            {bus.routes.map((route) => (
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
                      {route.destination}
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
                    <div className="text-sm font-medium">{route.nextStop}</div>
                    <div className="text-xs text-gray-500">
                      ETA: {route.eta}
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
