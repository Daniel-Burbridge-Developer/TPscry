import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useQueries } from "@tanstack/react-query";
import { searchStopsQuery } from "~/lib/queries/stops";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { useTripLiveDetails } from "~/hooks/useTripLiveDetails";
import { Wifi, WifiOff } from "lucide-react";
import { cn } from "~/lib/utils";
import { useShapeFromLiveStop } from "~/hooks/useShapeFromLiveStop";

export const Route = createFileRoute("/livetrack/fleet/$fleetId")({
  component: RouteComponent,
});

/* --------------------------------------------------
 * Helper utilities
 * ------------------------------------------------*/
function minutesUntil(timeStr?: string | null): number | null {
  if (!timeStr) return null;
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i);
  if (!match) return null;
  let [, hh, mm, meridian] = match;
  let hour = parseInt(hh, 10);
  const minute = parseInt(mm, 10);
  meridian = meridian.toLowerCase();
  if (meridian === "pm" && hour !== 12) hour += 12;
  if (meridian === "am" && hour === 12) hour = 0;

  const now = new Date();
  const target = new Date(now);
  target.setHours(hour, minute, 0, 0);

  let diffMinutes = Math.round((target.getTime() - now.getTime()) / 60000);

  // If the time was earlier today, diffMinutes will be negative — treat as 0 (bus should be there!)
  if (diffMinutes < 0) diffMinutes = 0;

  // Safety-net: any unrealistic diff (> 6h) is treated as unknown
  if (diffMinutes > 360) return null;

  return diffMinutes;
}

/* --------------------------------------------------
 * UI building blocks
 * ------------------------------------------------*/
function Header({
  destination,
  isLive,
}: {
  destination: string;
  isLive: boolean;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:gap-4">
      <Link
        to=".."
        className="self-start rounded-md border px-3 py-1 text-sm hover:bg-muted/50"
      >
        ← Back
      </Link>
      <div className="flex-1">
        <h1 className="text-xl font-bold sm:text-2xl">Route Tracking</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          to {destination} • {isLive ? "Live Tracking" : "Offline"}
        </p>
      </div>
      <Badge
        variant={isLive ? "default" : "secondary"}
        className="self-start text-xs sm:self-center sm:text-sm"
      >
        {isLive ? (
          <span className="flex items-center gap-1">
            <Wifi className="h-3 w-3 sm:h-4 sm:w-4" /> Live
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <WifiOff className="h-3 w-3 sm:h-4 sm:w-4" /> Offline
          </span>
        )}
      </Badge>
    </div>
  );
}

interface StatusCardProps {
  progress: number;
  eta: string;
  delayLabel: string;
  nextStopName: string;
}
function StatusCard({
  progress,
  eta,
  delayLabel,
  nextStopName,
}: StatusCardProps) {
  return (
    <Card className="mb-4 shadow-lg sm:mb-6">
      <CardContent className="p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 sm:gap-6">
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600 sm:text-2xl">
              {progress}%
            </div>
            <div className="text-xs text-muted-foreground sm:text-sm">
              Route Complete
            </div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-600 sm:text-2xl">
              {eta}
            </div>
            <div className="text-xs text-muted-foreground sm:text-sm">
              Next Stop ETA
            </div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-red-600 sm:text-2xl">
              {delayLabel}
            </div>
            <div className="text-xs text-muted-foreground sm:text-sm">
              Delay So Far
            </div>
          </div>
          <div className="text-center">
            <div className="text-base font-semibold sm:text-lg">
              {nextStopName}
            </div>
            <div className="text-xs text-muted-foreground sm:text-sm">
              Current/Next Stop
            </div>
          </div>
        </div>
        <Progress value={progress} className="mt-4 h-2" />
      </CardContent>
    </Card>
  );
}

interface FullRouteViewProps {
  stops: readonly {
    stopName: string;
    stopNumber: string;
    status: string;
    time: string;
    delayMinutes: number;
  }[];
  nextStopId: string | null;
}
function FullRouteView({ stops, nextStopId }: FullRouteViewProps) {
  const completedCount = stops.filter((s) => s.status === "Departed").length;
  const progressHeight = (completedCount / stops.length) * 100;

  return (
    <div className="space-y-3 sm:space-y-4">
      <h3 className="mb-3 text-base font-semibold sm:mb-4 sm:text-lg">
        Complete Route
      </h3>
      <div className="relative">
        {/* vertical track */}
        <div className="absolute bottom-0 left-5 top-0 w-0.5 bg-gray-200 dark:bg-gray-700 sm:left-6" />
        <div
          className="absolute left-5 top-0 w-0.5 bg-blue-500 sm:left-6"
          style={{ height: `${progressHeight}%` }}
        />
        {stops.map((stop, idx) => {
          const isCompleted =
            stop.status === "Departed" && stop.stopNumber !== nextStopId;
          const isCurrent = stop.stopNumber === nextStopId;

          const bulletClasses = cn(
            "relative z-10 mt-1 h-2.5 w-2.5 rounded-full border-2 sm:h-3 sm:w-3",
            {
              "border-blue-500 bg-blue-500": isCompleted,
              "animate-pulse border-yellow-500 bg-yellow-500": isCurrent,
              "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800":
                !isCompleted && !isCurrent,
            },
          );

          return (
            <div
              key={idx}
              className="relative flex items-start gap-3 pb-4 sm:gap-4 sm:pb-6"
            >
              <div className={bulletClasses} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center sm:gap-0">
                  <h4
                    className={cn(
                      "text-sm font-medium sm:text-base",
                      isCurrent ? "text-yellow-600 dark:text-yellow-400" : "",
                    )}
                  >
                    {stop.stopName}
                  </h4>
                  <span className="text-xs text-muted-foreground sm:text-sm">
                    {stop.time}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                  <Badge
                    variant={
                      isCompleted
                        ? "default"
                        : isCurrent
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {isCompleted
                      ? "Completed"
                      : isCurrent
                        ? "Current Stop"
                        : "Upcoming"}
                  </Badge>
                  {stop.delayMinutes > 0 && (
                    <Badge variant="outline" className="text-red-600">
                      +{stop.delayMinutes} min
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* --------------------------------------------------
 * Leaflet map view (client-only)
 * ------------------------------------------------*/
type StopWithCoords = {
  stopName: string;
  stopNumber: string;
  status: string;
  time: string; // predicted or departed time
  delayMinutes: number;
  lat?: number;
  lon?: number;
};

/* --------------------------------------------------
 * Shared helper to load the Leaflet bundle & CSS exactly once
 * ------------------------------------------------*/
let leafletPromise: Promise<any> | null = null;

function loadLeaflet() {
  if (leafletPromise) return leafletPromise;
  if (typeof window === "undefined") {
    leafletPromise = Promise.reject(new Error("Leaflet cannot load on server"));
    return leafletPromise;
  }
  leafletPromise = Promise.all([
    // @ts-ignore – leaflet types not installed yet
    import(/* @vite-ignore */ "leaflet"),
    // Ensure CSS is present
    new Promise((res) => {
      if (document.getElementById("leaflet-style")) return res(null);
      const link = document.createElement("link");
      link.id = "leaflet-style";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
      link.onload = () => res(null);
    }),
  ]).then(([{ default: L }]) => L);
  return leafletPromise;
}

function LiveRouteMap({
  stops,
  nextStopId,
  shapePoints,
  visible,
}: {
  stops: readonly StopWithCoords[];
  nextStopId: string | null;
  shapePoints: ShapePoint[];
  visible: boolean;
}) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const leafletRef = useRef<any>(null); // cached Leaflet module

  // Keep track of layers we add so we can update them efficiently
  const routeLayerRef = useRef<any>(null);
  const markerMapRef = useRef<Record<string, any>>({}); // stopNumber -> marker
  const polylineRef = useRef<any>(null);
  const didInitialFitRef = useRef(false);

  /* --------------------------------------------------
   * Map initialisation – only runs once
   * ------------------------------------------------*/
  useEffect(() => {
    if (typeof window === "undefined") return; // SSR safeguard

    let isCancelled = false;

    (async () => {
      const L = await loadLeaflet();

      if (isCancelled || !mapContainerRef.current) return;

      leafletRef.current = L;

      // Fallback centre – Perth
      const defaultCenter: [number, number] = [-31.9523, 115.8613];

      // Create the map instance once
      const map = L.map(mapContainerRef.current).setView(defaultCenter, 13);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      // Prepare layer group for route overlays (markers, polyline)
      routeLayerRef.current = L.layerGroup().addTo(map);
    })();

    return () => {
      isCancelled = true;
      // Clean up map on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  /* --------------------------------------------------
   * Update overlays when stops / nextStopId change
   * ------------------------------------------------*/
  useEffect(() => {
    console.time("markers-update");
    const L = leafletRef.current;
    const map = mapInstanceRef.current;
    const layerGroup = routeLayerRef.current;

    if (!L || !map || !layerGroup) return;

    // Collect coordinates for stops with valid lat/lon
    const coordsList: [number, number][] = [];

    stops.forEach((stop) => {
      if (typeof stop.lat !== "number" || typeof stop.lon !== "number") return;
      coordsList.push([stop.lat, stop.lon]);

      const existingMarker = markerMapRef.current[stop.stopNumber];

      const isCurrent = stop.stopNumber === nextStopId;

      const baseIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });

      const currentIcon = L.icon({
        iconUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        className: "current-stop-marker",
      });

      const icon = isCurrent ? currentIcon : baseIcon;

      const timeLabel =
        stop.status === "Departed"
          ? `Departed: ${stop.time}`
          : `ETA: ${stop.time}`;
      const delayLabel =
        stop.delayMinutes > 0 ? ` (+${stop.delayMinutes} min)` : "";
      const statusLabel = isCurrent
        ? "Current Stop"
        : stop.status === "Departed"
          ? "Completed"
          : "Upcoming";
      const popupHtml = `${stop.stopName}<br/>${timeLabel}${delayLabel}<br/>${statusLabel}`;

      if (existingMarker) {
        // Update icon & popup content if needed
        existingMarker.setIcon(icon);
        existingMarker.setPopupContent(popupHtml);
      } else {
        const marker = L.marker([stop.lat, stop.lon], {
          icon,
          title: stop.stopName,
        }).bindPopup(popupHtml);
        marker.addTo(layerGroup);
        markerMapRef.current[stop.stopNumber] = marker;
      }
    });

    // Remove markers that are no longer in stops
    Object.keys(markerMapRef.current).forEach((stopNumber) => {
      if (!stops.find((s) => s.stopNumber === stopNumber)) {
        markerMapRef.current[stopNumber].remove();
        delete markerMapRef.current[stopNumber];
      }
    });

    // Coordinates for shape path (if provided)
    const shapeCoords = shapePoints
      .filter(
        (p: ShapePoint) =>
          typeof p.lat === "number" && typeof p.lon === "number",
      )
      .sort((a: ShapePoint, b: ShapePoint) => a.sequence - b.sequence)
      .map((p: ShapePoint) => [p.lat, p.lon] as [number, number]);

    // Update or create polyline
    const polyCoordsToUse = shapeCoords.length > 1 ? shapeCoords : coordsList;
    if (polyCoordsToUse.length > 1) {
      if (polylineRef.current) {
        polylineRef.current.setLatLngs(polyCoordsToUse);
      } else {
        polylineRef.current = L.polyline(polyCoordsToUse, {
          color: "blue",
        }).addTo(layerGroup);
      }
    }

    console.timeEnd("markers-update");
  }, [stops, nextStopId, shapePoints, visible]);

  /* --------------------------------------------------
   * Handle visibility changes – invalidate map size and perform initial fit
   * ------------------------------------------------*/
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapInstanceRef.current;
    if (visible && map && L) {
      // Wait a tick to ensure container layout and markers ready
      setTimeout(() => {
        map.invalidateSize();

        if (!didInitialFitRef.current) {
          const latLngs = Object.values(markerMapRef.current).map((m) =>
            m.getLatLng(),
          );
          if (latLngs.length === 1) {
            map.setView(latLngs[0], 15);
          } else if (latLngs.length > 1) {
            map.fitBounds(L.latLngBounds(latLngs), { padding: [20, 20] });
          }
          didInitialFitRef.current = true;
        }
      }, 120);
    }
  }, [visible]);

  return (
    <div
      ref={mapContainerRef}
      className="h-96 w-full rounded-md border border-muted shadow-inner"
    />
  );
}

/* --------------------------------------------------
 * Main Route component
 * ------------------------------------------------*/
function RouteComponent() {
  const { fleetId } = Route.useParams();

  // Kick-off Leaflet preload as soon as this page mounts (client-side)
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Fire and forget
      loadLeaflet().catch(() => {});
    }
  }, []);

  const {
    data: trip,
    isLoading,
    error,
    currentStop,
    nextStop,
    stopsWithDelay,
    delayMinutes,
    currentStopId,
  } = useTripLiveDetails(fleetId);

  // Tab selection (declare before any early-return to keep hook order stable)
  const [activeTab, setActiveTab] = useState<"full" | "map">("full");

  const effectiveStops = stopsWithDelay ?? [];

  // Fetch lat/lon for each stop in parallel
  const coordQueries = useQueries({
    queries: effectiveStops.map((s) => ({
      ...searchStopsQuery(s.stopNumber),
      staleTime: 1000 * 60 * 60,
      gcTime: 1000 * 60 * 60 * 6,
    })),
  });

  const stopsWithCoords = effectiveStops.map((stop, idx) => {
    const q = coordQueries[idx];
    const firstMatch =
      Array.isArray(q.data) && q.data.length > 0 ? q.data[0] : null;
    return {
      ...stop,
      lat: firstMatch?.lat,
      lon: firstMatch?.lon,
    } as StopWithCoords;
  });

  // Determine if any of the coordinate queries are still loading/fetching
  const coordsFetching = coordQueries.some((q) => q.isFetching);

  // Prevent quick flicker: keep skeleton visible for at least ~400 ms after fetching finishes
  const [showCoordsSkeleton, setShowCoordsSkeleton] = useState(true);

  useEffect(() => {
    if (coordsFetching) {
      // Still fetching – ensure skeleton is shown
      setShowCoordsSkeleton(true);
    } else {
      // All done – hide skeleton after a brief delay
      const timeout = setTimeout(() => setShowCoordsSkeleton(false), 400);
      return () => clearTimeout(timeout);
    }
  }, [coordsFetching]);

  const firstStopId = trip?.stops[0]?.stopNumber ?? null;

  const { shapePoints } = useShapeFromLiveStop(
    firstStopId,
    trip.routeNumber ?? null,
    {
      enabled: !!firstStopId,
      refetchInterval: 30000,
    },
  );

  // Loading state
  if (isLoading) {
    return <div className="p-8 text-center">Loading live trip data…</div>;
  }

  // Error or invalid fleetId handling
  if (error || !trip || !currentStop) {
    return (
      <div className="p-8 text-center">
        <p className="text-lg font-semibold text-red-600">
          Unable to locate that trip.
        </p>
        <p className="text-sm text-muted-foreground">
          Please ensure you have entered a valid fleet number or try again
          later.
        </p>
        <div className="mt-4">
          <Link to="/" className="text-blue-600 underline">
            ← Go back
          </Link>
        </div>
      </div>
    );
  }

  const totalStops = trip.stops.length;
  const completedStops = trip.stops.filter(
    (s) => s.status === "Departed",
  ).length;
  const progress = Math.round((completedStops / totalStops) * 100);

  const minutesToNext = minutesUntil(nextStop?.time);
  const etaLabel = minutesToNext !== null ? `${minutesToNext} min` : "--";

  const delayLabel = delayMinutes > 0 ? `+${delayMinutes} min` : "On time";

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800 sm:p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <Header
          destination={
            trip.stops[trip.stops.length - 1]?.stopName ?? "Destination"
          }
          isLive={!error}
        />

        {/* Status summary */}
        <StatusCard
          progress={progress}
          eta={etaLabel}
          delayLabel={delayLabel}
          nextStopName={nextStop?.stopName ?? "-"}
        />

        {/* Tabs */}
        <Card className="shadow-lg">
          <CardContent className="p-4 sm:p-6">
            {/* Tab triggers */}
            <div className="grid w-full grid-cols-2">
              {(["full", "map"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "border-b-2 py-2 text-center text-xs font-medium sm:text-sm",
                    activeTab === tab
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-muted-foreground hover:border-muted-foreground/50",
                  )}
                >
                  {tab === "full" ? "Full Route" : "Map"}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {/* Always mount both views; hide the inactive one to preserve state */}
            <div className="mt-4 sm:mt-6">
              <div className={cn(activeTab === "full" ? "block" : "hidden")}>
                <FullRouteView
                  stops={stopsWithDelay}
                  nextStopId={nextStop?.stopNumber ?? null}
                />
              </div>

              <div className={cn(activeTab === "map" ? "block" : "hidden")}>
                {showCoordsSkeleton ? (
                  <div className="h-96 w-full animate-pulse rounded-md border border-muted bg-muted/40" />
                ) : (
                  <LiveRouteMap
                    stops={stopsWithCoords}
                    nextStopId={nextStop?.stopNumber ?? null}
                    shapePoints={shapePoints}
                    visible={activeTab === "map"}
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
