import { NextResponse } from 'next/server';
import { tripRequestSchema } from '@/lib/schema';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate request body
    const validatedData = tripRequestSchema.parse(body);

    // TODO (Step 2): Implement the actual deterministic planning engine here
    // For Step 1, we return a mocked structured response that matches the required output

    const mockResponse = {
      trip: validatedData,
      days: [
        {
          date: validatedData.startDate,
          dayNumber: 1,
          activities: [
            {
              placeId: 'mock-place-id',
              name: 'Senso-ji Temple',
              startTime: '10:00',
              endTime: '12:00',
              durationMinutes: 120,
              reason: 'Matches your interest in Culture.',
              estimatedCost: 0,
            }
          ],
          estimatedDailyCost: 0,
        }
      ],
      assumptions: ['Assuming standard opening hours for now.'],
      planningMetadata: {
        candidatesConsidered: 10,
        candidatesFiltered: 2,
      }
    };

    return NextResponse.json(mockResponse);

  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
