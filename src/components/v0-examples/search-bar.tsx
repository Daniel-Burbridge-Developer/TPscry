"use client";

import type React from "react";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface SearchBarProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearch: () => void;
}

/**
 * SearchBar Component
 *
 * TODO for your implementation:
 * - Connect to your search state management (Zustand store)
 * - Add debounced search functionality with React Query
 * - Implement search suggestions/autocomplete
 * - Add search validation with Zod if needed
 */
export function SearchBar({
  searchQuery,
  onSearchQueryChange,
  onSearch,
}: SearchBarProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  return (
    <Card className="mb-4 shadow-lg sm:mb-6">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="Search for bus routes or stops..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              onKeyPress={handleKeyPress}
              className="h-11 pl-10 text-base sm:h-12 sm:text-lg"
            />
          </div>
          <Button
            onClick={onSearch}
            size="lg"
            className="h-11 px-6 sm:h-12 sm:px-8"
          >
            Search
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
