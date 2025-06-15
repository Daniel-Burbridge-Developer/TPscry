import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { db } from "~/db";
import { routes as routesTable } from "~/db/schema/routes";
import { eq } from "drizzle-orm";
import { routeSchema } from "~/schemas/routeSchema";
import { corsMiddleware } from "~/lib/cors";

export const ServerRoute = createServerFileRoute("/api/route/$routeId").methods(
  {
    GET: async ({ request, params }) => {
      console.log("🚌 Route details fetch called with params:", params);
      console.log("🚌 Request URL:", request.url);

      // Handle CORS only for OPTIONS requests
      if (request.method === "OPTIONS") {
        const corsResponse = corsMiddleware(request);
        if (corsResponse) {
          return corsResponse;
        }
      }

      try {
        const routeId = params.routeId;

        if (!routeId) {
          return json(
            { error: "routeId parameter is required" },
            { status: 400 },
          );
        }

        const foundRoutes = await db
          .select({
            id: routesTable.id,
            agencyId: routesTable.agencyId,
            shortName: routesTable.shortName,
            longName: routesTable.longName,
            type: routesTable.type,
          })
          .from(routesTable)
          .where(eq(routesTable.id, routeId))
          .limit(1);

        if (!foundRoutes.length) {
          return json({ error: "Route not found" }, { status: 404 });
        }

        const validatedRoute = routeSchema.parse(foundRoutes[0]);

        return json(validatedRoute);
      } catch (error) {
        console.error("❌ Error fetching route:", error);
        return json({ error: "Internal server error" }, { status: 500 });
      }
    },
  },
);
