import { TripRequest } from '@/lib/schema';
import { PlannerResult, CandidatePlace } from './types';
import { filterCandidates } from './candidate-filter';
import { scoreCandidates } from './scorer';
import { buildItinerary } from './scheduler';
import { PrismaClient } from '@prisma/client';
import { differenceInDays, parseISO } from 'date-fns';

const prisma = new PrismaClient();

export async function generateItinerary(request: TripRequest): Promise<PlannerResult> {
  // 1. Fetch raw data from the destination (e.g. Tokyo)
  // For the prototype, we assume Destination is 'Tokyo'
  const destinationRecord = await prisma.destination.findFirst({
    where: { name: 'Tokyo' },
  });

  if (!destinationRecord) {
    throw new Error("Destination 'Tokyo' not found in database.");
  }

  const rawPlaces = await prisma.place.findMany({
    where: { destinationId: destinationRecord.id },
    include: {
      interests: { include: { interest: true } },
      travellerTypes: { include: { travellerType: true } },
      openingHours: true,
    }
  });

  // Map Prisma models to internal Planner models
  const candidates: CandidatePlace[] = rawPlaces.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    latitude: p.latitude,
    longitude: p.longitude,
    defaultDurationMinutes: p.defaultDurationMinutes,
    estimatedCost: p.estimatedCost,
    interests: p.interests.map(i => i.interest.name),
    travellerTypes: p.travellerTypes.map(t => t.travellerType.name),
    openingHours: p.openingHours.map(oh => ({
      dayOfWeek: oh.dayOfWeek,
      openTime: oh.openTime,
      closeTime: oh.closeTime
    }))
  }));

  // 2. Filter Candidates (Hard Constraints)
  const filteredCandidates = filterCandidates(candidates, request);

  // 3. Score Candidates (Soft Preferences)
  const scoredCandidates = scoreCandidates(filteredCandidates, request);

  // 4. Calculate Trip Length
  // +1 because if start and end are the same day, it's a 1-day trip
  let tripLengthDays = differenceInDays(parseISO(request.endDate), parseISO(request.startDate)) + 1;
  
  if (tripLengthDays < 1) tripLengthDays = 1;
  if (tripLengthDays > 14) tripLengthDays = 14; // Cap at 14 days for safety

  // 5. Schedule Allocation
  const days = buildItinerary(scoredCandidates, request, tripLengthDays, request.startDate);

  // Calculate unplaced candidates for metadata
  const scheduledCount = days.reduce((acc, day) => acc + day.activities.length, 0);

  return {
    days,
    assumptions: [
      'Travel time between places is assumed to be a fixed 30 minutes for prototype simplicity.',
      'Activities are constrained between 09:00 and 21:00 daily.'
    ],
    planningMetadata: {
      candidatesConsidered: candidates.length,
      candidatesFiltered: candidates.length - filteredCandidates.length,
      unplacedCandidates: scoredCandidates.length - scheduledCount
    }
  };
}
