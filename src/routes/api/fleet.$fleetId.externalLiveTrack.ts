import { json } from '@tanstack/react-start';
import { createServerFileRoute } from '@tanstack/react-start/server';
import { z } from 'zod';
import * as cheerio from 'cheerio';
import { corsMiddleware } from '~/lib/cors';
import {
  TripLiveDetailsSchema,
  TripLiveDetails,
  LiveTripStop,
} from '~/schemas/tripLiveDetailsSchema';

// Validate the dynamic route param
const fleetNumberSchema = z.string().min(1, 'fleetNumber cannot be empty');

// Small in-memory cache (aligns with 10 s TTL used elsewhere)
const cache = new Map<string, { data: TripLiveDetails; timestamp: number }>();
const CACHE_TTL_MS = 10 * 1000;

export const ServerRoute = createServerFileRoute(
  '/api/fleet/$fleetId/externalLiveTrack',
).methods({
  GET: async ({ request, params }) => {
    // Handle CORS pre-flight requests (browser sends OPTIONS)
    if (request.method === 'OPTIONS') {
      const corsResponse = corsMiddleware(request);
      if (corsResponse) return corsResponse;
    }

    try {
      const parsedId = fleetNumberSchema.safeParse(
        (params as { fleetId: string }).fleetId,
      );
      if (!parsedId.success) {
        return json({ error: 'Invalid fleetId parameter' }, { status: 400 });
      }

      const fleetId = parsedId.data.toLowerCase();

      // Serve from cache if fresh
      const cached = cache.get(fleetId);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return json({ data: cached.data });
      }

      // Scrape the external Transperth live-trip page
      const externalUrl = `https://136213.mobi/RealTime/RealTimeFleetTrip.aspx?nq=false&fleet=${fleetId}`;
      const res = await fetch(externalUrl);
      if (!res.ok) {
        return json(
          { error: 'Failed to fetch external page' },
          {
            status: res.status,
          },
        );
      }

      const rawHtml = await res.text();
      const parsedData = parseLiveTripHtml(rawHtml);

      // Validate against runtime schema – provides type-safety at boundary
      const validated = TripLiveDetailsSchema.parse(parsedData);

      cache.set(fleetId, { data: validated, timestamp: Date.now() });

      return json({ data: validated });
    } catch (err) {
      console.error('❌ Error in live-trip route:', err);
      return json({ error: 'Internal server error' }, { status: 500 });
    }
  },
});

/**
 * Parses the HTML returned from the Transperth live trip page.
 */
function parseLiveTripHtml(html: string): TripLiveDetails {
  const $ = cheerio.load(html);

  const routeNumberText = $('#lblTripHeading').text().trim(); // e.g. "Route 584"
  const routeNumber = routeNumberText.replace('Route ', '').trim() || null;

  const fleetNumberText = $('#lblTripHeading2').text().trim(); // e.g. " with bus 2615"
  const associatedFleetNumber =
    fleetNumberText.replace(' with bus ', '').trim() || null;

  const serviceAlertLink = $('#interruption_link');
  const serviceAlert = serviceAlertLink.text().trim() || null;

  const stops: LiveTripStop[] = [];
  $('#serverSideRenderList')
    .find('.tpm_row_fleettrip_wrap')
    .each((_, el) => {
      const row = $(el);

      const stopName = row.find('.service-stop-name').text().trim();
      const stopNumberText = row.find('.service-stop-number').text().trim();
      const stopNumber = stopNumberText.replace('Stop ', '').trim();
      const time = row.find('.service-time').text().trim();

      let status = 'Unknown';
      if (row.hasClass('Departed')) {
        status = 'Departed';
      } else if (row.hasClass('Predicted')) {
        status = 'Predicted';
      } else {
        const statusFlag = row.find('.service-status-flag').text().trim();
        if (statusFlag) status = statusFlag.replace(/[()]/g, '').trim();
      }

      if (stopName && stopNumber && time) {
        stops.push({ stopName, stopNumber, time, status });
      }
    });

  return {
    routeNumber,
    associatedFleetNumber,
    serviceAlert,
    stops,
  };
}
