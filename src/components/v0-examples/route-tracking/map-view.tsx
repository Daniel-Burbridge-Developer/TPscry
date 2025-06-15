"use client";

import { Map } from "lucide-react";

/**
 * MapView Component
 *
 * TODO for your implementation:
 * - Integrate Leaflet or Google Maps
 * - Add real-time bus location markers
 * - Implement route path visualization
 * - Add stop markers with popup information
 * - Add user location and nearby stops
 * - Implement map controls (zoom, center, etc.)
 * - Add traffic information if available
 */
export function MapView() {
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
            Replace this placeholder with Leaflet or Google Maps integration
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
