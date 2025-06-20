import { apiFetch } from "~/lib/apiClient";
import { ExternalStopDataSchema } from "~/schemas";
import type { ExternalStopData } from "~/schemas/externalStopDataSchema";

export const getExternalStopDataQuery = (stopId: string) => {
  return {
    queryKey: ["external-stop-data", stopId],
    queryFn: () =>
      apiFetch<ExternalStopData[]>(
        `/api/stop/${stopId}/externalStopData`,
        undefined,
        {
          responseSchema: ExternalStopDataSchema.array(),
          cacheLifetimeMs: 10 * 1000, // 10 seconds
        },
      ),
  };
};
