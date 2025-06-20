import { apiFetch } from "~/lib/apiClient";
import { StopSelectZodSchema, Stop } from "~/schemas/stopSchema";

export const stopByIdQuery = (stopId: string) => ({
  queryKey: ["stop", stopId] as const,
  queryFn: (): Promise<Stop> =>
    apiFetch(`/api/stop/${stopId}`, undefined, {
      responseSchema: StopSelectZodSchema,
    }),
});
