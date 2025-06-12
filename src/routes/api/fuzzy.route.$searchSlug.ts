import { json } from '@tanstack/react-start';
import { createServerFileRoute } from '@tanstack/react-start/server';
import { db } from '~/db';
import { routes } from '~/db/schema/routes';
import { routeSchema } from '~/schemas/routeSchema';
import { corsMiddleware } from '~/lib/cors';
import { ilike, or } from 'drizzle-orm';

export const ServerRoute = createServerFileRoute(
  '/api/fuzzy/route/$searchSlug',
).methods({
  GET: async ({ request, params }) => {
    console.log('🔍 Fuzzy route search called with params:', params);
    console.log('🔍 Request URL:', request.url);

    // Handle CORS only for OPTIONS requests
    if (request.method === 'OPTIONS') {
      console.log('🔍 Handling OPTIONS request');
      const corsResponse = corsMiddleware(request);
      if (corsResponse) {
        console.log('🔍 Returning CORS response');
        return corsResponse;
      }
    }

    try {
      const searchTerm = `%${params.searchSlug}%`;
      console.log('🔍 Search term:', searchTerm);

      // Search in both shortName and longName
      console.log('🔍 Executing database query...');
      const matchingRoutes = await db
        .select({
          id: routes.id,
          agencyId: routes.agencyId,
          shortName: routes.shortName,
          longName: routes.longName,
          type: routes.type,
        })
        .from(routes)
        .where(
          or(
            ilike(routes.shortName, searchTerm),
            ilike(routes.longName, searchTerm),
          ),
        )
        .limit(5);

      console.log('🔍 Found routes:', matchingRoutes);

      // Validate routes against schema
      const validatedRoutes = routeSchema.array().parse(matchingRoutes);
      console.log('🔍 Validated routes:', validatedRoutes);

      return json(validatedRoutes);
    } catch (error) {
      console.error('❌ Error searching routes:', error);
      return json({ error: 'Internal server error' }, { status: 500 });
    }
  },
});
