import { PlaceCategory, CostLevel } from '@prisma/client';

export interface CandidatePlace {
  id: string;
  name: string;
  category: PlaceCategory;
  latitude: number;
  longitude: number;
  defaultDurationMinutes: number;
  estimatedCost: CostLevel;
  interests: string[];
  travellerTypes: string[];
  openingHours: {
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
  }[];
  imageUrl?: string | null;
}

export interface ScoredCandidate extends CandidatePlace {
  score: number;
  matchReasons: string[];
}

export interface ScheduledActivity {
  placeId: string;
  name: string;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  durationMinutes: number;
  reason: string;
  estimatedCost: CostLevel;
  category: PlaceCategory;
  imageUrl?: string;
}

export interface DayPlan {
  date: string;
  dayNumber: number;
  activities: ScheduledActivity[];
}

export interface PlannerResult {
  days: DayPlan[];
  assumptions: string[];
  planningMetadata: {
    candidatesConsidered: number;
    candidatesFiltered: number;
    unplacedCandidates?: number;
  };
}
