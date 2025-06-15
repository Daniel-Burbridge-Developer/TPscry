'use client';

import { Badge } from '@/components/ui/badge';

// TODO: Replace with your Zod schema types
interface Stop {
  name: string;
  status: 'completed' | 'current' | 'upcoming';
  time: string;
}

/**
 * FullRouteView Component
 *
 * TODO for your implementation:
 * - Replace Stop interface with your Zod schema
 * - Add real-time stop updates using React Query
 * - Implement stop details (facilities, accessibility)
 * - Add estimated arrival times for each stop
 * - Add stop-specific alerts/disruptions
 */

// Mock data - replace with your real data source
const routeStops: Stop[] = [
  { name: 'Perth Station', status: 'completed', time: '2:15 PM' },
  { name: 'Wellington St Station', status: 'completed', time: '2:18 PM' },
  { name: 'Hay Street Mall', status: 'completed', time: '2:22 PM' },
  { name: 'Murray Street Mall', status: 'current', time: '2:25 PM' },
  { name: 'St Georges Terrace', status: 'upcoming', time: '2:28 PM' },
  { name: 'Kings Park Rd', status: 'upcoming', time: '2:32 PM' },
  { name: 'Thomas Street', status: 'upcoming', time: '2:35 PM' },
  { name: 'Wembley Station', status: 'upcoming', time: '2:40 PM' },
];

export function FullRouteView() {
  return (
    <div className="space-y-3 sm:space-y-4">
      <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">
        Complete Route
      </h3>
      <div className="relative">
        {/* Vertical progress line */}
        <div className="absolute left-5 sm:left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
        <div
          className="absolute left-5 sm:left-6 top-0 w-0.5 bg-blue-500"
          style={{ height: '37.5%' }}
        ></div>

        {routeStops.map((stop, index) => (
          <div
            key={index}
            className="relative flex items-start gap-3 sm:gap-4 pb-4 sm:pb-6"
          >
            <div
              className={`relative z-10 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 mt-1 ${
                stop.status === 'completed'
                  ? 'bg-blue-500 border-blue-500'
                  : stop.status === 'current'
                    ? 'bg-yellow-500 border-yellow-500 animate-pulse'
                    : 'bg-white border-gray-300 dark:bg-gray-800 dark:border-gray-600'
              }`}
            ></div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0">
                <h4
                  className={`font-medium text-sm sm:text-base ${
                    stop.status === 'current'
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {stop.name}
                </h4>
                <span className="text-xs sm:text-sm text-gray-500">
                  {stop.time}
                </span>
              </div>
              <Badge
                variant={
                  stop.status === 'completed'
                    ? 'default'
                    : stop.status === 'current'
                      ? 'destructive'
                      : 'secondary'
                }
                className="mt-1 text-xs"
              >
                {stop.status === 'completed'
                  ? 'Completed'
                  : stop.status === 'current'
                    ? 'Current Stop'
                    : 'Upcoming'}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
