import { useQuery } from '@tanstack/react-query';
import { routeByIdQuery } from '~/lib/queries/routes';

export const useRouteQuery = (
  routeId: string,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    ...routeByIdQuery(routeId),
    ...options,
  });
};
