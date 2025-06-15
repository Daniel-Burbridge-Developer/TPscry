"use client"

import type React from "react"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface SearchBarProps {
  searchQuery: string
  onSearchQueryChange: (query: string) => void
  onSearch: () => void
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
export function SearchBar({ searchQuery, onSearchQueryChange, onSearch }: SearchBarProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSearch()
    }
  }

  return (
    <Card className="mb-4 sm:mb-6 shadow-lg">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search for bus routes or stops..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 h-11 sm:h-12 text-base sm:text-lg"
            />
          </div>
          <Button onClick={onSearch} size="lg" className="px-6 sm:px-8 h-11 sm:h-12">
            Search
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
