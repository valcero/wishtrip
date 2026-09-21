import { CandidatePlace, ScheduledActivity } from './types';

function parseTimeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

export function formatMinutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * Checks if a proposed activity overlaps with any already scheduled activities for the day.
 */
export function hasTimeConflict(
  proposedStartMin: number,
  proposedEndMin: number,
  existingActivities: ScheduledActivity[]
): boolean {
  for (const activity of existingActivities) {
    const actStart = parseTimeToMinutes(activity.startTime);
    const actEnd = parseTimeToMinutes(activity.endTime);

    // Conflict occurs if proposed time strictly overlaps with an existing time block
    // Using strictly less than/greater than to allow back-to-back activities
    if (proposedStartMin < actEnd && proposedEndMin > actStart) {
      return true;
    }
  }
  return false;
}

/**
 * Checks if the place is open during the entire proposed time block for a given day of the week.
 */
export function isOpenDuringTime(
  place: CandidatePlace,
  dayOfWeek: number, // 0 = Sunday, 1 = Monday, etc.
  proposedStartMin: number,
  proposedEndMin: number
): boolean {
  const hoursForDay = place.openingHours.find(h => h.dayOfWeek === dayOfWeek);
  
  if (!hoursForDay) {
    return false; // Assuming closed if no hours defined for the day
  }

  const openMin = parseTimeToMinutes(hoursForDay.openTime);
  const closeMin = parseTimeToMinutes(hoursForDay.closeTime);

  // If a place is open 24 hours (e.g., 00:00 to 23:59), handle gracefully
  if (openMin === 0 && closeMin >= 1439) {
    return true;
  }

  return proposedStartMin >= openMin && proposedEndMin <= closeMin;
}
