import { apiFetch } from "~/lib/apiClient";
import { StopSelectZodSchema } from "~/schemas/stopSchema";

export const searchStopsQuery = (searchSlug: string) => ({
  queryKey: ["stops", "search", searchSlug],
  queryFn: () =>
    apiFetch(`/api/fuzzy/stop/${searchSlug}`, undefined, {
      responseSchema: StopSelectZodSchema.array(),
    }),
});
