"use client";

import { Clock, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RecentSearchesProps {
  recentSearches: string[];
  onSearchSelect: (search: string) => void;
}

/**
 * RecentSearches Component
 *
 * TODO for your implementation:
 * - Connect to your Zustand store for recent searches
 * - Add search history persistence (localStorage or database)
 * - Add clear history functionality
 * - Limit number of recent searches displayed
 * - Add search frequency/popularity sorting
 */
export function RecentSearches({
  recentSearches,
  onSearchSelect,
}: RecentSearchesProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
          Recent Searches
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1 sm:space-y-2">
          {recentSearches.map((search, index) => (
            <div
              key={index}
              className="flex cursor-pointer items-center justify-between rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 sm:p-3"
              onClick={() => onSearchSelect(search)}
            >
              <span className="text-sm">{search}</span>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
