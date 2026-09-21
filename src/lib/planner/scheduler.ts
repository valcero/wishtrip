import { TripRequest } from '@/lib/schema';
import { ScoredCandidate, DayPlan, ScheduledActivity } from './types';
import { hasTimeConflict, isOpenDuringTime, formatMinutesToTime } from './constraint-validator';


const START_OF_DAY_MINUTES = 9 * 60; // 09:00
const END_OF_DAY_MINUTES = 21 * 60; // 21:00
const TRAVEL_TIME_MINUTES = 30; // Mocked fixed travel time between places

export function buildItinerary(
  candidates: ScoredCandidate[],
  request: TripRequest,
  tripLengthDays: number,
  startDateStr: string
): DayPlan[] {
  const days: DayPlan[] = [];
  const visitedPlaceIds = new Set<string>();

  // Determine max activities per day based on Pace
  const maxActivitiesPerDay = 
    request.pace === 'Packed' ? 5 : 
    request.pace === 'Balanced' ? 4 : 3;

  const startDate = new Date(startDateStr);

  for (let dayIdx = 0; dayIdx < tripLengthDays; dayIdx++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + dayIdx);
    const dayOfWeek = currentDate.getDay(); // 0 = Sunday

    const dayActivities: ScheduledActivity[] = [];
    let currentTimeMin = START_OF_DAY_MINUTES;

    // We try to schedule activities until we hit the end of the day or activity limit
    for (const candidate of candidates) {
      if (dayActivities.length >= maxActivitiesPerDay) break;
      if (currentTimeMin >= END_OF_DAY_MINUTES) break;
      if (visitedPlaceIds.has(candidate.id)) continue;

      const duration = candidate.defaultDurationMinutes;
      const proposedEndMin = currentTimeMin + duration;

      if (proposedEndMin > END_OF_DAY_MINUTES) {
        // Doesn't fit in the remaining time for the day
        continue;
      }

      // Check Constraints
      if (isOpenDuringTime(candidate, dayOfWeek, currentTimeMin, proposedEndMin) &&
          !hasTimeConflict(currentTimeMin, proposedEndMin, dayActivities)) {
        
        // Valid placement!
        dayActivities.push({
          placeId: candidate.id,
          name: candidate.name,
          startTime: formatMinutesToTime(currentTimeMin),
          endTime: formatMinutesToTime(proposedEndMin),
          durationMinutes: duration,
          reason: candidate.matchReasons[0] || 'Highly rated for your profile.',
          estimatedCost: candidate.estimatedCost,
          category: candidate.category,
          imageUrl: candidate.imageUrl || undefined
        });

        visitedPlaceIds.add(candidate.id);

        // Advance time and add travel buffer
        currentTimeMin = proposedEndMin + TRAVEL_TIME_MINUTES;
      }
    }

    days.push({
      date: currentDate.toISOString().split('T')[0],
      dayNumber: dayIdx + 1,
      activities: dayActivities
    });
  }

  return days;
}
