import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTripLiveDetailsQuery } from "~/lib/queries/tripLiveDetails";
import type { TripLiveDetails } from "~/schemas/tripLiveDetailsSchema";

interface UseTripLiveDetailsOptions {
  /**
   * How often (in ms) to refetch the live-trip details.
   * Defaults to 10 seconds, which matches the server-side cache TTL.
   */
  pollingIntervalMs?: number;
  /** Whether the query should be enabled. */
  enabled?: boolean;
}

export const useTripLiveDetails = (
  fleetNumber: string | null | undefined,
  {
    pollingIntervalMs = 10_000,
    enabled = true,
  }: UseTripLiveDetailsOptions = {},
) => {
  const queryResult = useQuery<TripLiveDetails>({
    ...getTripLiveDetailsQuery(fleetNumber ?? ""),
    enabled: enabled && !!fleetNumber,
    refetchInterval: pollingIntervalMs,
    staleTime: pollingIntervalMs,
  });

  // Derive some helpful computed values from the raw data
  const derived = useMemo(() => {
    const data = queryResult.data;
    if (!data)
      return {
        currentStop: null,
        nextStop: null,
        currentStopId: null,
      } as const;

    // The current stop is the **last** stop with status "Departed"
    const currentStop =
      [...data.stops].reverse().find((s) => s.status === "Departed") ?? null;

    const currentStopId = currentStop?.stopNumber ?? null;

    // The next stop is the first stop that hasn't departed yet
    const nextStop = data.stops.find((s) => s.status !== "Departed") ?? null;

    return { currentStop, nextStop, currentStopId } as const;
  }, [queryResult.data]);

  return {
    ...queryResult,
    ...derived,
  };
};
