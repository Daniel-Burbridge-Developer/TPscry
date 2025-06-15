import { z } from "zod";

// Schema for an individual stop within a live trip
export const LiveTripStopSchema = z.object({
  stopName: z.string(),
  stopNumber: z.string(),
  time: z.string(),
  status: z.string(), // e.g., "Departed", "Predicted", "Unknown"
});

export type LiveTripStop = z.infer<typeof LiveTripStopSchema>;

// Schema for the overall live trip details payload
export const TripLiveDetailsSchema = z.object({
  routeNumber: z.string().nullable(),
  associatedFleetNumber: z.string().nullable(),
  serviceAlert: z.string().nullable(),
  stops: LiveTripStopSchema.array(),
});

export type TripLiveDetails = z.infer<typeof TripLiveDetailsSchema>;
