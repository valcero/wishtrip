import { z } from 'zod';

export const tripRequestSchema = z.object({
  origin: z.string().min(2, "Origin is required"),
  destination: z.string().min(2, "Destination is required"),
  startDate: z.string(),
  endDate: z.string(),
  travellerType: z.enum(['Solo', 'Couple', 'Family', 'Friends', 'Seniors']),
  partySize: z.number().min(1).max(20),
  interests: z.array(z.string()).min(1, "Select at least one interest"),
  pace: z.enum(['Easy-going', 'Balanced', 'Packed']),
  budget: z.enum(['Budget', 'Mid-range', 'Premium']),
});

export type TripRequest = z.infer<typeof tripRequestSchema>;
