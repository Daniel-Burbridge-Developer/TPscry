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
