import { apiFetch } from "~/lib/apiClient";
import { ShapeSelectZodSchema, Shape } from "~/schemas/shapeSchema";

export const shapeByIdQuery = (shapeId: string | number) =>
  ({
    queryKey: ["shape", shapeId],
    queryFn: (): Promise<Shape> =>
      apiFetch(`/api/shape/${shapeId}`, undefined, {
        responseSchema: ShapeSelectZodSchema,
      }),
  }) as const;

export const shapeByTripQuery = (tripId: string) =>
  ({
    queryKey: ["shape", "byTrip", tripId],
    queryFn: (): Promise<Shape> =>
      apiFetch(`/api/trip/${tripId}/shape`, undefined, {
        responseSchema: ShapeSelectZodSchema,
      }),
  }) as const;
