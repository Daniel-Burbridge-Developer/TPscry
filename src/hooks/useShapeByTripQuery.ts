import { useQuery } from "@tanstack/react-query";
import { shapeByTripQuery } from "~/lib/queries/shape";

export const useShapeByTripQuery = (
  tripId: string | null | undefined,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    ...shapeByTripQuery(tripId ?? ""),
    enabled: (options?.enabled ?? true) && !!tripId,
    ...options,
  });
};
