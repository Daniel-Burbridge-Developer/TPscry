import { useQuery } from "@tanstack/react-query";
import { getExternalStopDataQuery } from "~/lib/queries/externalStopData";

export const useExternalStopData = (
  stopId: string,
  options?: { enabled?: boolean; refetchInterval?: number },
) => {
  return useQuery({
    ...getExternalStopDataQuery(stopId),
    ...options,
  });
};
