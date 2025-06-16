import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { db } from "~/db";
import { stops } from "~/db/schema/stops";
import { StopSelectZodSchema } from "~/schemas/stopSchema";
import { corsMiddleware } from "~/lib/cors";
import { ilike, or, sql } from "drizzle-orm";

export const ServerRoute = createServerFileRoute(
  "/api/fuzzy/stop/$searchSlug",
).methods({
  GET: async ({ request, params }) => {
    console.log("🔍 Fuzzy stop search called with params:", params);
    console.log("🔍 Request URL:", request.url);

    // Handle CORS pre-flight
    if (request.method === "OPTIONS") {
      console.log("🔍 Handling OPTIONS request");
      const corsResponse = corsMiddleware(request);
      if (corsResponse) {
        console.log("🔍 Returning CORS response");
        return corsResponse;
      }
    }

    try {
      const searchTerm = `%${params.searchSlug}%`;
      console.log("🔍 Search term:", searchTerm);

      // Perform fuzzy search on stop name
      console.log("🔍 Executing database query...");
      const matchingStops = await db
        .select({
          id: stops.id,
          name: stops.name,
          lat: stops.lat,
          lon: stops.lon,
          zoneId: stops.zoneId,
          supportedModes: stops.supportedModes,
        })
        .from(stops)
        .where(
          or(
            ilike(stops.name, searchTerm),
            ilike(sql`${stops.id}::text`, searchTerm),
          ),
        )
        .limit(5);

      console.log("🔍 Found stops:", matchingStops.length);

      // Validate result
      const validatedStops = StopSelectZodSchema.array().parse(matchingStops);
      console.log("🔍 Validated stops:", validatedStops.length);

      return json(validatedStops || []);
    } catch (error) {
      console.error("❌ Error searching stops:", error);
      return json({ error: "Internal server error" }, { status: 500 });
    }
  },
});
