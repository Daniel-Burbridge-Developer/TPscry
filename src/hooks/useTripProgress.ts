import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { LiveTripStop } from "~/schemas/tripLiveDetailsSchema";

/***************************
 * Time helpers
 ***************************/
const toSeconds = (t?: string | null): number => {
  if (!t) return NaN;
  const iso = Date.parse(t);
  if (!isNaN(iso)) {
    const d = new Date(iso);
    return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
  }

  const match = t
    .trim()
    .toLowerCase()
    .match(/^(\d{1,2}):(\d{2})(am|pm)?$/);
  if (!match) return NaN;

  let [, hStr, mStr, ampm] = match as [
    string,
    string,
    string,
    "am" | "pm" | undefined,
  ];

  let hours = parseInt(hStr, 10);
  const minutes = parseInt(mStr, 10);

  if (ampm) {
    if (ampm === "pm" && hours !== 12) hours += 12;
    if (ampm === "am" && hours === 12) hours = 0;
  }
  return hours * 3600 + minutes * 60;
};

/***************************
 * Progress helpers
 ***************************/
const segmentProgress = (
  startStop: LiveTripStop,
  endStop: LiveTripStop,
  nowSeconds: number,
): { ratio: number; delayed: boolean } => {
  const startTime = toSeconds(startStop.time);
  const endTime = toSeconds(endStop.time);

  // Sanity checks
  if (
    isNaN(startTime) ||
    isNaN(endTime) ||
    endTime <= startTime ||
    nowSeconds < startTime
  ) {
    return { ratio: 0, delayed: false };
  }

  // Completed segment
  if (nowSeconds >= endTime) {
    return {
      ratio: 1,
      delayed: endStop.status === "Predicted", // still predicted => delay
    };
  }

  const elapsed = nowSeconds - startTime;
  const duration = endTime - startTime;

  return {
    ratio: Math.min(1, Math.max(0, elapsed / duration)),
    delayed: false,
  };
};

/***************************
 * Delta formatter (human friendly)
 ***************************/
export const formatDelta = (
  targetSeconds: number,
  nowSeconds: number,
): string => {
  const diff = targetSeconds - nowSeconds;
  const abs = Math.abs(diff);

  if (abs < 60) {
    return diff < 0 ? "Departed just now" : "Arriving soon";
  }
  const mins = Math.floor(abs / 60);
  if (mins < 60) {
    return diff < 0 ? `${mins}m ago` : `in ${mins}m`;
  }
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  return diff < 0
    ? `${hours}h${rem ? ` ${rem}m` : ""} ago`
    : `in ${hours}h${rem ? ` ${rem}m` : ""}`;
};

/***************************
 * Types
 ***************************/
interface UseTripProgressOptions {
  /** How often (ms) to recompute progress. Defaults to 10 s. */
  pollingIntervalMs?: number;
  /** Enable/disable the hook entirely. */
  enabled?: boolean;
  /**
   * Provide the "current" stop ID explicitly if it comes from another source.
   * If omitted, the hook will infer it from the stop statuses.
   */
  currentStopId?: string | null;
}

export interface TripProgressSegment {
  startStop: LiveTripStop;
  endStop: LiveTripStop;
  /** 0..1 ratio of progress */
  progress: number;
  /** The bus is past the planned arrival time but still not confirmed */
  delayed: boolean;
}

export interface UseTripProgressResult {
  stops: LiveTripStop[];
  /** "wall-clock" seconds since midnight */
  nowSeconds: number;
  currentStop: LiveTripStop | null;
  nextStop: LiveTripStop | null;
  currentIndex: number; // -1 if unknown
  segments: TripProgressSegment[]; // length stops.length - 1
  /** 0..1 overall trip progress */
  overallProgress: number;
  /** Helper to format human-readable delta for any stop */
  formatDelta: (timeStr?: string | null) => string;
  /** Convenience function – returns progress ratio for a given segment index. */
  getSegmentProgress: (idx: number) => number;
}

/***************************
 * The Hook
 ***************************/
export const useTripProgress = (
  stops: LiveTripStop[],
  {
    pollingIntervalMs = 10_000,
    enabled = true,
    currentStopId: explicitCurrentStopId = null,
  }: UseTripProgressOptions = {},
): UseTripProgressResult => {
  /**
   * The query only depends on `stops` & the explicit currentStopId, so we can
   * use them as the key. We attach `Date.now()` rounded to the polling
   * interval so React-Query recomputes automatically without us having to
   * manage `setInterval` ourselves.
   */
  const timeBucket = Math.floor(Date.now() / pollingIntervalMs);

  const queryResult = useQuery<UseTripProgressResult>({
    queryKey: ["tripProgress", stops, explicitCurrentStopId, timeBucket],
    queryFn: () => {
      const now = new Date();
      const nowSec =
        now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

      // 1. Determine current & next stop indices ////////////////////////////
      let currentIdx: number;
      if (explicitCurrentStopId != null) {
        currentIdx = stops.findIndex(
          (s) => s.stopNumber === explicitCurrentStopId,
        );
      } else {
        // Infer current stop as the *last* stop with status Arrived/Departed
        currentIdx = [...stops]
          .reverse()
          .findIndex((s) => ["Arrived", "Departed"].includes(s.status));
        if (currentIdx !== -1) {
          currentIdx = stops.length - 1 - currentIdx; // because reversed
        }
      }

      const currentStop = currentIdx >= 0 ? stops[currentIdx] : null;
      const nextStop =
        currentIdx >= 0 ? (stops[currentIdx + 1] ?? null) : (stops[0] ?? null);

      // 2. Compute per-segment progress with refined rules //////////////////
      const getSegProg = (idx: number): number => {
        if (idx < 0 || idx >= stops.length - 1) return 0;

        if (idx < currentIdx) return 1; // completed
        if (idx > currentIdx) return 0; // future

        // idx === currentIdx => active segment
        const currentStop = stops[idx];
        const nextStop = stops[idx + 1];

        if (!currentStop || !nextStop) return 0;

        // Only time-animate if bus left currentStop AND nextStop is predicted
        const leftCurrent = ["Departed", "Predicted"].includes(
          currentStop.status,
        );
        const nextPredicted = nextStop.status === "Predicted";

        if (!leftCurrent || !nextPredicted) return 0;

        const start = toSeconds(currentStop.time);
        const end = toSeconds(nextStop.time);

        if (isNaN(start) || isNaN(end) || end <= start) return 0;

        if (nowSec <= start) return 0;

        if (nowSec >= end) return 1; // cap, bus delayed but segment complete visually

        return (nowSec - start) / (end - start);
      };

      const segments: TripProgressSegment[] = [];
      for (let i = 0; i < stops.length - 1; i++) {
        const ratio = getSegProg(i);
        const delayedFlag =
          ratio === 1 &&
          stops[i + 1].status === "Predicted" &&
          nowSec > toSeconds(stops[i + 1].time);
        segments.push({
          startStop: stops[i],
          endStop: stops[i + 1],
          progress: ratio,
          delayed: delayedFlag,
        });
      }

      // 3. Overall progress ////////////////////////////////////////////////
      const completedWhole = currentIdx > 0 ? currentIdx : 0; // segments fully done before currentIdx
      const overall = segments.length
        ? (completedWhole + getSegProg(currentIdx)) / segments.length
        : 0;

      return {
        stops,
        nowSeconds: nowSec,
        currentStop,
        nextStop,
        currentIndex: currentIdx,
        segments,
        overallProgress: overall,
        getSegmentProgress: getSegProg,
        formatDelta: () => "",
      } as const;
    },
    enabled: enabled && stops.length > 1,
    // The query key already changes every `pollingIntervalMs`, but we still
    // set stale time so consumers can call `refetch()` if they want.
    staleTime: pollingIntervalMs,
  });

  // The queryFn is synchronous, so `data` is always defined once the query is
  // successful. We provide sensible fallbacks while loading.
  const dataFallback = useMemo<UseTripProgressResult>(
    () => ({
      stops,
      nowSeconds: 0,
      currentStop: null,
      nextStop: null,
      currentIndex: -1,
      segments: [],
      overallProgress: 0,
      getSegmentProgress: () => 0,
      formatDelta: () => "",
    }),
    [stops],
  );

  const resultData = queryResult.data ?? dataFallback;

  // Expose `formatDelta` bound to the current `nowSeconds` value
  const boundFormatDelta = (timeStr?: string | null) =>
    formatDelta(toSeconds(timeStr), resultData.nowSeconds);

  return {
    ...resultData,
    formatDelta: boundFormatDelta,
  };
};
