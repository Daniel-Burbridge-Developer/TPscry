import { useQuery } from '@tanstack/react-query';
import { searchStopsQuery } from '~/lib/queries/stops';

export const useSearchStopsQuery = (
  searchSlug: string,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    ...searchStopsQuery(searchSlug),
    ...options,
  });
};
