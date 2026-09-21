import { describe, it, expect } from 'vitest';
import { hasTimeConflict, isOpenDuringTime, formatMinutesToTime } from '../constraint-validator';
import { scoreCandidates } from '../scorer';
import { filterCandidates } from '../candidate-filter';
import { CandidatePlace } from '../types';
import { PlaceCategory, CostLevel } from '@prisma/client';
import { TripRequest } from '@/lib/schema';

describe('Constraint Validator', () => {
  it('should format minutes to HH:MM', () => {
    expect(formatMinutesToTime(9 * 60)).toBe('09:00');
    expect(formatMinutesToTime(14 * 60 + 30)).toBe('14:30');
  });

  it('should detect time conflicts', () => {
    const existing = [
      {
        placeId: '1',
        name: 'Test',
        startTime: '10:00',
        endTime: '12:00',
        durationMinutes: 120,
        reason: '',
        estimatedCost: CostLevel.FREE,
        category: PlaceCategory.ATTRACTION
      }
    ];

    // Starts during an existing activity
    expect(hasTimeConflict(10 * 60 + 30, 11 * 60, existing)).toBe(true);
    
    // Ends during an existing activity
    expect(hasTimeConflict(9 * 60, 10 * 60 + 30, existing)).toBe(true);

    // Completely overlaps
    expect(hasTimeConflict(9 * 60, 13 * 60, existing)).toBe(true);

    // Is completely within
    expect(hasTimeConflict(10 * 60 + 10, 11 * 60 + 50, existing)).toBe(true);

    // Does not overlap (before)
    expect(hasTimeConflict(8 * 60, 10 * 60, existing)).toBe(false);

    // Does not overlap (after)
    expect(hasTimeConflict(12 * 60, 14 * 60, existing)).toBe(false);
  });

  it('should correctly check if place is open', () => {
    const place = {
      openingHours: [
        { dayOfWeek: 1, openTime: '09:00', closeTime: '17:00' }
      ]
    } as CandidatePlace;

    // Inside hours
    expect(isOpenDuringTime(place, 1, 10 * 60, 12 * 60)).toBe(true);
    
    // Outside hours (starts too early)
    expect(isOpenDuringTime(place, 1, 8 * 60, 10 * 60)).toBe(false);

    // Outside hours (ends too late)
    expect(isOpenDuringTime(place, 1, 16 * 60, 18 * 60)).toBe(false);

    // Closed day
    expect(isOpenDuringTime(place, 2, 10 * 60, 12 * 60)).toBe(false);
  });
});

describe('Scorer & Filter', () => {
  const mockCandidates: CandidatePlace[] = [
    {
      id: '1',
      name: 'Premium Sushi',
      category: PlaceCategory.RESTAURANT,
      latitude: 0, longitude: 0,
      defaultDurationMinutes: 90,
      estimatedCost: CostLevel.PREMIUM,
      interests: ['Food'],
      travellerTypes: ['Solo', 'Couple'],
      openingHours: []
    },
    {
      id: '2',
      name: 'Free Park',
      category: PlaceCategory.NATURE,
      latitude: 0, longitude: 0,
      defaultDurationMinutes: 120,
      estimatedCost: CostLevel.FREE,
      interests: ['Nature'],
      travellerTypes: ['Solo', 'Family'],
      openingHours: []
    }
  ];

  const baseRequest: TripRequest = {
    origin: 'NY', destination: 'Tokyo',
    startDate: '2023-01-01', endDate: '2023-01-02',
    travellerType: 'Solo',
    partySize: 1,
    interests: [],
    pace: 'Balanced',
    budget: 'Mid-range'
  };

  it('filters out incompatible traveller types', () => {
    const req = { ...baseRequest, travellerType: 'Family' as const };
    const filtered = filterCandidates(mockCandidates, req);
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe('2'); // Premium Sushi does not support Family
  });

  it('filters out premium places for strict budget travellers', () => {
    const req = { ...baseRequest, budget: 'Budget' as const };
    const filtered = filterCandidates(mockCandidates, req);
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe('2'); // Premium Sushi is dropped
  });

  it('scores places matching interests higher', () => {
    const req = { ...baseRequest, interests: ['Food'] };
    const scored = scoreCandidates(mockCandidates, req);
    // Premium Sushi should be scored higher because of the Food interest
    expect(scored[0].id).toBe('1');
    expect(scored[0].score).toBeGreaterThan(scored[1].score);
  });
});
