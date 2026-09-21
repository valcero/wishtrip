import { TripRequest } from '@/lib/schema';
import { CandidatePlace, ScoredCandidate } from './types';
import { CostLevel, PlaceCategory } from '@prisma/client';

export function scoreCandidates(candidates: CandidatePlace[], request: TripRequest): ScoredCandidate[] {
  return candidates.map(place => {
    let score = 0;
    const matchReasons: string[] = [];

    // 1. Interest Match
    const matchingInterests = place.interests.filter(i => request.interests.includes(i));
    if (matchingInterests.length > 0) {
      score += matchingInterests.length * 5;
      matchReasons.push(`Matches interests: ${matchingInterests.join(', ')}`);
    }

    // 2. Budget Match
    if (request.budget === 'Budget') {
      if (place.estimatedCost === CostLevel.FREE) {
        score += 5;
        matchReasons.push('Free activity, great for budget.');
      } else if (place.estimatedCost === CostLevel.BUDGET) {
        score += 3;
      } else if (place.estimatedCost === CostLevel.MID_RANGE) {
        score -= 2;
      }
    } else if (request.budget === 'Premium') {
      if (place.estimatedCost === CostLevel.PREMIUM) {
        score += 5;
        matchReasons.push('Premium experience.');
      }
    }

    // 3. Pace & Category Match
    if (request.pace === 'Packed' && (place.category === PlaceCategory.ATTRACTION || place.category === PlaceCategory.SHOPPING)) {
      score += 3;
      matchReasons.push('Fits a packed, high-energy pace.');
    } else if (request.pace === 'Easy-going' && (place.category === PlaceCategory.NATURE || place.category === PlaceCategory.RESTAURANT)) {
      score += 4;
      matchReasons.push('Fits an easy-going, relaxed pace.');
    }

    // 4. Default baseline scoring (everything gets a slight boost to keep it above 0 if valid)
    score += 1;

    return {
      ...place,
      score,
      matchReasons
    };
  }).sort((a, b) => b.score - a.score); // Sort highest score first
}
