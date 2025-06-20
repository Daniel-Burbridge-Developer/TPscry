import { useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTripLiveDetailsQuery } from "~/lib/queries/tripLiveDetails";
import type { TripLiveDetails } from "~/schemas/tripLiveDetailsSchema";

interface UseTripLiveDetailsOptions {
  /**
   * How often (in ms) to refetch the live-trip details.
   * Defaults to 10 seconds, which matches the server-side cache TTL.
   */
  pollingIntervalMs?: number;
  /** Whether the query should be enabled. */
  enabled?: boolean;
}

export const useTripLiveDetails = (
  fleetNumber: string | null | undefined,
  {
    pollingIntervalMs = 10_000,
    enabled = true,
  }: UseTripLiveDetailsOptions = {},
) => {
  const queryResult = useQuery<TripLiveDetails>({
    ...getTripLiveDetailsQuery(fleetNumber ?? ""),
    enabled: enabled && !!fleetNumber,
    refetchInterval: pollingIntervalMs,
    staleTime: pollingIntervalMs,
  });

  // Map to remember the first ETA (in minutes) we saw for *each* stopNumber across refreshes.
  const baselineMapRef = useRef<Map<string, number>>(new Map());

  const derived = useMemo(() => {
    const data = queryResult.data;
    if (!data)
      return {
        currentStop: null,
        nextStop: null,
        currentStopId: null,
        delayMinutes: 0,
      } as const;

    // The current stop is the **last** stop with status "Departed"
    const currentStop =
      [...data.stops].reverse().find((s) => s.status === "Departed") ?? null;

    const currentStopId = currentStop?.stopNumber ?? null;

    // The next stop is the first stop that hasn't departed yet
    const nextStop = data.stops.find((s) => s.status !== "Departed") ?? null;

    // --------------------------
    // Delay calculation helpers
    // --------------------------

    const parseTimeToMinutes = (t?: string | null): number | null => {
      if (!t) return null;
      const match = t.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i);
      if (!match) return null;
      let hour = parseInt(match[1], 10);
      const minute = parseInt(match[2], 10);
      const meridian = match[3].toLowerCase();
      if (meridian === "pm" && hour !== 12) hour += 12;
      if (meridian === "am" && hour === 12) hour = 0;
      return hour * 60 + minute;
    };

    const stopsWithDelay = data.stops.map((stop) => {
      const nowMinutes = parseTimeToMinutes(stop.time);
      let delayMinutesForStop = 0;

      if (nowMinutes !== null) {
        const baselineMap = baselineMapRef.current;

        if (!baselineMap.has(stop.stopNumber)) {
          // First time we see this stop – store baseline
          baselineMap.set(stop.stopNumber, nowMinutes);
        }

        const baseline = baselineMap.get(stop.stopNumber);
        if (baseline !== undefined) {
          delayMinutesForStop = Math.max(0, nowMinutes - baseline);
        }
      }

      return { ...stop, delayMinutes: delayMinutesForStop } as const;
    });

    // Delay for the upcoming stop (if any)
    let delayMinutes = 0;
    if (nextStop) {
      const matchStop = stopsWithDelay.find(
        (s) => s.stopNumber === nextStop.stopNumber,
      );
      delayMinutes = matchStop?.delayMinutes ?? 0;
    }

    return {
      currentStop,
      nextStop,
      currentStopId,
      delayMinutes,
      stopsWithDelay,
    } as const;
  }, [queryResult.data]);

  return {
    ...queryResult,
    ...derived,
  };
};
