// TODO: THE UI, AND THE PROGRESS LOGIC SHOULD BE REFACTORED, AND SEPERATED. THE PROGRESS LOGIC SHOULD BE RE-USABLE IN BOTH THIS BAR, AND A MAP VIEW THAT IS COMING LATER.
// TODO: THE LINE IS CURRENTLY BROKEN, BUT WE COME BACK TO THIS LATER.

import React from 'react';
import type { LiveTripStop } from '~/schemas/tripLiveDetailsSchema';

interface LiveTripProgressProps {
  stops: LiveTripStop[];
  /** The stopNumber of the current stop (i.e., where the vehicle is currently). */
  currentStopId: string | null | undefined;
}

export const LiveTripProgress = ({
  stops,
  currentStopId,
}: LiveTripProgressProps) => {
  const [now, setNow] = React.useState(Date.now());
  const [isShortView, setIsShortView] = React.useState(true);

  // Logging: Initial props
  React.useEffect(() => {
    console.log('[LiveTripProgress] Initial stops:', stops);
    console.log('[LiveTripProgress] Initial currentStopId:', currentStopId);
  }, [stops, currentStopId]);

  // Update current time periodically to animate progress (every 10s)
  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 10_000);
    return () => clearInterval(id);
  }, []);

  // Helper to parse time string to seconds past midnight
  const toSeconds = React.useCallback((t?: string | null): number => {
    if (!t) {
      console.warn('[LiveTripProgress] toSeconds: No time string provided', t);
      return NaN;
    }
    // Attempt ISO parse first
    const iso = Date.parse(t);
    if (!isNaN(iso)) {
      const d = new Date(iso);
      return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
    }

    const match = t
      .trim()
      .toLowerCase()
      .match(/^(\d{1,2}):(\d{2})(am|pm)?$/);
    if (!match) {
      console.warn(
        '[LiveTripProgress] toSeconds: Could not parse time string',
        t,
      );
      return NaN;
    }

    let [_, hStr, mStr, ampm] = match;
    let hours = parseInt(hStr, 10);
    const minutes = parseInt(mStr, 10);

    if (ampm) {
      if (ampm === 'pm' && hours !== 12) hours += 12;
      if (ampm === 'am' && hours === 12) hours = 0;
    }
    return hours * 3600 + minutes * 60;
  }, []);

  const nowSeconds = React.useMemo(() => {
    const d = new Date(now);
    const seconds = d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
    // Logging: Current time in seconds
    // console.log('[LiveTripProgress] nowSeconds:', seconds, '(', d.toISOString(), ')');
    return seconds;
  }, [now]);

  // Determine the index of the current stop. If not found, default to -1.
  const currentIndex = React.useMemo(() => {
    if (!currentStopId) {
      console.warn(
        '[LiveTripProgress] currentStopId is null/undefined:',
        currentStopId,
      );
      return -1;
    }
    const idx = stops.findIndex((s) => s.stopNumber === currentStopId);
    if (idx === -1) {
      console.warn(
        '[LiveTripProgress] currentStopId not found in stops:',
        currentStopId,
        stops.map((s) => s.stopNumber),
      );
    }
    return idx;
  }, [currentStopId, stops]);

  // Friendly human-readable delta (e.g., "in 5m", "3m ago", "Arriving soon")
  const formatDelta = React.useCallback(
    (timeSec: number): string => {
      const diff = timeSec - nowSeconds;
      const abs = Math.abs(diff);

      if (abs < 60) {
        return diff < 0 ? 'Departed just now' : 'Arriving soon';
      }
      const mins = Math.floor(abs / 60);
      if (mins < 60) {
        return diff < 0 ? `${mins}m ago` : `in ${mins}m`;
      }
      const hours = Math.floor(mins / 60);
      const rem = mins % 60;
      return diff < 0
        ? `${hours}h${rem ? ` ${rem}m` : ''} ago`
        : `in ${hours}h${rem ? ` ${rem}m` : ''}`;
    },
    [nowSeconds],
  );

  // This is the core logic change:
  // Calculate progress for a segment *between* stop `idx` and `idx + 1`.
  // This progress should only show if the bus is confirmed to be past stop `idx`
  // and not yet confirmed at `idx + 1`.
  const getSegmentProgress = React.useCallback(
    (idx: number): number => {
      // If this segment is before the bus's current confirmed stop, it's 100% complete.
      if (idx < currentIndex) {
        // console.log(`[LiveTripProgress] getSegmentProgress: idx ${idx} < currentIndex ${currentIndex} => 1`);
        return 1;
      }
      // If this segment is after the bus's current confirmed stop, it has no progress.
      if (idx > currentIndex) {
        // console.log(`[LiveTripProgress] getSegmentProgress: idx ${idx} > currentIndex ${currentIndex} => 0`);
        return 0;
      }

      // This is the segment the bus is currently traversing (from currentIndex to currentIndex + 1)
      const currentStop = stops[idx];
      const nextStop = stops[idx + 1];

      if (!currentStop || !nextStop) {
        console.warn('[LiveTripProgress] getSegmentProgress: Invalid segment', {
          idx,
          currentStop,
          nextStop,
        });
        return 0; // Invalid segment
      }

      // We only show progress if the current stop has been 'Departed' or 'Predicted' (meaning it's past this stop)
      // AND the next stop is 'Predicted' (meaning we have an expected arrival time).
      // This addresses point 2: "ensure my line never goes passed the location the bus has not confirmed it has gone passed yet."
      if (
        !['Departed', 'Predicted'].includes(currentStop.status) ||
        nextStop.status !== 'Predicted'
      ) {
        // If the current stop hasn't departed/predicted, or the next stop isn't predicted,
        // we can't accurately mock progress to the next stop.
        // In this case, the segment *to* the current stop should be 100%, and this segment 0%.
        // console.log('[LiveTripProgress] getSegmentProgress: Progress not shown for segment', { idx, currentStopStatus: currentStop.status, nextStopStatus: nextStop.status });
        return 0;
      }

      // 'start' for this segment is the time at the current stop (departure time approximation)
      const segmentStartTime = toSeconds(currentStop.time);
      // 'end' for this segment is the arrival time at the next stop
      const segmentEndTime = toSeconds(nextStop.time);

      if (
        isNaN(segmentStartTime) ||
        isNaN(segmentEndTime) ||
        segmentEndTime <= segmentStartTime
      ) {
        console.warn(
          '[LiveTripProgress] getSegmentProgress: Invalid time range',
          {
            idx,
            currentStop,
            nextStop,
            segmentStartTime,
            segmentEndTime,
          },
        );
        return 0; // Invalid time range
      }

      // Calculate elapsed time within this segment
      let elapsed = nowSeconds - segmentStartTime;

      // Ensure progress doesn't go past 100% of this segment IF the next stop hasn't been reached.
      // This addresses point 3: "ensure my component doesn't break if the time the bus is expected to arrive somewhere, is overshot due to some sort of delay."
      // And also implicitly reinforces point 2.
      if (elapsed < 0) {
        // console.log('[LiveTripProgress] getSegmentProgress: elapsed < 0', { idx, elapsed });
        return 0; // Current time is before segment start
      }

      const duration = segmentEndTime - segmentStartTime;
      let ratio = duration > 0 ? elapsed / duration : 0;

      // Cap the ratio at 1 (100%) for the current segment.
      // However, if `currentStop.status` is 'Departed' and `nextStop.status` is still 'Predicted',
      // we let the bar fill even if the predicted arrival time for `nextStop` has passed,
      // *but we don't allow it to extend into the *next* segment*.
      // The key here is that if the bus is *at* the `currentIndex` and moving towards `currentIndex + 1`,
      // the progress within this segment should be based on time.
      // If `nowSeconds` is *past* `segmentEndTime` and `nextStop.status` is *still* 'Predicted',
      // it implies a delay, and we want to show 100% progress for *this* segment, but not jump to the next.
      if (nowSeconds >= segmentEndTime && nextStop.status === 'Predicted') {
        ratio = 1; // Mark this segment as complete if predicted arrival time has passed
      }

      // Logging: Segment progress calculation
      // Only log if this is the current segment
      if (idx === currentIndex) {
        console.log('[LiveTripProgress] getSegmentProgress', {
          idx,
          currentStop,
          nextStop,
          segmentStartTime,
          segmentEndTime,
          nowSeconds,
          elapsed,
          duration,
          ratio,
        });
      }

      return Math.min(1, Math.max(0, ratio));
    },
    [currentIndex, nowSeconds, stops, toSeconds],
  );

  const overallProgress = React.useMemo(() => {
    if (stops.length < 2) {
      console.warn(
        '[LiveTripProgress] overallProgress: Not enough stops',
        stops.length,
      );
      return 0;
    }

    let totalProgress = 0;
    // Sum up progress of all completed segments
    for (let i = 0; i < currentIndex; i++) {
      totalProgress += 1;
    }

    // Add the partial progress of the current segment
    if (currentIndex >= 0 && currentIndex < stops.length - 1) {
      totalProgress += getSegmentProgress(currentIndex);
    }

    // Calculate the overall ratio based on total segments
    const totalSegments = stops.length - 1;
    const ratio = totalSegments > 0 ? totalProgress / totalSegments : 0;
    // Logging: Overall progress
    // console.log('[LiveTripProgress] overallProgress:', { totalProgress, totalSegments, ratio });
    return ratio;
  }, [currentIndex, getSegmentProgress, stops.length]);

  // Compute subset of stops for short view
  const startIndex = isShortView ? Math.max(0, currentIndex - 1) : 0;
  const endIndex = isShortView
    ? Math.min(stops.length - 1, currentIndex + 1)
    : stops.length - 1;
  const displayedStops = stops.slice(startIndex, endIndex + 1);

  React.useEffect(() => {
    // Logging: Displayed stops for current view
    console.log(
      '[LiveTripProgress] displayedStops:',
      displayedStops.map((s) => ({
        stopNumber: s.stopNumber,
        stopName: s.stopName,
        status: s.status,
        time: s.time,
      })),
    );
    console.log(
      '[LiveTripProgress] startIndex:',
      startIndex,
      'endIndex:',
      endIndex,
      'isShortView:',
      isShortView,
    );
  }, [displayedStops, startIndex, endIndex, isShortView]);

  // Compute local progress ratio for displayed stops
  const localProgress = React.useMemo(() => {
    if (!isShortView || displayedStops.length < 2) return overallProgress;

    const segmentsInView = displayedStops.length - 1;
    if (segmentsInView <= 0) {
      console.warn(
        '[LiveTripProgress] localProgress: segmentsInView <= 0',
        segmentsInView,
      );
      return 0; // Handle cases with 0 or 1 displayed stops
    }

    let currentSegmentLocalIdx = -1;
    if (currentIndex >= startIndex && currentIndex <= endIndex) {
      currentSegmentLocalIdx = currentIndex - startIndex;
    }

    let localTotalProgress = 0;
    // Sum up completed segments within the displayed view
    for (let i = 0; i < currentSegmentLocalIdx; i++) {
      localTotalProgress += 1;
    }

    // Add partial progress of the current segment if it's in view
    if (currentSegmentLocalIdx !== -1 && currentIndex < stops.length - 1) {
      localTotalProgress += getSegmentProgress(currentIndex);
    }

    const ratio = localTotalProgress / segmentsInView;
    // Logging: Local progress
    // console.log('[LiveTripProgress] localProgress:', { localTotalProgress, segmentsInView, ratio });
    return ratio;
  }, [
    isShortView,
    displayedStops.length,
    startIndex,
    endIndex,
    currentIndex,
    getSegmentProgress,
    stops.length, // Added dependency for safety
    overallProgress,
  ]);

  // Use condensed or full progress ratio
  const progressRatio = isShortView ? localProgress : overallProgress;

  React.useEffect(() => {
    // Logging: Progress ratios
    console.log(
      '[LiveTripProgress] progressRatio:',
      progressRatio,
      'localProgress:',
      localProgress,
      'overallProgress:',
      overallProgress,
    );
  }, [progressRatio, localProgress, overallProgress]);

  // Decide dot styling
  const getDotClasses = (idx: number) => {
    if (idx < currentIndex) return 'bg-green-500';
    // The current stop. If the bus is at this stop, it should pulse.
    // If it's *between* this stop and the next (i.e., this stop is the `currentIndex`),
    // it should still be highlighted as the "last confirmed" stop.
    if (idx === currentIndex) {
      // If the current stop has status 'Arrived', it's actively at this stop.
      // If it's 'Departed' or 'Predicted', it's already left, so the pulse should be on the line, not the dot.
      // For this component, we'll pulse the dot if it's the `currentIndex` and not yet departed (if 'Arrived' or null/undefined)
      // Otherwise, if it's 'Departed' or 'Predicted', we treat it as "past" and it should be green.
      const status = stops[idx]?.status;
      if (status === 'Arrived' || status === undefined || status === null) {
        return 'bg-white border-4 border-green-500 animate-pulse';
      } else {
        return 'bg-green-500'; // If departed or predicted, it's effectively past this stop.
      }
    }
    return 'bg-white border-2 border-gray-300';
  };

  return (
    <>
      {/* Short/full toggle */}
      <div className="flex justify-end mb-2">
        <button
          className="text-sm text-primary underline"
          onClick={() => {
            setIsShortView((v) => !v);
            console.log(
              '[LiveTripProgress] Toggled isShortView:',
              !isShortView,
            );
          }}
        >
          {isShortView ? 'Show full route' : 'Show condensed view'}
        </button>
      </div>
      <div className={`relative pl-8 py-2 ${isShortView ? 'h-48' : ''}`}>
        {/* Base vertical line */}
        <div className="absolute left-3 top-0 bottom-0 w-1 bg-gray-200 rounded" />

        {/* Progress vertical line */}
        <div
          className="absolute left-3 top-0 w-1 bg-green-500 rounded transition-all duration-500 ease-out"
          style={{ height: `${progressRatio * 100}%` }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progressRatio * 100)}
        />

        {isShortView ? (
          <div className="relative flex flex-col h-full justify-between z-10">
            {displayedStops.map((stop, localIdx) => {
              const fullIdx = startIndex + localIdx;
              // Logging: Each displayed stop in short view
              // console.log('[LiveTripProgress] Rendered stop (short view):', { stop, fullIdx, currentIndex });
              return (
                <div key={stop.stopNumber} className="relative">
                  <span
                    className={`absolute left-1.5 top-0 w-4 h-4 rounded-full ${getDotClasses(fullIdx)}`}
                  />
                  <div className="ml-8">
                    <span className="font-medium leading-tight block">
                      {stop.stopName}
                    </span>
                    <span className="text-xs text-muted-foreground block">
                      {stop.time} {fullIdx === currentIndex && '(Now)'}
                    </span>
                    {(stop.status === 'Departed' ||
                      stop.status === 'Predicted' ||
                      stop.status === 'Arrived') && // Include 'Arrived' for delta if needed
                      (stop.status === 'Predicted' &&
                      nowSeconds > toSeconds(stop.time) ? (
                        <span className="text-xs text-red-500 block">
                          Delayed
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground block">
                          {formatDelta(toSeconds(stop.time))}
                        </span>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <ul className="space-y-8 relative z-10">
            {displayedStops.map((stop, localIdx) => {
              const fullIdx = startIndex + localIdx;
              // Logging: Each displayed stop in full view
              // console.log('[LiveTripProgress] Rendered stop (full view):', { stop, fullIdx, currentIndex });
              return (
                <li key={stop.stopNumber} className="relative">
                  <span
                    className={`absolute left-1.5 top-2 w-4 h-4 rounded-full ${getDotClasses(fullIdx)}`}
                  />
                  <div className="ml-8">
                    <span className="font-medium leading-tight block">
                      {stop.stopName}
                    </span>
                    <span className="text-xs text-muted-foreground block">
                      {stop.time} {fullIdx === currentIndex && '(Now)'}
                    </span>
                    {(stop.status === 'Departed' ||
                      stop.status === 'Predicted' ||
                      stop.status === 'Arrived') && // Include 'Arrived' for delta if needed
                      (stop.status === 'Predicted' &&
                      nowSeconds > toSeconds(stop.time) ? (
                        <span className="text-xs text-red-500 block">
                          Delayed
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground block">
                          {formatDelta(toSeconds(stop.time))}
                        </span>
                      ))}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
};

export default LiveTripProgress;
