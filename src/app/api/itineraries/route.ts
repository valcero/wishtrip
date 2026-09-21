import { NextResponse } from 'next/server';
import { tripRequestSchema } from '@/lib/schema';
import { generateItinerary } from '@/lib/planner/engine';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate request body
    const validatedData = tripRequestSchema.parse(body);

    // Generate itinerary using the deterministic planning engine
    const result = await generateItinerary(validatedData);

    // Return the structured JSON representing the complete itinerary
    const responsePayload = {
      trip: validatedData,
      days: result.days,
      assumptions: result.assumptions,
      planningMetadata: result.planningMetadata
    };

    return NextResponse.json(responsePayload);

  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
