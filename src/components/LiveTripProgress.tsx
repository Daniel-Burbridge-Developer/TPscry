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
  // Determine the index of the current stop. If not found, default to -1.
  const currentIndex = React.useMemo(() => {
    if (!currentStopId) return -1;
    return stops.findIndex((s) => s.stopNumber === currentStopId);
  }, [currentStopId, stops]);

  // Helper to decide styling based on position relative to current index
  const getBulletClasses = (idx: number) => {
    if (currentIndex === -1) return 'bg-muted-foreground';
    if (idx < currentIndex) return 'bg-muted-foreground'; // Past stops
    if (idx === currentIndex) return 'bg-green-500 animate-pulse shadow-md'; // Current stop
    return 'bg-yellow-500'; // Upcoming stops
  };

  return (
    <ul className="relative space-y-4 pt-2">
      {stops.map((stop, idx) => (
        <li key={stop.stopNumber} className="pl-7 relative flex flex-col">
          {/* Vertical line connecting bullets */}
          {idx < stops.length - 1 && (
            <span
              className="absolute left-3 top-4 w-px h-full bg-border/40"
              aria-hidden="true"
            />
          )}

          {/* Bullet */}
          <span
            className={
              'absolute left-2.5 top-2 w-3 h-3 rounded-full ' +
              getBulletClasses(idx)
            }
          />

          <div className="flex items-baseline">
            <span className="font-medium text-sm leading-none">
              {stop.stopName}
            </span>
            <span className="ml-2 text-xs text-muted-foreground whitespace-nowrap">
              {stop.time}
              {idx === currentIndex && ' (At Stop)'}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            Stop {stop.stopNumber}
          </span>
        </li>
      ))}
    </ul>
  );
};

export default LiveTripProgress;
