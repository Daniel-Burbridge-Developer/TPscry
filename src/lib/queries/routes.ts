import { apiFetch } from '~/lib/apiClient';
import { routeSchema, Route } from '~/schemas/routeSchema';

export const searchRoutesQuery = (searchSlug: string) => ({
  queryKey: ['routes', 'search', searchSlug],
  queryFn: (): Promise<Route[]> =>
    apiFetch(`/api/fuzzy/route/${searchSlug}`, undefined, {
      responseSchema: routeSchema.array(),
    }),
  staleTime: 1000 * 60 * 60 * 10, // 10 Hours
});
