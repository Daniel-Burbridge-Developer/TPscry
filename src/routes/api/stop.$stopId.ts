import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { db } from "~/db";
import { stops } from "~/db/schema/stops";
import { StopSelectZodSchema } from "~/schemas/stopSchema";
import { corsMiddleware } from "~/lib/cors";
import { z } from "zod";

const stopIdSchema = z.string().min(1);

export const ServerRoute = createServerFileRoute("/api/stop/$stopId").methods({
  GET: async ({ request, params }) => {
    if (request.method === "OPTIONS") {
      const resp = corsMiddleware(request);
      if (resp) return resp;
    }

    const parsed = stopIdSchema.safeParse(
      (params as { stopId: string }).stopId,
    );
    if (!parsed.success) {
      return json({ error: "Invalid stopId" }, { status: 400 });
    }

    try {
      const stop = await db.query.stops.findFirst({
        where: (s, { eq }) => eq(s.id, Number(parsed.data)),
      });
      if (!stop) return json({ error: "Stop not found" }, { status: 404 });
      const validated = StopSelectZodSchema.parse(stop);
      return json(validated);
    } catch (err) {
      console.error("stop fetch error", err);
      return json({ error: "Internal server error" }, { status: 500 });
    }
  },
});
