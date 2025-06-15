import { useQuery } from '@tanstack/react-query';
import { searchRoutesQuery } from '~/lib/queries/routes';
import { Route } from '~/schemas/routeSchema';

export const useSearchRoutesQuery = (
  searchSlug: string,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    ...searchRoutesQuery(searchSlug),
    ...options,
  });
};
