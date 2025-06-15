import { useQuery } from '@tanstack/react-query';
import { SearchResultsSchema, type SearchResults } from '../types';

/**
 * Search API functions using React Query
 *
 * TODO: Replace with your actual API endpoints
 * Implement proper error handling and caching strategies
 */

// Mock API function - replace with your actual API call
async function searchBusesAndStops(query: string): Promise<SearchResults> {
  // TODO: Replace with your actual API endpoint
  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);

  if (!response.ok) {
    throw new Error('Search failed');
  }

  const data = await response.json();

  // Validate response with Zod schema
  return SearchResultsSchema.parse(data);
}

// React Query hook for search
export function useSearch(query: string, enabled = true) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => searchBusesAndStops(query),
    enabled: enabled && query.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}

// Real-time route tracking
export function useRouteTracking(routeId: string, enabled = true) {
  return useQuery({
    queryKey: ['route-tracking', routeId],
    queryFn: async () => {
      // TODO: Replace with your actual API endpoint
      const response = await fetch(`/api/routes/${routeId}/tracking`);
      if (!response.ok) throw new Error('Failed to fetch route tracking');
      return response.json();
    },
    enabled,
    refetchInterval: 10000, // Refetch every 10 seconds for live updates
    staleTime: 5000, // Consider data stale after 5 seconds
  });
}
import { useQuery } from '@tanstack/react-query';
import { SearchResultsSchema, type SearchResults } from '../types';

/**
 * Search API functions using React Query
 *
 * TODO: Replace with your actual API endpoints
 * Implement proper error handling and caching strategies
 */

// Mock API function - replace with your actual API call
async function searchBusesAndStops(query: string): Promise<SearchResults> {
  // TODO: Replace with your actual API endpoint
  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);

  if (!response.ok) {
    throw new Error('Search failed');
  }

  const data = await response.json();

  // Validate response with Zod schema
  return SearchResultsSchema.parse(data);
}

// React Query hook for search
export function useSearch(query: string, enabled = true) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => searchBusesAndStops(query),
    enabled: enabled && query.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}

// Real-time route tracking
export function useRouteTracking(routeId: string, enabled = true) {
  return useQuery({
    queryKey: ['route-tracking', routeId],
    queryFn: async () => {
      // TODO: Replace with your actual API endpoint
      const response = await fetch(`/api/routes/${routeId}/tracking`);
      if (!response.ok) throw new Error('Failed to fetch route tracking');
      return response.json();
    },
    enabled,
    refetchInterval: 10000, // Refetch every 10 seconds for live updates
    staleTime: 5000, // Consider data stale after 5 seconds
  });
}
