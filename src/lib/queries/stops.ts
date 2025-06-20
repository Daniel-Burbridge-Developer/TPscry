import { apiFetch } from "~/lib/apiClient";
import { StopSelectZodSchema, Stop } from "~/schemas/stopSchema";

export const searchStopsQuery = (searchSlug: string) => ({
  queryKey: ["stops", "search", searchSlug],
  queryFn: (): Promise<Stop[]> =>
    apiFetch(`/api/fuzzy/stop/${searchSlug}`, undefined, {
      responseSchema: StopSelectZodSchema.array(),
    }),
});
