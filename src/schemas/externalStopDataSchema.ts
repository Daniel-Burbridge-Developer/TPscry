import { z } from "zod";

export const ExternalStopDataSchema = z.object({
  liveStatus: z.boolean(),
  busNumber: z.string(),
  timeUntilArrival: z.string(),
  destination: z.string(),
  tripId: z.string(),
  fleetId: z.string().nullable(),
});

export type ExternalStopData = z.infer<typeof ExternalStopDataSchema>;
