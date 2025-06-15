import { apiFetch } from '~/lib/apiClient';
import { ExternalStopDataSchema } from '~/schemas';

export const getExternalStopDataQuery = (stopId: string) => {
  return {
    queryKey: ['external-stop-data', stopId],
    queryFn: () =>
      apiFetch(`/api/stop/${stopId}/externalStopData`, undefined, {
        responseSchema: ExternalStopDataSchema.array(),
        cacheLifetimeMs: 10 * 1000, // 10 seconds
      }),
  };
};
