'use client';

import { Map } from 'lucide-react';

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
      <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">
        Live Map Tracking
      </h3>
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg h-64 sm:h-96 flex items-center justify-center">
        <div className="text-center px-4">
          <Map className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-2">
            Interactive Map View
          </p>
          <p className="text-xs sm:text-sm text-gray-500">
            Replace this placeholder with Leaflet or Google Maps integration
          </p>
          <div className="mt-3 sm:mt-4 space-y-2">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-blue-500 rounded-full"></div>
              <span className="text-xs sm:text-sm">Bus Location</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
              <span className="text-xs sm:text-sm">Bus Stops</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
