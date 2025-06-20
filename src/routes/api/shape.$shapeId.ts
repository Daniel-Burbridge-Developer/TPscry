import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { db } from "~/db";
import { shapes } from "~/db/schema/shapes";
import { ShapeSelectZodSchema } from "~/schemas/shapeSchema";
import { corsMiddleware } from "~/lib/cors";
import { z } from "zod";

const shapeIdSchema = z.string().min(1);

export const ServerRoute = createServerFileRoute("/api/shape/$shapeId").methods(
  {
    GET: async ({ request, params }) => {
      if (request.method === "OPTIONS") {
        const resp = corsMiddleware(request);
        if (resp) return resp;
      }

      const parsed = shapeIdSchema.safeParse(
        (params as { shapeId: string }).shapeId,
      );
      if (!parsed.success) {
        return json({ error: "Invalid shapeId" }, { status: 400 });
      }

      try {
        const shape = await db.query.shapes.findFirst({
          where: (tbl, { eq }) => eq(tbl.id, Number(parsed.data)),
        });
        if (!shape) return json({ error: "Shape not found" }, { status: 404 });
        const validated = ShapeSelectZodSchema.parse(shape);
        return json(validated);
      } catch (err) {
        console.error("shape fetch error", err);
        return json({ error: "Internal server error" }, { status: 500 });
      }
    },
  },
);
