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

  // Update current time periodically to animate progress (every 2s)
  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 2_000);
    return () => clearInterval(id);
  }, []);

  // Parse a time string (e.g., "5:18pm" or "17:18") into minutes past midnight
  const toMinutes = (t?: string | null) => {
    if (!t) return NaN;
    // Attempt ISO parse first
    const iso = Date.parse(t);
    if (!isNaN(iso)) {
      const d = new Date(iso);
      return d.getHours() * 60 + d.getMinutes();
    }

    const match = t
      .trim()
      .toLowerCase()
      .match(/^(\d{1,2}):(\d{2})(am|pm)?$/);
    if (!match) return NaN;
    let [_, hStr, mStr, ampm] = match;
    let hours = parseInt(hStr, 10);
    const minutes = parseInt(mStr, 10);
    if (ampm) {
      if (ampm === 'pm' && hours !== 12) hours += 12;
      if (ampm === 'am' && hours === 12) hours = 0;
    }
    return hours * 60 + minutes;
  };

  const nowMinutes = (() => {
    const d = new Date(now);
    return d.getHours() * 60 + d.getMinutes();
  })();

  // Determine the index of the current stop. If not found, default to -1.
  const currentIndex = React.useMemo(() => {
    if (!currentStopId) return -1;
    return stops.findIndex((s) => s.stopNumber === currentStopId);
  }, [currentStopId, stops]);

  const toSeconds = (t?: string | null) => {
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
    let [_, hStr, mStr, ampm] = match;
    let hours = parseInt(hStr, 10);
    const minutes = parseInt(mStr, 10);
    if (ampm) {
      if (ampm === 'pm' && hours !== 12) hours += 12;
      if (ampm === 'am' && hours === 12) hours = 0;
    }
    return hours * 3600 + minutes * 60;
  };

  const nowSeconds = (() => {
    const d = new Date(now);
    return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
  })();

  // Friendly human-readable delta (e.g., "in 5m", "3m ago", "Arriving soon")
  const formatDelta = (timeSec: number): string => {
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
  };

  const getSegmentProgress = (idx: number): number => {
    // Before current segment: fully filled if stop has passed
    if (idx < currentIndex) return 1;
    // After current segment: no progress
    if (idx > currentIndex) return 0;
    // Only allow progress on the segment if this stop has departed or predicted,
    // and the next stop is at least predicted (i.e., known arrival).
    const thisStatus = stops[idx]?.status;
    const nextStatus = stops[idx + 1]?.status;
    if (!['Departed', 'Predicted'].includes(thisStatus)) return 0;
    if (!['Predicted', 'Departed'].includes(nextStatus)) return 0;
    // Compute time-based ratio
    const start = toSeconds(stops[idx].time);
    const end = toSeconds(stops[idx + 1]?.time);
    if (isNaN(start) || isNaN(end) || end <= start) return 0;
    const ratio = (nowSeconds - start) / (end - start);
    return Math.min(1, Math.max(0, ratio));
  };

  const overallProgress = React.useMemo(() => {
    if (stops.length < 2) return 0;
    const seg = currentIndex < 0 ? 0 : getSegmentProgress(currentIndex);
    return ((currentIndex >= 0 ? currentIndex : 0) + seg) / (stops.length - 1);
  }, [currentIndex, getSegmentProgress, stops.length]);

  // Compute subset of stops for short view
  const startIndex = isShortView ? Math.max(0, currentIndex - 1) : 0;
  const endIndex = isShortView
    ? Math.min(stops.length - 1, currentIndex + 1)
    : stops.length - 1;
  const displayedStops = stops.slice(startIndex, endIndex + 1);

  // Compute local progress ratio for displayed stops
  const localProgress = React.useMemo(() => {
    if (!isShortView || displayedStops.length < 2) return overallProgress;
    const segments = displayedStops.length - 1;
    if (currentIndex < startIndex) return 0;
    if (currentIndex > endIndex) return 1;
    const segIdx = currentIndex - startIndex;
    const segProgress = getSegmentProgress(currentIndex);
    return (segIdx + segProgress) / segments;
  }, [
    isShortView,
    displayedStops.length,
    startIndex,
    endIndex,
    currentIndex,
    getSegmentProgress,
    overallProgress,
  ]);

  // Use condensed or full progress ratio
  const progressRatio = isShortView ? localProgress : overallProgress;

  // Decide dot styling
  const getDotClasses = (idx: number) => {
    if (idx < currentIndex) return 'bg-green-500';
    if (idx === currentIndex)
      return 'bg-white border-4 border-green-500 animate-pulse';
    return 'bg-white border-2 border-gray-300';
  };

  return (
    <>
      {/* Short/full toggle */}
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
                      stop.status === 'Predicted') && (
                      <span className="text-xs text-muted-foreground block">
                        {formatDelta(toSeconds(stop.time))}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <ul className="space-y-8 relative z-10">
            {displayedStops.map((stop, localIdx) => {
              const fullIdx = startIndex + localIdx;
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
                      stop.status === 'Predicted') && (
                      <span className="text-xs text-muted-foreground block">
                        {formatDelta(toSeconds(stop.time))}
                      </span>
                    )}
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
