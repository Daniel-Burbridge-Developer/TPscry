import { json } from '@tanstack/react-start';
import { createServerFileRoute } from '@tanstack/react-start/server';
import { db } from '~/db';
import { TripSelectZodSchema, TripStop } from '~/schemas/tripSchema';
import { sql } from 'drizzle-orm';
import { corsMiddleware } from '~/lib/cors';

// This type is only used internally to type the raw SQL query result.
// The actual API response is validated by TripSelectZodSchema,
// ensuring type safety at the API boundary.
type TripRecord = {
  id: string;
  route_id: string;
  service_id: string;
  direction_id: number;
  trip_headsign: string;
  shape_id: string | null;
  stops: TripStop[] | null;
};

export const ServerRoute = createServerFileRoute(
  '/api/route/$routeId/trips',
).methods({
  GET: async ({ request, params }) => {
    console.log('🚌 Trips route called with params:', params);
    console.log('🚌 Request URL:', request.url);

    // Handle CORS only for OPTIONS requests
    if (request.method === 'OPTIONS') {
      console.log('🚌 Handling OPTIONS request');
      const corsResponse = corsMiddleware(request);
      if (corsResponse) {
        console.log('🚌 Returning CORS response');
        return corsResponse;
      }
    }

    try {
      console.log('🚌 Fetching trips for routeId:', params.routeId);

      // Use a subquery with DISTINCT ON to get one trip per unique tripHeadsign
      const result = await db.execute<TripRecord>(sql`
        SELECT DISTINCT ON (trip_headsign) 
          id, route_id, service_id, direction_id, trip_headsign, shape_id, stops
        FROM trips
        WHERE route_id = ${params.routeId}
        ORDER BY trip_headsign, id
      `);

      const routeTrips = result.rows;
      console.log('🚌 Found trips:', routeTrips);

      if (!routeTrips.length) {
        console.log('🚌 No trips found for routeId:', params.routeId);
        return json(
          { error: 'No trips found for this route' },
          { status: 404 },
        );
      }

      // Ensure stops is always an array and has all required fields
      const tripsWithStops = routeTrips.map((trip) => ({
        id: trip.id,
        routeId: trip.route_id,
        serviceId: trip.service_id,
        directionId: trip.direction_id,
        tripHeadsign: trip.trip_headsign,
        shapeId: trip.shape_id,
        stops: ((trip.stops as TripStop[] | null) || []).map(
          (stop: Partial<TripStop>, index: number) => ({
            id: stop.id || '',
            arrivalTime: stop.arrivalTime || '',
            Sequence: stop.Sequence || index + 1, // Use index + 1 as fallback for Sequence
          }),
        ),
      }));

      console.log('🚌 Trips with ensured stops:', tripsWithStops);

      // Validate trips against schema
      const validatedTrips = TripSelectZodSchema.array().parse(tripsWithStops);
      console.log('🚌 Validated trips:', validatedTrips);

      return json(validatedTrips);
    } catch (error) {
      console.error('❌ Error fetching trips:', error);
      if (error instanceof Error) {
        console.error('❌ Validation error details:', error.message);
      }
      return json({ error: 'Internal server error' }, { status: 500 });
    }
  },
});
