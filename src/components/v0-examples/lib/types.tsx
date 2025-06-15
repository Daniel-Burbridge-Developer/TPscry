import { z } from 'zod';

/**
 * Zod Schemas for Type Safety
 *
 * TODO: Define your complete data schemas here
 * These schemas will provide runtime validation and TypeScript types
 */

// Route schema
export const RouteSchema = z.object({
  id: z.string(),
  destination: z.string(),
  isLive: z.boolean(),
  progress: z.number().min(0).max(100),
  nextStop: z.string(),
  eta: z.string(),
});

// Bus schema
export const BusSchema = z.object({
  id: z.string(),
  name: z.string(),
  routes: z.array(RouteSchema),
});

// Stop route schema
export const StopRouteSchema = z.object({
  id: z.string(),
  routeNumber: z.string(),
  destination: z.string(),
  isLive: z.boolean(),
  progress: z.number().min(0).max(100),
  nextBus: z.string(),
  eta: z.string(),
});

// Bus stop schema
export const BusStopSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.literal('stop'),
  routes: z.array(StopRouteSchema),
});

// Search results schema
export const SearchResultsSchema = z.object({
  buses: z.array(BusSchema),
  stops: z.array(BusStopSchema),
});

// Export TypeScript types
export type Route = z.infer<typeof RouteSchema>;
export type Bus = z.infer<typeof BusSchema>;
export type StopRoute = z.infer<typeof StopRouteSchema>;
export type BusStop = z.infer<typeof BusStopSchema>;
export type SearchResults = z.infer<typeof SearchResultsSchema>;
