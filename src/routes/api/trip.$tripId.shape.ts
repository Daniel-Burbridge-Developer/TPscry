import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { db } from "~/db";
import { trips } from "~/db/schema/trips";
import { shapes } from "~/db/schema/shapes";
import { ShapeSelectZodSchema } from "~/schemas/shapeSchema";
import { corsMiddleware } from "~/lib/cors";
import { z } from "zod";

// Validate tripId as non-empty string
const tripIdSchema = z.string().min(1, "tripId required");

export const ServerRoute = createServerFileRoute(
  "/api/trip/$tripId/shape",
).methods({
  GET: async ({ request, params }) => {
    // Handle CORS pre-flight
    if (request.method === "OPTIONS") {
      const resp = corsMiddleware(request);
      if (resp) return resp;
    }

    // Validate path param
    const rawTripId = (params as { tripId: string }).tripId;
    const parsed = tripIdSchema.safeParse(rawTripId);
    if (!parsed.success) {
      return json({ error: "Invalid tripId" }, { status: 400 });
    }

    try {
      // Fetch trip record first
      const trip = await db.query.trips.findFirst({
        where: (t, { eq }) => eq(t.id, parsed.data),
      });
      if (!trip) return json({ error: "Trip not found" }, { status: 404 });

      const shapeIdStr = trip.shapeId;
      if (!shapeIdStr) {
        return json({ error: "Trip does not have a shapeId" }, { status: 404 });
      }

      const shapeIdNum = Number(shapeIdStr);
      if (Number.isNaN(shapeIdNum)) {
        return json(
          { error: "ShapeId on trip is not numeric" },
          { status: 500 },
        );
      }

      // Fetch shape by ID
      const shape = await db.query.shapes.findFirst({
        where: (s, { eq }) => eq(s.id, shapeIdNum),
      });
      if (!shape) {
        return json({ error: "Shape not found" }, { status: 404 });
      }

      const validatedShape = ShapeSelectZodSchema.parse(shape);
      return json(validatedShape);
    } catch (err) {
      console.error("shape-by-trip fetch error", err);
      return json({ error: "Internal server error" }, { status: 500 });
    }
  },
});
