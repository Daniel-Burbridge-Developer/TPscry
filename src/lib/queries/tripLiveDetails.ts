import { z } from 'zod';
import { apiFetch } from '~/lib/apiClient';
import {
  TripLiveDetailsSchema,
  TripLiveDetails,
} from '~/schemas/tripLiveDetailsSchema';

// The server returns { data: TripLiveDetails }
const TripLiveDetailsResponseSchema = z.object({
  data: TripLiveDetailsSchema,
});

export const getTripLiveDetailsQuery = (fleetNumber: string) => {
  return {
    queryKey: ['trip-live-details', fleetNumber],
    queryFn: () =>
      apiFetch<{ data: TripLiveDetails }>(
        `/api/fleet/${fleetNumber}/externalLiveTrack`,
        undefined,
        {
          responseSchema: TripLiveDetailsResponseSchema,
          cacheLifetimeMs: 10 * 1000,
        },
      ).then((res) => res.data),
  } as const;
};
