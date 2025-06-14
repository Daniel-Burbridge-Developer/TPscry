import { useQuery } from '@tanstack/react-query';
import { tripsByRouteQuery } from '~/lib/queries/trips';

export const useRouteTripsQuery = (
  routeId: string,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    ...tripsByRouteQuery(routeId),
    ...options,
  });
};
