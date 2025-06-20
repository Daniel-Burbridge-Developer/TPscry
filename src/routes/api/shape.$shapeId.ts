import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { db } from "~/db";
import { shapes } from "~/db/schema/shapes";
import { ShapeSelectZodSchema } from "~/schemas/shapeSchema";
import { corsMiddleware } from "~/lib/cors";
import { z } from "zod";

// Accept any non-empty path segment, we'll coerce to number later
const shapeIdSchema = z.string().min(1, "shapeId required");

export const ServerRoute = createServerFileRoute("/api/shape/$shapeId").methods(
  {
    /**
     * GET /api/shape/:shapeId → Shape
     * Example: /api/shape/123
     */
    GET: async ({ request, params }) => {
      // CORS pre-flight
      if (request.method === "OPTIONS") {
        const resp = corsMiddleware(request);
        if (resp) return resp;
      }

      // -----------------------------
      // Validate & coerce the path param
      // -----------------------------
      const rawId = (params as { shapeId: string }).shapeId;
      const parsed = shapeIdSchema.safeParse(rawId);
      if (!parsed.success) {
        return json({ error: "Invalid shapeId" }, { status: 400 });
      }

      const shapeIdNum = Number(parsed.data);
      if (Number.isNaN(shapeIdNum)) {
        return json({ error: "shapeId must be numeric" }, { status: 400 });
      }

      try {
        // -----------------------------
        // Fetch from DB
        // -----------------------------
        const shape = await db.query.shapes.findFirst({
          where: (s, { eq }) => eq(s.id, shapeIdNum),
        });

        if (!shape) {
          return json({ error: "Shape not found" }, { status: 404 });
        }

        // -----------------------------
        // Validate / coerce to API schema
        // -----------------------------
        // Ensure each point has capitalised Sequence property for schema
        const processedShape = {
          ...shape,
          points: (shape.points as any[]).map((pt: any, idx: number) => ({
            lat: pt.lat,
            lon: pt.lon,
            Sequence: pt.Sequence ?? pt.sequence ?? pt.seq ?? idx,
          })),
        } as const;

        const validatedShape = ShapeSelectZodSchema.parse(processedShape);

        return json(validatedShape);
      } catch (err) {
        console.error("shape fetch error", err);
        return json({ error: "Internal server error" }, { status: 500 });
      }
    },
  },
);
