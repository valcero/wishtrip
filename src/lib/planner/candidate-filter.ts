import { TripRequest } from '@/lib/schema';
import { CandidatePlace } from './types';
import { CostLevel } from '@prisma/client';

export function filterCandidates(candidates: CandidatePlace[], request: TripRequest): CandidatePlace[] {
  return candidates.filter((place) => {
    // 1. Traveller Type Hard Constraint
    // If a place has defined traveller types and the user's type isn't one of them, drop it.
    if (place.travellerTypes.length > 0 && !place.travellerTypes.includes(request.travellerType)) {
      return false;
    }

    // 2. Extreme Budget Hard Constraint
    // If user is on a Budget, completely drop PREMIUM places to guarantee no sticker shock.
    if (request.budget === 'Budget' && place.estimatedCost === CostLevel.PREMIUM) {
      return false;
    }

    // 3. (Future Expansion) If a place is completely closed during the entire trip duration,
    // we could filter it here. For now, daily scheduling will handle day-of-week opening hours.

    return true;
  });
}
