import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useExternalStopData } from "~/hooks/useExternalStopData";
import { apiFetch } from "~/lib/apiClient";
import { TripSelectZodSchema, type Trip } from "~/schemas/tripSchema";
import { ShapeSelectZodSchema, Shape } from "~/schemas/shapeSchema";

// Helper fetchers
const fetchTrip = async (tripId: string): Promise<Trip> => {
  return apiFetch<Trip>(`/api/trip/${tripId}`, undefined, {
    responseSchema: TripSelectZodSchema,
  });
};

const fetchShape = async (shapeId: string | number): Promise<Shape> => {
  return apiFetch<Shape>(`/api/shape/${shapeId}`, undefined, {
    responseSchema: ShapeSelectZodSchema,
  });
};

export const useShapeFromLiveStop = (
  stopId: string | null | undefined,
  routeNumber: string | null | undefined,
  options?: { enabled?: boolean; refetchInterval?: number },
) => {
  // Query external stop data first
  const externalQuery = useExternalStopData(stopId ?? "", {
    enabled: (options?.enabled ?? true) && !!stopId,
    refetchInterval: options?.refetchInterval ?? 10000,
  });

  // Derive live tripId (if any)
  const liveTripId = useMemo(() => {
    const rows = externalQuery.data ?? [];
    const normalise = (s: string | null | undefined) =>
      (s ?? "").replace(/^0+/, "").toLowerCase();

    const targetRoute = normalise(routeNumber);

    const live = rows.find((r) => {
      if (!r.liveStatus || !r.tripId) return false;
      if (!routeNumber) return true;
      // Compare after normalising leading zeros / case differences.
      return normalise(r.busNumber) === targetRoute;
    });
    return live?.tripId ?? null;
  }, [externalQuery.data, routeNumber]);

  // Trip query
  const tripQuery = useQuery<Trip>({
    queryKey: ["trip", liveTripId],
    enabled: !!liveTripId,
    queryFn: () => fetchTrip(liveTripId as string),
    staleTime: 1000 * 60,
  });

  // Shape query
  const shapeId = tripQuery.data?.shapeId ?? null;
  const shapeQuery = useQuery<Shape>({
    queryKey: ["shape", shapeId],
    enabled: !!shapeId,
    queryFn: () => fetchShape(shapeId as string),
    staleTime: 1000 * 60 * 60,
  });

  return {
    external: externalQuery,
    trip: tripQuery,
    shape: shapeQuery,
    shapePoints: shapeQuery.data?.points ?? [],
  } as const;
};
