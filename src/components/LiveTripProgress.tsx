// TODO: THE UI, AND THE PROGRESS LOGIC SHOULD BE REFACTORED, AND SEPERATED. THE PROGRESS LOGIC SHOULD BE RE-USABLE IN BOTH THIS BAR, AND A MAP VIEW THAT IS COMING LATER.
// TODO: THE LINE IS CURRENTLY BROKEN, BUT WE COME BACK TO THIS LATER.

import React from 'react';
import type { LiveTripStop } from '~/schemas/tripLiveDetailsSchema';
import { useTripProgress } from '~/hooks/useTripProgress';
import { Bus, Check } from 'lucide-react';

interface LiveTripProgressProps {
  stops: LiveTripStop[];
  currentStopId?: string | null;
}

// Helper because toSeconds is not exported from the hook
const toSeconds = (t?: string | null): number => {
  if (!t) return NaN;
  const iso = Date.parse(t);
  if (!isNaN(iso)) {
    const d = new Date(iso);
    return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
  }
  const m = t
    .trim()
    .toLowerCase()
    .match(/^(\d{1,2}):(\d{2})(am|pm)?$/);
  if (!m) return NaN;
  let [, hStr, mStr, ampm] = m as [
    string,
    string,
    string,
    'am' | 'pm' | undefined,
  ];
  let h = parseInt(hStr, 10);
  const mm = parseInt(mStr, 10);
  if (ampm) {
    if (ampm === 'pm' && h !== 12) h += 12;
    if (ampm === 'am' && h === 12) h = 0;
  }
  return h * 3600 + mm * 60;
};

// Helper to render delta string with additional status consideration
const computeDelta = (
  stop: LiveTripStop,
  nowSeconds: number,
  boundFormat: (t?: string | null) => string,
): string => {
  const sec = toSeconds(stop.time);
  const diff = sec - nowSeconds;

  if (Math.abs(diff) < 60) {
    // If the stop is delayed, show 'Delayed'
    if (stop.status === 'Predicted') return 'Delayed';
    if (diff < 0 && stop.status === 'Departed') return 'Departed just now';
    if (diff >= 0) return 'Arriving soon';
    // diff < 0 but not departed -> show generic ago
  }
  return boundFormat(stop.time);
};

export const LiveTripProgress = ({
  stops,
  currentStopId,
}: LiveTripProgressProps) => {
  const [isShortView, setIsShortView] = React.useState(true);

  const {
    nowSeconds,
    currentIndex,
    overallProgress,
    getSegmentProgress,
    segments,
    formatDelta,
  } = useTripProgress(stops, { currentStopId });

  // ---------------------------------------------------------------------------
  // Determine which stops to show in the condensed view.
  // We always try to render three stops ( previous | current | next ) but fall
  // back gracefully when the bus is at the very beginning or end of the route.
  // ---------------------------------------------------------------------------

  const windowIndices = React.useMemo(() => {
    if (!isShortView || stops.length <= 3) return stops.map((_, i) => i);

    const total = stops.length;
    let indices = [currentIndex - 1, currentIndex, currentIndex + 1].filter(
      (i) => i >= 0 && i < total,
    );

    // Expand (or prepend / append) so that we always show three indices where
    // possible. This handles edge-cases at the start/end of the trip.
    while (indices.length < 3) {
      if (indices[0] > 0) {
        indices.unshift(indices[0] - 1);
      } else if (indices[indices.length - 1] < total - 1) {
        indices.push(indices[indices.length - 1] + 1);
      } else {
        break;
      }
    }
    return indices;
  }, [isShortView, currentIndex, stops]);

  const startIndex = windowIndices[0];
  const endIndex = windowIndices[windowIndices.length - 1];
  const displayedStops = windowIndices.map((i) => stops[i]);

  // Progress within displayed window
  const localProgress = React.useMemo(() => {
    if (!isShortView || displayedStops.length < 2) return overallProgress;

    const segs = displayedStops.length - 1; // number of segments being shown

    // Count how many of those segments have been fully completed.
    const completedSegments = windowIndices.filter(
      (i) => i < currentIndex,
    ).length;

    let progress = completedSegments;
    if (windowIndices.includes(currentIndex)) {
      progress += getSegmentProgress(currentIndex);
    }
    return progress / segs;
  }, [
    isShortView,
    displayedStops.length,
    startIndex,
    endIndex,
    currentIndex,
    getSegmentProgress,
    overallProgress,
    windowIndices,
  ]);

  const progressRatio = isShortView ? localProgress : overallProgress;

  const getDotClasses = (idx: number) => {
    const delayed = idx > 0 ? segments[idx - 1]?.delayed : false; // delay belongs to the segment leading *to* this stop
    if (idx < currentIndex)
      return delayed ? 'bg-red-500 animate-pulse' : 'bg-green-500';
    if (idx === currentIndex)
      return 'bg-white border-4 border-green-500 animate-pulse';
    return delayed
      ? 'bg-red-500/30 border-2 border-red-500'
      : 'bg-white border-2 border-gray-300';
  };

  return (
    <div>
      <div className="flex justify-end mb-2">
        <button
          className="text-sm text-primary underline"
          onClick={() => setIsShortView((v) => !v)}
        >
          {isShortView ? 'Show full route' : 'Show condensed view'}
        </button>
      </div>
      <div className={`relative pl-8 py-2 ${isShortView ? 'h-48' : ''}`}>
        {/* Base vertical line */}
        <div className="absolute left-3 top-0 bottom-0 w-1 bg-gray-200 rounded" />
        {/* Progress line (green) */}
        <div
          className="absolute left-3 top-0 w-1 bg-green-500 rounded transition-all duration-500 ease-out"
          style={{ height: `${progressRatio * 100}%` }}
        />
        {/* Moving bus icon */}
        <Bus
          className="absolute -left-2.5 w-6 h-6 text-primary z-10 transition-all duration-500 ease-out"
          style={{ top: `calc(${progressRatio * 100}% - 12px)` }}
        />
        {/* Delayed portion overlay (red) */}
        {segments.map((seg, i) => {
          if (!seg.delayed) return null;
          // Segment i goes from stop i to i+1. Compute top & height percentages.
          const topPct = (i / (stops.length - 1)) * 100;
          const heightPct = 100 / (stops.length - 1);
          return (
            <div
              key={`delay-${i}`}
              className="absolute left-3 w-1 bg-red-500 rounded"
              style={{ top: `${topPct}%`, height: `${heightPct}%` }}
            />
          );
        })}

        {/* Stops */}
        {(isShortView ? displayedStops : stops).map((stop, idx) => {
          const realIdx = isShortView ? startIndex + idx : idx;
          const timeSec = toSeconds(stop.time);
          const isDelayedStop =
            stop.status === 'Predicted' && nowSeconds > timeSec;
          return (
            <div
              key={stop.stopNumber}
              className="relative mb-8 last:mb-0"
              style={{ minHeight: '2.5rem' }}
            >
              <span
                className={`absolute left-1.5 top-0 w-4 h-4 rounded-full flex items-center justify-center ${getDotClasses(realIdx)}`}
              >
                {realIdx < currentIndex && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </span>
              <div className="ml-8">
                <span className="font-medium leading-tight block">
                  {stop.stopName}
                </span>
                <span
                  className={`text-xs block ${isDelayedStop ? 'text-red-500' : 'text-muted-foreground'}`}
                >
                  {stop.time} {realIdx === currentIndex && '(Now)'}
                </span>
                <span
                  className={`text-xs ${isDelayedStop ? 'text-red-500' : 'text-muted-foreground'} block`}
                >
                  {computeDelta(stop, nowSeconds, formatDelta)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LiveTripProgress;
