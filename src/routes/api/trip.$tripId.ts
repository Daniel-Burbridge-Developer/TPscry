import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { db } from "~/db";
import { trips } from "~/db/schema/trips";
import { TripSelectZodSchema } from "~/schemas/tripSchema";
import { corsMiddleware } from "~/lib/cors";
import { z } from "zod";

const tripIdSchema = z.string().min(1);

export const ServerRoute = createServerFileRoute("/api/trip/$tripId").methods({
  GET: async ({ request, params }) => {
    if (request.method === "OPTIONS") {
      const resp = corsMiddleware(request);
      if (resp) return resp;
    }

    const tripId = (params as { tripId: string }).tripId;
    const parsed = tripIdSchema.safeParse(tripId);
    if (!parsed.success) {
      return json({ error: "Invalid tripId" }, { status: 400 });
    }
    try {
      const trip = await db.query.trips.findFirst({
        where: (tbl, { eq }) => eq(tbl.id, parsed.data),
      });
      if (!trip) return json({ error: "Trip not found" }, { status: 404 });

      // Ensure stops array and required fields
      const processedTrip = {
        ...trip,
        stops:
          (trip.stops as any[] | null)?.map((s: any, idx: number) => ({
            id: s?.id ?? "",
            arrivalTime: s?.arrivalTime ?? "",
            Sequence: s?.Sequence ?? idx + 1,
          })) ?? [],
      } as const;

      const validatedTrip = TripSelectZodSchema.parse(processedTrip);
      return json(validatedTrip);
    } catch (err) {
      console.error("trip fetch error", err);
      return json({ error: "Internal server error" }, { status: 500 });
    }
  },
});
