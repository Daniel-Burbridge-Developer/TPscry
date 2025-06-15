"use client";

import { useState } from "react";
import { SearchBar } from "@/components/search-bar";
import { SearchResults } from "@/components/search-results";
import { RecentSearches } from "@/components/recent-searches";
import { Favorites } from "@/components/favorites";
import { Navigation, Route, Map, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

/**
 * Main BusTrackerApp Component
 *
 * TODO for your implementation:
 * 1. Set up Zustand stores for:
 *    - Search state (query, results, loading, error)
 *    - UI state (expanded sections, selected route)
 *    - User preferences (favorites, recent searches)
 *
 * 2. Set up React Query for:
 *    - Search API calls with debouncing
 *    - Real-time route tracking with polling
 *    - Caching search results
 *
 * 3. Set up Zod schemas for:
 *    - Bus route data validation
 *    - Stop data validation
 *    - API response validation
 *
 * 4. Replace mock data with real API calls
 *
 * 5. Add error boundaries and loading states
 *
 * 6. Implement proper TypeScript types throughout
 */

// Mock data - replace with your API data
const mockBuses = [
  {
    id: "950",
    name: "Route 950",
    routes: [
      {
        id: "950-perth",
        destination: "to Perth",
        isLive: true,
        progress: 65,
        nextStop: "Wellington St Station",
        eta: "3 min",
      },
      {
        id: "950-wembley",
        destination: "to Wembley",
        isLive: true,
        progress: 23,
        nextStop: "Hay Street Mall",
        eta: "12 min",
      },
      {
        id: "950-welshpool",
        destination: "to Welshpool",
        isLive: false,
        progress: 0,
        nextStop: "Not in service",
        eta: "N/A",
      },
    ],
  },
  {
    id: "201",
    name: "Route 201",
    routes: [
      {
        id: "201-city",
        destination: "to City",
        isLive: true,
        progress: 89,
        nextStop: "Perth Station",
        eta: "1 min",
      },
      {
        id: "201-fremantle",
        destination: "to Fremantle",
        isLive: true,
        progress: 45,
        nextStop: "South Terrace",
        eta: "8 min",
      },
    ],
  },
  {
    id: "380",
    name: "Route 380",
    routes: [
      {
        id: "380-morley",
        destination: "to Morley",
        isLive: false,
        progress: 0,
        nextStop: "Not in service",
        eta: "N/A",
      },
    ],
  },
  {
    id: "202",
    name: "Route 202",
    routes: [
      {
        id: "202-perth",
        destination: "to Perth",
        isLive: true,
        progress: 34,
        nextStop: "Murray Street",
        eta: "6 min",
      },
      {
        id: "202-cannington",
        destination: "to Cannington",
        isLive: true,
        progress: 78,
        nextStop: "Albany Highway",
        eta: "4 min",
      },
    ],
  },
  {
    id: "103",
    name: "Route 103",
    routes: [
      {
        id: "103-perth",
        destination: "to Perth",
        isLive: false,
        progress: 0,
        nextStop: "Not in service",
        eta: "N/A",
      },
    ],
  },
];

const mockStops = [
  {
    id: "wellington-st",
    name: "Wellington St Station",
    type: "stop",
    routes: [
      {
        id: "950-perth-wellington",
        routeNumber: "950",
        destination: "to Perth",
        isLive: true,
        progress: 65,
        nextBus: "3 min",
        eta: "3 min",
      },
      {
        id: "201-city-wellington",
        routeNumber: "201",
        destination: "to City",
        isLive: true,
        progress: 89,
        nextBus: "8 min",
        eta: "8 min",
      },
      {
        id: "380-morley-wellington",
        routeNumber: "380",
        destination: "to Morley",
        isLive: false,
        progress: 0,
        nextBus: "15 min",
        eta: "N/A",
      },
    ],
  },
  {
    id: "hay-st-mall",
    name: "Hay Street Mall",
    type: "stop",
    routes: [
      {
        id: "950-wembley-hay",
        routeNumber: "950",
        destination: "to Wembley",
        isLive: true,
        progress: 23,
        nextBus: "5 min",
        eta: "5 min",
      },
      {
        id: "201-fremantle-hay",
        routeNumber: "201",
        destination: "to Fremantle",
        isLive: true,
        progress: 45,
        nextBus: "12 min",
        eta: "12 min",
      },
    ],
  },
  {
    id: "perth-station",
    name: "Perth Station",
    type: "stop",
    routes: [
      {
        id: "201-city-perth",
        routeNumber: "201",
        destination: "to City",
        isLive: true,
        progress: 89,
        nextBus: "1 min",
        eta: "1 min",
      },
      {
        id: "380-morley-perth",
        routeNumber: "380",
        destination: "to Morley",
        isLive: false,
        progress: 0,
        nextBus: "20 min",
        eta: "N/A",
      },
      {
        id: "202-perth-station",
        routeNumber: "202",
        destination: "to Perth",
        isLive: true,
        progress: 34,
        nextBus: "6 min",
        eta: "6 min",
      },
    ],
  },
  {
    id: "murray-st-mall",
    name: "Murray Street Mall",
    type: "stop",
    routes: [
      {
        id: "202-perth-murray",
        routeNumber: "202",
        destination: "to Perth",
        isLive: true,
        progress: 34,
        nextBus: "6 min",
        eta: "6 min",
      },
      {
        id: "103-perth-murray",
        routeNumber: "103",
        destination: "to Perth",
        isLive: false,
        progress: 0,
        nextBus: "25 min",
        eta: "N/A",
      },
    ],
  },
  {
    id: "albany-highway",
    name: "Albany Highway",
    type: "stop",
    routes: [
      {
        id: "202-cannington-albany",
        routeNumber: "202",
        destination: "to Cannington",
        isLive: true,
        progress: 78,
        nextBus: "4 min",
        eta: "4 min",
      },
    ],
  },
];

const recentSearches = [
  "Route 950",
  "Wellington St Station",
  "Route 201",
  "Hay Street Mall",
];
const favorites = [
  "Route 950 to Perth",
  "Wellington St Station",
  "Route 201 to City",
];

const routeStops = [
  { name: "Perth Station", status: "completed", time: "2:15 PM" },
  { name: "Wellington St Station", status: "completed", time: "2:18 PM" },
  { name: "Hay Street Mall", status: "completed", time: "2:22 PM" },
  { name: "Murray Street Mall", status: "current", time: "2:25 PM" },
  { name: "St Georges Terrace", status: "upcoming", time: "2:28 PM" },
  { name: "Kings Park Rd", status: "upcoming", time: "2:32 PM" },
  { name: "Thomas Street", status: "upcoming", time: "2:35 PM" },
  { name: "Wembley Station", status: "upcoming", time: "2:40 PM" },
];

export default function BusTrackerApp() {
  // TODO: Replace with Zustand store state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ buses: [], stops: [] });
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [viewMode, setViewMode] = useState("search");

  // Collapsible state management - TODO: Move to Zustand store
  const [busRoutesExpanded, setBusRoutesExpanded] = useState(true);
  const [busStopsExpanded, setBusStopsExpanded] = useState(true);
  const [expandedBuses, setExpandedBuses] = useState(new Set());
  const [expandedStops, setExpandedStops] = useState(new Set());

  // TODO: Replace with React Query mutation
  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    const query = searchQuery.toLowerCase();

    // TODO: Replace with actual API call using React Query
    const busResults = mockBuses.filter((bus) => {
      if (bus.name.toLowerCase().includes(query) || bus.id.includes(query)) {
        return true;
      }
      return bus.routes.some((route) =>
        route.destination.toLowerCase().includes(query),
      );
    });

    const stopResults = mockStops.filter((stop) => {
      return (
        stop.name.toLowerCase().includes(query) ||
        stop.name
          .toLowerCase()
          .split(" ")
          .some((word) => word.startsWith(query) || query.includes(word))
      );
    });

    setSearchResults({ buses: busResults, stops: stopResults });

    // Reset expansion states for new search
    setExpandedBuses(new Set());
    setExpandedStops(new Set());
    setBusRoutesExpanded(true);
    setBusStopsExpanded(true);
  };

  const handleRouteSelect = (route) => {
    setSelectedRoute(route);
    setViewMode("tracking");
  };

  const toggleBusExpansion = (busId) => {
    const newExpanded = new Set(expandedBuses);
    if (newExpanded.has(busId)) {
      newExpanded.delete(busId);
    } else {
      newExpanded.add(busId);
    }
    setExpandedBuses(newExpanded);
  };

  const toggleStopExpansion = (stopId) => {
    const newExpanded = new Set(expandedStops);
    if (newExpanded.has(stopId)) {
      newExpanded.delete(stopId);
    } else {
      newExpanded.add(stopId);
    }
    setExpandedStops(newExpanded);
  };

  if (viewMode === "tracking" && selectedRoute) {
    return (
      <TrackingView
        route={selectedRoute}
        onBack={() => setViewMode("search")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto max-w-4xl px-3 py-4 sm:px-4 sm:py-6">
        {/* Header */}
        <div className="mb-6 text-center sm:mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            BusTracker
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 sm:text-base">
            Real-time bus tracking and route information
          </p>
        </div>

        {/* Search Bar */}
        <SearchBar
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onSearch={handleSearch}
        />

        {/* Search Results */}
        <SearchResults
          searchResults={searchResults}
          busRoutesExpanded={busRoutesExpanded}
          busStopsExpanded={busStopsExpanded}
          expandedBuses={expandedBuses}
          expandedStops={expandedStops}
          onToggleBusRoutesExpansion={() =>
            setBusRoutesExpanded(!busRoutesExpanded)
          }
          onToggleBusStopsExpansion={() =>
            setBusStopsExpanded(!busStopsExpanded)
          }
          onToggleBusExpansion={toggleBusExpansion}
          onToggleStopExpansion={toggleStopExpansion}
          onRouteSelect={handleRouteSelect}
        />

        {/* Recent History & Favorites */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
          <RecentSearches
            recentSearches={recentSearches}
            onSearchSelect={setSearchQuery}
          />
          <Favorites favorites={favorites} onFavoriteSelect={() => {}} />
        </div>
      </div>
    </div>
  );
}

function TrackingView({ route, onBack }) {
  const [activeTab, setActiveTab] = useState("full");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto max-w-4xl px-3 py-4 sm:px-4 sm:py-6">
        {/* Header */}
        <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:gap-4">
          <Button variant="outline" onClick={onBack} className="self-start">
            ← Back
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
              Route Tracking
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 sm:text-base">
              {route.destination} • {route.isLive ? "Live Tracking" : "Offline"}
            </p>
          </div>
          <Badge
            variant={route.isLive ? "default" : "secondary"}
            className="self-start text-xs sm:self-center sm:text-sm"
          >
            {route.isLive ? (
              <>
                <Wifi className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> Live
              </>
            ) : (
              <>
                <WifiOff className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> Offline
              </>
            )}
          </Badge>
        </div>

        {/* Status Card */}
        <Card className="mb-4 shadow-lg sm:mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600 sm:text-2xl">
                  {route.progress}%
                </div>
                <div className="text-xs text-gray-500 sm:text-sm">
                  Route Complete
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600 sm:text-2xl">
                  {route.eta}
                </div>
                <div className="text-xs text-gray-500 sm:text-sm">
                  Next Stop ETA
                </div>
              </div>
              <div className="text-center">
                <div className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
                  {route.nextStop}
                </div>
                <div className="text-xs text-gray-500 sm:text-sm">
                  Current/Next Stop
                </div>
              </div>
            </div>
            <Progress value={route.progress} className="mt-4 h-2" />
          </CardContent>
        </Card>

        {/* View Tabs */}
        <Card className="shadow-lg">
          <CardContent className="p-4 sm:p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid h-auto w-full grid-cols-3">
                <TabsTrigger
                  value="full"
                  className="flex flex-col items-center gap-1 px-2 py-2 text-xs sm:flex-row sm:gap-2 sm:text-sm"
                >
                  <Route className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Full Route</span>
                  <span className="sm:hidden">Full</span>
                </TabsTrigger>
                <TabsTrigger
                  value="condensed"
                  className="flex flex-col items-center gap-1 px-2 py-2 text-xs sm:flex-row sm:gap-2 sm:text-sm"
                >
                  <Navigation className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Condensed</span>
                  <span className="sm:hidden">Quick</span>
                </TabsTrigger>
                <TabsTrigger
                  value="map"
                  className="flex flex-col items-center gap-1 px-2 py-2 text-xs sm:flex-row sm:gap-2 sm:text-sm"
                >
                  <Map className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Map</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="full" className="mt-4 sm:mt-6">
                <FullRouteView stops={routeStops} />
              </TabsContent>

              <TabsContent value="condensed" className="mt-4 sm:mt-6">
                <CondensedRouteView stops={routeStops} />
              </TabsContent>

              <TabsContent value="map" className="mt-4 sm:mt-6">
                <MapView />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function FullRouteView({ stops }) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <h3 className="mb-3 text-base font-semibold sm:mb-4 sm:text-lg">
        Complete Route
      </h3>
      <div className="relative">
        {/* Vertical progress line */}
        <div className="absolute bottom-0 left-5 top-0 w-0.5 bg-gray-200 dark:bg-gray-700 sm:left-6"></div>
        <div
          className="absolute left-5 top-0 w-0.5 bg-blue-500 sm:left-6"
          style={{ height: "37.5%" }}
        ></div>

        {stops.map((stop, index) => (
          <div
            key={index}
            className="relative flex items-start gap-3 pb-4 sm:gap-4 sm:pb-6"
          >
            <div
              className={`relative z-10 mt-1 h-2.5 w-2.5 rounded-full border-2 sm:h-3 sm:w-3 ${
                stop.status === "completed"
                  ? "border-blue-500 bg-blue-500"
                  : stop.status === "current"
                    ? "animate-pulse border-yellow-500 bg-yellow-500"
                    : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"
              }`}
            ></div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center sm:gap-0">
                <h4
                  className={`text-sm font-medium sm:text-base ${
                    stop.status === "current"
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  {stop.name}
                </h4>
                <span className="text-xs text-gray-500 sm:text-sm">
                  {stop.time}
                </span>
              </div>
              <Badge
                variant={
                  stop.status === "completed"
                    ? "default"
                    : stop.status === "current"
                      ? "destructive"
                      : "secondary"
                }
                className="mt-1 text-xs"
              >
                {stop.status === "completed"
                  ? "Completed"
                  : stop.status === "current"
                    ? "Current Stop"
                    : "Upcoming"}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CondensedRouteView({ stops }) {
  const currentIndex = stops.findIndex((stop) => stop.status === "current");
  const visibleStops = stops.slice(
    Math.max(0, currentIndex - 1),
    currentIndex + 2,
  );

  return (
    <div className="space-y-3 sm:space-y-4">
      <h3 className="mb-3 text-base font-semibold sm:mb-4 sm:text-lg">
        Next Stops
      </h3>
      <div className="relative">
        <div className="absolute bottom-0 left-5 top-0 w-0.5 bg-gray-200 dark:bg-gray-700 sm:left-6"></div>

        {visibleStops.map((stop, index) => (
          <div
            key={index}
            className="relative flex items-start gap-3 pb-4 sm:gap-4 sm:pb-6"
          >
            <div
              className={`relative z-10 mt-1 h-2.5 w-2.5 rounded-full border-2 sm:h-3 sm:w-3 ${
                stop.status === "completed"
                  ? "border-blue-500 bg-blue-500"
                  : stop.status === "current"
                    ? "animate-pulse border-yellow-500 bg-yellow-500"
                    : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"
              }`}
            ></div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center sm:gap-0">
                <h4
                  className={`text-sm font-medium sm:text-base ${
                    stop.status === "current"
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  {stop.name}
                </h4>
                <span className="text-xs text-gray-500 sm:text-sm">
                  {stop.time}
                </span>
              </div>
              <Badge
                variant={
                  stop.status === "completed"
                    ? "default"
                    : stop.status === "current"
                      ? "destructive"
                      : "secondary"
                }
                className="mt-1 text-xs"
              >
                {stop.status === "completed"
                  ? "Completed"
                  : stop.status === "current"
                    ? "Current Stop"
                    : "Upcoming"}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MapView() {
  return (
    <div className="space-y-3 sm:space-y-4">
      <h3 className="mb-3 text-base font-semibold sm:mb-4 sm:text-lg">
        Live Map Tracking
      </h3>
      <div className="flex h-64 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 sm:h-96">
        <div className="px-4 text-center">
          <Map className="mx-auto mb-3 h-12 w-12 text-gray-400 sm:mb-4 sm:h-16 sm:w-16" />
          <p className="mb-2 text-sm text-gray-600 dark:text-gray-400 sm:text-base">
            Interactive Map View
          </p>
          <p className="text-xs text-gray-500 sm:text-sm">
            Leaflet map integration would be implemented here
          </p>
          <div className="mt-3 space-y-2 sm:mt-4">
            <div className="flex items-center justify-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-blue-500 sm:h-3 sm:w-3"></div>
              <span className="text-xs sm:text-sm">Bus Location</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500 sm:h-3 sm:w-3"></div>
              <span className="text-xs sm:text-sm">Bus Stops</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
