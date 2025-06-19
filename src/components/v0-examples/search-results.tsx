"use client";

import { Route, MapPin, ChevronUp, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { BusRouteItem } from "./bus-route-card";
import { BusStopItem } from "./bus-stop-item";

// TODO: Replace with your Zod schema types
interface SearchResults {
  buses: any[];
  stops: any[];
}

interface SearchResultsProps {
  searchResults: SearchResults;
  busRoutesExpanded: boolean;
  busStopsExpanded: boolean;
  expandedBuses: Set<string>;
  expandedStops: Set<string>;
  onToggleBusRoutesExpansion: () => void;
  onToggleBusStopsExpansion: () => void;
  onToggleBusExpansion: (busId: string) => void;
  onToggleStopExpansion: (stopId: string) => void;
  onRouteSelect: (route: any) => void;
}

/**
 * SearchResults Component
 *
 * TODO for your implementation:
 * - Replace SearchResults interface with your Zod schema
 * - Add loading states while fetching search results
 * - Add error handling for failed searches
 * - Implement search result caching with React Query
 * - Add search analytics/tracking
 * - Add "No results found" state
 */
export function SearchResults({
  searchResults,
  busRoutesExpanded,
  busStopsExpanded,
  expandedBuses,
  expandedStops,
  onToggleBusRoutesExpansion,
  onToggleBusStopsExpansion,
  onToggleBusExpansion,
  onToggleStopExpansion,
  onRouteSelect,
}: SearchResultsProps) {
  if (searchResults.buses.length === 0 && searchResults.stops.length === 0) {
    return null;
  }

  return (
    <div className="mb-4 space-y-4 sm:mb-6 sm:space-y-6">
      {/* Bus Routes Group */}
      {searchResults.buses.length > 0 && (
        <Collapsible
          open={busRoutesExpanded}
          onOpenChange={onToggleBusRoutesExpansion}
        >
          <Card className="shadow-lg">
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer pb-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 sm:pb-6">
                <CardTitle className="flex items-center justify-between text-lg sm:text-xl">
                  <div className="flex items-center gap-2">
                    <Route className="h-4 w-4 sm:h-5 sm:w-5" />
                    Bus Routes ({searchResults.buses.length})
                  </div>
                  {busRoutesExpanded ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-3 pt-0 sm:space-y-4">
                {searchResults.buses.map((bus) => (
                  <BusRouteItem
                    key={bus.id}
                    bus={bus}
                    isExpanded={expandedBuses.has(bus.id)}
                    onToggleExpansion={() => onToggleBusExpansion(bus.id)}
                    onRouteSelect={onRouteSelect}
                  />
                ))}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Bus Stops Group */}
      {searchResults.stops.length > 0 && (
        <Collapsible
          open={busStopsExpanded}
          onOpenChange={onToggleBusStopsExpansion}
        >
          <Card className="shadow-lg">
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer pb-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 sm:pb-6">
                <CardTitle className="flex items-center justify-between text-lg sm:text-xl">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                    Bus Stops ({searchResults.stops.length})
                  </div>
                  {busStopsExpanded ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-3 pt-0 sm:space-y-4">
                {searchResults.stops.map((stop) => (
                  <BusStopItem
                    key={stop.id}
                    stop={stop}
                    isExpanded={expandedStops.has(stop.id)}
                    onToggleExpansion={() => onToggleStopExpansion(stop.id)}
                    onRouteSelect={onRouteSelect}
                  />
                ))}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}
    </div>
  );
}
