import { json } from '@tanstack/react-start';
import { createServerFileRoute } from '@tanstack/react-start/server';
import { z } from 'zod';
import * as cheerio from 'cheerio';
import { corsMiddleware } from '~/lib/cors';
import { ExternalStopDataSchema, ExternalStopData } from '~/schemas';

// Validate `stopId` route param
const stopIdSchema = z.string().min(1, 'stopId cannot be empty');

// A very small in-memory cache to avoid hammering the Transperth real-time page
const cache = new Map<
  string,
  { data: ExternalStopData[]; timestamp: number }
>();
const CACHE_TTL_MS = 10 * 1000; // 10 seconds

export const ServerRoute = createServerFileRoute(
  '/api/stop/$stopId/externalStopData',
).methods({
  GET: async ({ request, params }) => {
    if (request.method === 'OPTIONS') {
      const corsResponse = corsMiddleware(request);
      if (corsResponse) return corsResponse;
    }

    try {
      const parsedParams = stopIdSchema.safeParse(
        (params as { stopId: string }).stopId,
      );
      if (!parsedParams.success) {
        return json({ error: 'Invalid stopId parameter' }, { status: 400 });
      }

      const stopId = parsedParams.data;

      const cached = cache.get(stopId);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return json(cached.data);
      }

      const externalUrl = `https://136213.mobi/RealTime/RealTimeStopResults.aspx?SN=${stopId}`;
      const res = await fetch(externalUrl);
      if (!res.ok) {
        throw new Error(
          `Failed to fetch external real-time page (${res.status})`,
        );
      }

      const rawHtml = await res.text();
      const $ = cheerio.load(rawHtml);
      const timetableElement = $('#pnlStopTimetable');

      if (timetableElement.length === 0) {
        return json(
          { error: 'Failed to locate timetable information on page' },
          { status: 502 },
        );
      }

      const parsedRows = parseTimetableHtml(timetableElement.html() || '');

      const validatedRows = ExternalStopDataSchema.array().parse(parsedRows);

      cache.set(stopId, { data: validatedRows, timestamp: Date.now() });

      return json(validatedRows);
    } catch (error) {
      console.error('❌ Error in stop info route:', error);
      return json({ error: 'Internal server error' }, { status: 500 });
    }
  },
});

/**
 * Scrape and parse the HTML returned by the Transperth real-time page for a stop.
 * The HTML structure looks roughly like:
 *   <div class="tpm_row_timetable" data-tripid="..." data-fleet="..."> ... </div>
 */
function parseTimetableHtml(html: string): ExternalStopData[] {
  const $ = cheerio.load(html);
  const rows: ExternalStopData[] = [];

  $('.tpm_row_timetable').each((_, el) => {
    const row = $(el);

    const tripId = row.data('tripid')?.toString() || '';
    const fleetId = row.data('fleet')?.toString() || null;

    const liveStatus =
      row.find('.tt-livetext').text().trim().toUpperCase() === 'LIVE';

    const busNumber = row.children('div').eq(0).find('span').text().trim();

    const timeUntilArrival = row
      .children('div')
      .eq(2)
      .find('strong')
      .text()
      .trim();

    let destination = row
      .children('div')
      .eq(1)
      .find('.route-display-name')
      .first()
      .text()
      .trim();

    if (destination.toLowerCase().startsWith('to ')) {
      destination = destination.substring(3).trim();
    }

    rows.push({
      liveStatus,
      busNumber,
      timeUntilArrival,
      destination,
      tripId,
      fleetId,
    });
  });

  return rows;
}
