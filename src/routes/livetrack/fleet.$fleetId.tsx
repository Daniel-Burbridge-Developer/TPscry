import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { useTripLiveDetails } from "~/hooks/useTripLiveDetails";
import { Wifi, WifiOff } from "lucide-react";
import { cn } from "~/lib/utils";

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
 * Main Route component
 * ------------------------------------------------*/
function RouteComponent() {
  const { fleetId } = Route.useParams();

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
            {activeTab === "full" && (
              <div className="mt-4 sm:mt-6">
                <FullRouteView
                  stops={stopsWithDelay}
                  nextStopId={nextStop?.stopNumber ?? null}
                />
              </div>
            )}
            {activeTab === "map" && (
              <div className="mt-4 text-center sm:mt-6">
                Map view coming soon…
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
