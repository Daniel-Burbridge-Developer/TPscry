import { apiFetch } from "~/lib/apiClient";
import { routeSchema, Route } from "~/schemas/routeSchema";

export const searchRoutesQuery = (searchSlug: string) => ({
  queryKey: ["routes", "search", searchSlug],
  queryFn: (): Promise<Route[]> =>
    apiFetch(`/api/fuzzy/route/${searchSlug}`, undefined, {
      responseSchema: routeSchema.array(),
    }),
});

export const routeByIdQuery = (routeId: string) => ({
  queryKey: ["route", routeId],
  queryFn: (): Promise<Route> =>
    apiFetch(`/api/route/${routeId}`, undefined, {
      responseSchema: routeSchema,
    }),
});
