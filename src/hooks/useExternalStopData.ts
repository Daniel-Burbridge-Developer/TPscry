import { useQuery } from "@tanstack/react-query";
import { getExternalStopDataQuery } from "~/lib/queries/externalStopData";
import type { ExternalStopData } from "~/schemas/externalStopDataSchema";

export const useExternalStopData = (
  stopId: string,
  options?: { enabled?: boolean; refetchInterval?: number },
) => {
  return useQuery<ExternalStopData[]>({
    ...getExternalStopDataQuery(stopId),
    ...options,
  });
};
