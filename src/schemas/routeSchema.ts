import { z } from "zod";

export const routeSchema = z.object({
  id: z.string(),
  agencyId: z.string(),
  shortName: z.string().nullable(),
  longName: z.string().nullable(),
  type: z.number(),
});

export type Route = z.infer<typeof routeSchema>;
//Work around as could not create with drizzle-zod due to JsonB
export type NewRoute = z.infer<typeof routeSchema>;
